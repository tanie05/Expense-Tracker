const { GoogleGenerativeAI } = require('@google/generative-ai');
const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

// Define tool declarations for Gemini function calling
// User identity is NOT passed as a parameter — it comes from the JWT on each request
const tools = [
  {
    functionDeclarations: [
      {
        name: 'list_transactions',
        description: 'Get all transactions for a user with optional filters by category, type (income/expense), and date range. Use this when user asks to see, show, or list their transactions.',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Optional category name filter',
            },
            type: {
              type: 'string',
              description: 'Optional type filter',
              enum: ['income', 'expense'],
            },
            startDate: {
              type: 'string',
              description: 'Optional start date for filtering in ISO format (YYYY-MM-DD)',
            },
            endDate: {
              type: 'string',
              description: 'Optional end date for filtering in ISO format (YYYY-MM-DD)',
            },
          },
          required: [],
        },
      },
      {
        name: 'create_transaction',
        description: 'Create a new transaction (expense or income). Use this when user wants to add, create, or record a new expense or income.',
        parameters: {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              description: 'Transaction amount (must be positive)',
            },
            category: {
              type: 'string',
              description: 'Transaction category name (e.g., lunch, dinner, groceries, rent, utilities)',
            },
            type: {
              type: 'string',
              description: 'Transaction type',
              enum: ['income', 'expense'],
            },
            date: {
              type: 'string',
              description: 'Transaction date in ISO format (YYYY-MM-DD). If user says "today", use current date.',
            },
            description: {
              type: 'string',
              description: 'Optional description for the transaction',
            },
          },
          required: ['amount', 'category', 'type', 'date'],
        },
      },
      {
        name: 'get_summary',
        description: 'Get expense summary with aggregations. Use this when user asks for summaries, totals, or wants to know how much they spent on certain categories or types.',
        parameters: {
          type: 'object',
          properties: {
            categories: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of category names to include in summary. Use semantic understanding - e.g., if user asks for "food expenses", include categories like lunch, dinner, groceries, restaurant, etc.',
            },
            type: {
              type: 'string',
              description: 'Optional type filter',
              enum: ['income', 'expense'],
            },
            startDate: {
              type: 'string',
              description: 'Optional start date in ISO format (YYYY-MM-DD)',
            },
            endDate: {
              type: 'string',
              description: 'Optional end date in ISO format (YYYY-MM-DD)',
            },
          },
          required: [],
        },
      },
    ],
  },
];

// Tool execution functions — userId is injected server-side from JWT, never from AI args
async function executeFunction(functionName, args, userId) {
  switch (functionName) {
    case 'list_transactions':
      return await listTransactions(args, userId);
    case 'create_transaction':
      return await createTransaction(args, userId);
    case 'get_summary':
      return await getSummary(args, userId);
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}

async function findOrCreateCategory(categoryName, userId) {
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

async function listTransactions(args, userId) {
  const { category, type, startDate, endDate } = args;

  const matchQuery = { user_id: new mongoose.Types.ObjectId(userId) };

  if (type) {
    matchQuery.type = type;
  }

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
    success: true,
    count: transactions.length,
    transactions,
  };
}

async function createTransaction(args, userId) {
  const { amount, category, type, date, description } = args;

  if (!amount || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    throw new Error('Category is required');
  }

  if (!['income', 'expense'].includes(type)) {
    throw new Error('Type must be either "income" or "expense"');
  }

  const categoryDoc = await findOrCreateCategory(category, userId);

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
    success: true,
    message: 'Transaction created successfully',
    transaction: {
      ...savedTransaction.toObject(),
      category_name: categoryDoc.name,
    },
  };
}

async function getSummary(args, userId) {
  const { categories, type, startDate, endDate } = args;

  const matchQuery = { user_id: new mongoose.Types.ObjectId(userId) };

  if (type) {
    matchQuery.type = type;
  }

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
    success: true,
    summary,
    transactions,
  };
}

async function buildSystemPrompt(userId) {
  const recentTransactions = await Transaction.aggregate([
    { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
    { $sort: { date: -1 } },
    { $limit: 100 },
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
  ]);

  const categories = [...new Set(recentTransactions.map(t => t.category_name).filter(Boolean))];

  return `You are an AI assistant for an expense tracking application. Your role is to help users manage their expenses and budgets through natural conversation.

IMPORTANT CAPABILITIES:
- You can list and search transactions by category, type, and date range
- You can create new transactions (expense or income)
- You can provide expense summaries and analytics
- You must use the provided functions to interact with the database
- You cannot update or delete existing transactions — politely let the user know if they ask

USER CONTEXT:
- Existing categories in their account: ${categories.join(', ') || 'None yet'}

SEMANTIC UNDERSTANDING RULES:
When users ask about categories in natural language, use your understanding to match semantically related categories:
- "food expenses" or "food spending" → should include: lunch, dinner, groceries, restaurant, food, snacks, etc.
- "home expenses" or "house costs" → should include: rent, utilities, mortgage, furniture, repairs, etc.
- "transportation" or "travel costs" → should include: gas, uber, taxi, parking, public transport, car, etc.
- "entertainment" → should include: movies, games, concerts, subscriptions, streaming, etc.

DATE UNDERSTANDING:
- "today" → use current date
- "yesterday" → use previous day
- "this week" → use date range from start of current week to today
- "last week" → use date range for previous week
- "this month" → use date range from start of current month to today
- "last month" → use date range for previous month

RESPONSE STYLE:
- Be conversational and friendly
- Keep responses concise but informative
- When showing transactions, format them clearly
- When creating/updating/deleting, confirm the action
- For summaries, provide clear breakdowns with totals
- If something is ambiguous, ask for clarification

EXAMPLE INTERACTIONS:
User: "Add $50 lunch expense for today"
→ Use create_transaction with amount=50, category="lunch", type="expense", date=today

User: "How much did I spend on food?"
→ Use get_summary with categories=["lunch", "dinner", "groceries", "restaurant", "food", "snacks"] (based on semantic understanding and available categories)

User: "Show me my expenses from last week"
→ Use list_transactions with type="expense" and appropriate date range

User: "Delete that transaction" or "Update my last expense"
→ Politely explain that editing and deleting via chat is not supported yet, and they can do it from the Transactions page

Current date: ${new Date().toISOString().split('T')[0]}

Remember: Always use the provided functions to interact with data. Never make up transaction IDs or data.`;
}

// Main chat handler
const handleChatMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user._id; // From auth middleware — never trust client-supplied user identity

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: tools,
    });

    const systemPrompt = await buildSystemPrompt(userId);

    const history = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I will help you manage your expenses and budgets using the available functions. How can I assist you today?' }],
        },
        ...history,
      ],
    });

    let result = await chat.sendMessage(message);
    let response = result.response;

    while (response.functionCalls && typeof response.functionCalls === 'function') {
      const functionCalls = response.functionCalls();

      if (!functionCalls || functionCalls.length === 0) {
        break;
      }

      const functionResponses = [];

      for (const functionCall of functionCalls) {
        try {
          const functionResult = await executeFunction(functionCall.name, functionCall.args, userId);

          functionResponses.push({
            functionResponse: {
              name: functionCall.name,
              response: functionResult,
            },
          });
        } catch (error) {
          functionResponses.push({
            functionResponse: {
              name: functionCall.name,
              response: { error: error.message },
            },
          });
        }
      }

      result = await chat.sendMessage(functionResponses);
      response = result.response;
    }

    const aiResponse = response.text();

    return res.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error('Chat error:', error);

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: "Oh no, something's wrong! The AI assistant is temporarily unavailable due to high demand. Please try again in a moment.",
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error processing chat message',
      error: error.message,
    });
  }
};

// Get user context (recent categories) — uses JWT, no URL param needed
const getUserContext = async (req, res) => {
  try {
    const userId = req.user._id;

    const recentTransactions = await Transaction.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
      { $sort: { date: -1 } },
      { $limit: 50 },
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
    ]);

    const categories = [...new Set(recentTransactions.map(t => t.category_name).filter(Boolean))];

    return res.json({
      success: true,
      categories,
      recentTransactionsCount: recentTransactions.length,
    });
  } catch (error) {
    console.error('Error getting user context:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user context',
    });
  }
};

module.exports = {
  handleChatMessage,
  getUserContext,
};
