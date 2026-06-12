const { listTransactions, createTransaction, getSummary } = require('../services/transactionService');

// userId is always injected from JWT — never taken from AI-supplied args
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

module.exports = { executeFunction };
