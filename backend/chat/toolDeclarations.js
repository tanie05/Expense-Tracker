const tools = [
  {
    functionDeclarations: [
      {
        name: 'list_transactions',
        description:
          'Get all transactions for a user with optional filters by category, type (income/expense), and date range. Use this when user asks to see, show, or list their transactions.',
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
        description:
          'Create a new transaction (expense or income). Use this when user wants to add, create, or record a new expense or income.',
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
        description:
          'Get expense summary with aggregations. Use this when user asks for summaries, totals, or wants to know how much they spent on certain categories or types.',
        parameters: {
          type: 'object',
          properties: {
            categories: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Array of category names to include in summary. Use semantic understanding - e.g., if user asks for "food expenses", include categories like lunch, dinner, groceries, restaurant, etc.',
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

module.exports = tools;
