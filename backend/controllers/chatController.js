const { GoogleGenerativeAI } = require('@google/generative-ai');
const Transaction = require('../models/transactionModel');

// Note: genAI is initialized inside the handler to ensure .env is loaded first

// Define tool declarations for Gemini function calling
const tools = [
  {
    functionDeclarations: [
      {
        name: 'list_transactions',
        description: 'Get all transactions for a user with optional filters by category, type (budget/expense), and date range. Use this when user asks to see, show, or list their transactions.',
        parameters: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Username of the user',
            },
            category: {
              type: 'string',
              description: 'Optional category filter - can be a single category or you can call this multiple times for multiple categories',
            },
            type: {
              type: 'string',
              description: 'Optional type filter',
              enum: ['budget', 'expense'],
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
          required: ['username'],
        },
      },
      {
        name: 'create_transaction',
        description: 'Create a new transaction (expense or budget). Use this when user wants to add, create, or record a new expense or budget.',
        parameters: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Username of the user',
            },
            amount: {
              type: 'number',
              description: 'Transaction amount (must be positive)',
            },
            category: {
              type: 'string',
              description: 'Transaction category (e.g., lunch, dinner, groceries, rent, utilities)',
            },
            type: {
              type: 'string',
              description: 'Transaction type',
              enum: ['budget', 'expense'],
            },
            date: {
              type: 'string',
              description: 'Transaction date in ISO format (YYYY-MM-DD). If user says "today", use current date.',
            },
          },
          required: ['username', 'amount', 'category', 'type', 'date'],
        },
      },
      {
        name: 'update_transaction',
        description: 'Update an existing transaction. Use this when user wants to modify, change, or update a transaction.',
        parameters: {
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
              description: 'New type',
              enum: ['budget', 'expense'],
            },
          },
          required: ['transactionId'],
        },
      },
      {
        name: 'delete_transaction',
        description: 'Delete a transaction by ID. Use this when user wants to remove or delete a transaction.',
        parameters: {
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
        description: 'Get expense summary with aggregations. Use this when user asks for summaries, totals, or wants to know how much they spent on certain categories or types.',
        parameters: {
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
              description: 'Array of categories to include in summary. Use semantic understanding - e.g., if user asks for "food expenses", include categories like lunch, dinner, groceries, restaurant, etc.',
            },
            type: {
              type: 'string',
              description: 'Optional type filter',
              enum: ['budget', 'expense'],
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
          required: ['username'],
        },
      },
    ],
  },
];

// Tool execution functions
async function executeFunction(functionName, args) {
  switch (functionName) {
    case 'list_transactions':
      return await listTransactions(args);
    case 'create_transaction':
      return await createTransaction(args);
    case 'update_transaction':
      return await updateTransaction(args);
    case 'delete_transaction':
      return await deleteTransaction(args);
    case 'get_summary':
      return await getSummary(args);
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
}

async function listTransactions(args) {
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
    success: true,
    count: transactions.length,
    transactions: transactions,
  };
}

async function createTransaction(args) {
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
    success: true,
    message: 'Transaction created successfully',
    transaction: savedTransaction,
  };
}

async function updateTransaction(args) {
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
    success: true,
    message: 'Transaction updated successfully',
    transaction: updatedTransaction,
  };
}

async function deleteTransaction(args) {
  const { transactionId } = args;

  if (!transactionId) {
    throw new Error('Transaction ID is required');
  }

  const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);

  if (!deletedTransaction) {
    throw new Error('Transaction not found');
  }

  return {
    success: true,
    message: 'Transaction deleted successfully',
    transaction: deletedTransaction,
  };
}

async function getSummary(args) {
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
    success: true,
    summary: summary,
    transactions: transactions,
  };
}

// Build system prompt with context
async function buildSystemPrompt(username) {
  // Get user's recent categories for context
  const recentTransactions = await Transaction.find({ username })
    .sort({ date: -1 })
    .limit(100);

  const categories = [...new Set(recentTransactions.map(t => t.category))];

  return `You are an AI assistant for an expense tracking application. Your role is to help users manage their expenses and budgets through natural conversation.

IMPORTANT CAPABILITIES:
- You can perform CRUD operations on transactions (create, read, update, delete)
- You can provide expense summaries and analytics
- You can search and filter transactions by category, type, and date
- You must use the provided functions to interact with the database

USER CONTEXT:
- Username: ${username}
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

Current date: ${new Date().toISOString().split('T')[0]}

Remember: Always use the provided functions to interact with data. Never make up transaction IDs or data.`;
}

// Main chat handler
const handleChatMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const username = req.user.username; // From auth middleware

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // Initialize Gemini API with the current environment variable
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Initialize Gemini model with function calling
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: tools,
    });

    // Build system prompt with user context
    const systemPrompt = await buildSystemPrompt(username);

    // Build conversation history
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start chat session
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

    // Send message and handle function calls
    let result = await chat.sendMessage(message);
    let response = result.response;
    
    // Handle function calls in a loop (multi-turn function calling)
    while (response.functionCalls && typeof response.functionCalls === 'function') {
      const functionCalls = response.functionCalls();
      
      // Break if no function calls
      if (!functionCalls || functionCalls.length === 0) {
        break;
      }
      
      const functionResponses = [];

      for (const functionCall of functionCalls) {
        try {
          // Add username to function arguments if not present
          const argsWithUsername = {
            ...functionCall.args,
            username: functionCall.args.username || username,
          };

          const functionResult = await executeFunction(
            functionCall.name,
            argsWithUsername
          );

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

      // Send function responses back to model
      result = await chat.sendMessage(functionResponses);
      response = result.response;
    }

    // Get final text response
    const aiResponse = response.text();

    return res.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing chat message',
      error: error.message,
    });
  }
};

// Get user context (recent transactions and categories)
const getUserContext = async (req, res) => {
  try {
    const username = req.params.username;

    // Verify user can only access their own context
    if (req.user.username !== username) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const recentTransactions = await Transaction.find({ username })
      .sort({ date: -1 })
      .limit(50);

    const categories = [...new Set(recentTransactions.map(t => t.category))];

    return res.json({
      success: true,
      categories: categories,
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

