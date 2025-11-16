const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const Transaction = require('../models/transactionModel');

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
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_transactions',
          description: 'Get all transactions for a user with optional filters (category, type, date range)',
          inputSchema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                description: 'Username of the user',
              },
              category: {
                type: 'string',
                description: 'Optional category filter',
              },
              type: {
                type: 'string',
                description: 'Optional type filter (budget or expense)',
                enum: ['budget', 'expense'],
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
            required: ['username'],
          },
        },
        {
          name: 'create_transaction',
          description: 'Create a new transaction (expense or budget)',
          inputSchema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                description: 'Username of the user',
              },
              amount: {
                type: 'number',
                description: 'Transaction amount (positive number)',
              },
              category: {
                type: 'string',
                description: 'Transaction category',
              },
              type: {
                type: 'string',
                description: 'Transaction type (budget or expense)',
                enum: ['budget', 'expense'],
              },
              date: {
                type: 'string',
                description: 'Transaction date (ISO format)',
              },
            },
            required: ['username', 'amount', 'category', 'type', 'date'],
          },
        },
        {
          name: 'update_transaction',
          description: 'Update an existing transaction',
          inputSchema: {
            type: 'object',
            properties: {
              transactionId: {
                type: 'string',
                description: 'ID of the transaction to update',
              },
              amount: {
                type: 'number',
                description: 'New amount',
              },
              category: {
                type: 'string',
                description: 'New category',
              },
              type: {
                type: 'string',
                description: 'New type (budget or expense)',
                enum: ['budget', 'expense'],
              },
            },
            required: ['transactionId'],
          },
        },
        {
          name: 'delete_transaction',
          description: 'Delete a transaction by ID',
          inputSchema: {
            type: 'object',
            properties: {
              transactionId: {
                type: 'string',
                description: 'ID of the transaction to delete',
              },
            },
            required: ['transactionId'],
          },
        },
        {
          name: 'get_summary',
          description: 'Get expense summary with aggregations by category, type, or date range',
          inputSchema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
                description: 'Username of the user',
              },
              categories: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Optional array of categories to include in summary',
              },
              type: {
                type: 'string',
                description: 'Optional type filter (budget or expense)',
                enum: ['budget', 'expense'],
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
            required: ['username'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'list_transactions':
            return await this.handleListTransactions(request.params.arguments);
          case 'create_transaction':
            return await this.handleCreateTransaction(request.params.arguments);
          case 'update_transaction':
            return await this.handleUpdateTransaction(request.params.arguments);
          case 'delete_transaction':
            return await this.handleDeleteTransaction(request.params.arguments);
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

  async handleListTransactions(args) {
    const { username, category, type, startDate, endDate } = args;
    
    let query = { username };
    
    if (category) {
      query.category = category;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            count: transactions.length,
            transactions: transactions,
          }, null, 2),
        },
      ],
    };
  }

  async handleCreateTransaction(args) {
    const { username, amount, category, type, date } = args;

    // Validation
    if (!username || typeof username !== 'string' || username.trim() === '') {
      throw new Error('Valid username is required');
    }

    if (!amount || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      throw new Error('Category is required');
    }

    if (!['budget', 'expense'].includes(type)) {
      throw new Error('Type must be either "budget" or "expense"');
    }

    const sanitizedCategory = category.trim().replace(/[<>]/g, '');

    const newTransaction = new Transaction({
      username: username.trim(),
      amount: parseFloat(amount),
      category: sanitizedCategory,
      type,
      date: new Date(date),
    });

    const savedTransaction = await newTransaction.save();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Transaction created successfully',
            transaction: savedTransaction,
          }, null, 2),
        },
      ],
    };
  }

  async handleUpdateTransaction(args) {
    const { transactionId, amount, category, type } = args;

    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    const updateFields = {};

    if (amount !== undefined) {
      if (amount <= 0) {
        throw new Error('Amount must be a positive number');
      }
      updateFields.amount = parseFloat(amount);
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim() === '') {
        throw new Error('Category cannot be empty');
      }
      updateFields.category = category.trim().replace(/[<>]/g, '');
    }

    if (type !== undefined) {
      if (!['budget', 'expense'].includes(type)) {
        throw new Error('Type must be either "budget" or "expense"');
      }
      updateFields.type = type;
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      updateFields,
      { new: true }
    );

    if (!updatedTransaction) {
      throw new Error('Transaction not found');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Transaction updated successfully',
            transaction: updatedTransaction,
          }, null, 2),
        },
      ],
    };
  }

  async handleDeleteTransaction(args) {
    const { transactionId } = args;

    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);

    if (!deletedTransaction) {
      throw new Error('Transaction not found');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Transaction deleted successfully',
            transaction: deletedTransaction,
          }, null, 2),
        },
      ],
    };
  }

  async handleGetSummary(args) {
    const { username, categories, type, startDate, endDate } = args;

    let query = { username };

    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const transactions = await Transaction.find(query);

    // Calculate totals
    const summary = {
      totalTransactions: transactions.length,
      totalAmount: 0,
      byCategory: {},
      byType: { budget: 0, expense: 0 },
    };

    transactions.forEach((transaction) => {
      summary.totalAmount += transaction.amount;

      // By category
      if (!summary.byCategory[transaction.category]) {
        summary.byCategory[transaction.category] = {
          count: 0,
          total: 0,
        };
      }
      summary.byCategory[transaction.category].count += 1;
      summary.byCategory[transaction.category].total += transaction.amount;

      // By type
      summary.byType[transaction.type] += transaction.amount;
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            summary: summary,
            transactions: transactions,
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

// Export for use in chat controller
module.exports = { ExpenseMCPServer };

