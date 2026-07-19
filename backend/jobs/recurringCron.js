const cron = require('node-cron');
const { runCatchUp } = require('../services/recurringRuleService');

const startRecurringCron = () => {
  cron.schedule('0 * * * *', () => runCatchUp());
  console.log('Recurring rule cron scheduled (hourly)');
};

module.exports = { startRecurringCron };
