const mongoose = require('mongoose')
const User = require('../models/userModel')
const Transaction = require('../models/transactionModel')
const RecurringRule = require('../models/recurringRuleModel')

function clampToDay(date, dayOfMonth){
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(dayOfMonth, lastDay));
}

function advanceDate(date, frequency, interval, dayOfMonth){
    const next = new Date(date);

    switch(frequency){
        case 'daily':
            next.setDate(next.getDate() + interval);
            break;
        
        case 'weekly':
            next.setDate(next.getDate() + interval*7);
            break;
        
        case 'monthly': {
            const day = next.getDate();
            next.setDate(1);
            next.setMonth(next.getMonth() + interval);
            clampToDay(next, dayOfMonth || day);
            break;
        }

        case 'yearly': {
            const day = next.getDate();
            next.setDate(1);
            next.setFullYear(next.getFullYear() + interval);
            clampToDay(next, dayOfMonth || day);
            break;
        }
    }
    return next;
}

const runCatchUp = async (userId) => {
    const today = new Date()
    const filter = {is_active: true, next_run_date: {$lte: today}};
    if(userId) filter.user_id = userId;

    const rules = await RecurringRule.find(filter);

    for(const rule of rules){
        let changed = false;

        while(rule.next_run_date <= today && (!rule.end_date || rule.next_run_date <= rule.end_date)){
            await Transaction.create({
                user_id: rule.user_id,
                category_id: rule.category_id,
                type: rule.type,
                amount: rule.amount,
                currency: rule.currency,
                description: rule.description,
                date: rule.next_run_date,
                recurring_rule_id: rule._id
            });

            rule.last_generated_date = rule.next_run_date;
            rule.next_run_date = advanceDate(rule.next_run_date, rule.frequency, rule.interval, rule.day_of_month);
            changed = true;
        }
        if(changed){
            await rule.save();
        }
    }

}

module.exports = {runCatchUp};