const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

class ExpenseMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'expense-tracker-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_transactions',
          description: 'Get all transactions for a user with optional filters (category, type, date range)',
          inputSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'MongoDB ObjectId of the user',
              },
              category: {
                type: 'string',
                description: 'Optional category name filter',
              },
              type: {
                type: 'string',
                description: 'Optional type filter (income or expense)',
                enum: ['income', 'expense'],
              },
              startDate: {
                type: 'string',
                description: 'Optional start date for filtering (ISO format)',
              },
              endDate: {
                type: 'string',
                description: 'Optional end date for filtering (ISO format)',
              },
            },
            required: ['userId'],
          },
        },
        {
          name: 'create_transaction',
          description: 'Create a new transaction (expense or income)',
          inputSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'MongoDB ObjectId of the user',
              },
              amount: {
                type: 'number',
                description: 'Transaction amount (positive number)',
              },
              category: {
                type: 'string',
                description: 'Transaction category name',
              },
              type: {
                type: 'string',
                description: 'Transaction type (income or expense)',
                enum: ['income', 'expense'],
              },
              date: {
                type: 'string',
                description: 'Transaction date (ISO format)',
              },
              description: {
                type: 'string',
                description: 'Optional description',
              },
            },
            required: ['userId', 'amount', 'category', 'type', 'date'],
          },
        },
        {
          name: 'get_summary',
          description: 'Get expense summary with aggregations by category, type, or date range',
          inputSchema: {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                description: 'MongoDB ObjectId of the user',
              },
              categories: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Optional array of category names to include in summary',
              },
              type: {
                type: 'string',
                description: 'Optional type filter (income or expense)',
                enum: ['income', 'expense'],
              },
              startDate: {
                type: 'string',
                description: 'Optional start date (ISO format)',
              },
              endDate: {
                type: 'string',
                description: 'Optional end date (ISO format)',
              },
            },
            required: ['userId'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'list_transactions':
            return await this.handleListTransactions(request.params.arguments);
          case 'create_transaction':
            return await this.handleCreateTransaction(request.params.arguments);
          case 'get_summary':
            return await this.handleGetSummary(request.params.arguments);
          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async findOrCreateCategory(categoryName, userId) {
    const trimmed = categoryName.trim();
    let category = await Category.findOne({
      user_id: userId,
      name: { $regex: new RegExp(`^${trimmed}$`, 'i') },
    });
    if (!category) {
      category = await Category.create({ user_id: userId, name: trimmed, is_default: false });
    }
    return category;
  }

  async handleListTransactions(args) {
    const { userId, category, type, startDate, endDate } = args;

    const matchQuery = { user_id: new mongoose.Types.ObjectId(userId) };

    if (type) matchQuery.type = type;

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $addFields: {
          category_name: { $arrayElemAt: ['$category.name', 0] },
        },
      },
      { $project: { category: 0 } },
    ];

    if (category) {
      pipeline.push({ $match: { category_name: { $regex: new RegExp(category, 'i') } } });
    }

    pipeline.push({ $sort: { date: -1 } });

    const transactions = await Transaction.aggregate(pipeline);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            count: transactions.length,
            transactions,
          }, null, 2),
        },
      ],
    };
  }

  async handleCreateTransaction(args) {
    const { userId, amount, category, type, date, description } = args;

    if (!amount || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      throw new Error('Category is required');
    }

    if (!['income', 'expense'].includes(type)) {
      throw new Error('Type must be either "income" or "expense"');
    }

    const categoryDoc = await this.findOrCreateCategory(category, userId);

    const newTransaction = new Transaction({
      user_id: userId,
      category_id: categoryDoc._id,
      amount: parseFloat(amount),
      type,
      date: new Date(date),
      description: description || '',
    });

    const savedTransaction = await newTransaction.save();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Transaction created successfully',
            transaction: {
              ...savedTransaction.toObject(),
              category_name: categoryDoc.name,
            },
          }, null, 2),
        },
      ],
    };
  }

  async handleGetSummary(args) {
    const { userId, categories, type, startDate, endDate } = args;

    const matchQuery = { user_id: new mongoose.Types.ObjectId(userId) };

    if (type) matchQuery.type = type;

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'categories',
          localField: 'category_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $addFields: {
          category_name: { $arrayElemAt: ['$category.name', 0] },
        },
      },
      { $project: { category: 0 } },
    ];

    if (categories && categories.length > 0) {
      pipeline.push({
        $match: {
          category_name: { $in: categories.map(c => new RegExp(c, 'i')) },
        },
      });
    }

    const transactions = await Transaction.aggregate(pipeline);

    const summary = {
      totalTransactions: transactions.length,
      totalAmount: 0,
      byCategory: {},
      byType: { income: 0, expense: 0 },
    };

    transactions.forEach((transaction) => {
      summary.totalAmount += transaction.amount;

      const catName = transaction.category_name || 'Uncategorized';
      if (!summary.byCategory[catName]) {
        summary.byCategory[catName] = { count: 0, total: 0 };
      }
      summary.byCategory[catName].count += 1;
      summary.byCategory[catName].total += transaction.amount;

      if (summary.byType[transaction.type] !== undefined) {
        summary.byType[transaction.type] += transaction.amount;
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            summary,
            transactions,
          }, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Expense Tracker MCP server running on stdio');
  }
}

module.exports = { ExpenseMCPServer };
