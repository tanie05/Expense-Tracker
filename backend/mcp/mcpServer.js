const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { listTransactions, createTransaction, getSummary } = require('../services/transactionService');

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

  toMcpResponse(data) {
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  }

  async handleListTransactions(args) {
    const { userId, ...filters } = args;
    const result = await listTransactions(filters, userId);
    return this.toMcpResponse(result);
  }

  async handleCreateTransaction(args) {
    const { userId, ...fields } = args;
    const result = await createTransaction(fields, userId);
    return this.toMcpResponse(result);
  }

  async handleGetSummary(args) {
    const { userId, ...filters } = args;
    const result = await getSummary(filters, userId);
    return this.toMcpResponse(result);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Expense Tracker MCP server running on stdio');
  }
}

module.exports = { ExpenseMCPServer };
