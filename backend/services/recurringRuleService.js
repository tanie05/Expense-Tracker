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
        let currentRule = rule;

        while(currentRule.next_run_date <= today && (!currentRule.end_date || currentRule.next_run_date <= currentRule.end_date)){
            const dueDate = currentRule.next_run_date;
            const nextDate = advanceDate(dueDate, currentRule.frequency, currentRule.interval, currentRule.day_of_month);

            // Atomically claim this period: if another concurrent runCatchUp
            // already advanced next_run_date, this match fails and we stop,
            // preventing the same period from generating two transactions.
            const claimedRule = await RecurringRule.findOneAndUpdate(
                { _id: currentRule._id, next_run_date: dueDate },
                { $set: { next_run_date: nextDate, last_generated_date: dueDate } },
                { new: true }
            );

            if(!claimedRule) break;

            await Transaction.create({
                user_id: claimedRule.user_id,
                category_id: claimedRule.category_id,
                type: claimedRule.type,
                amount: claimedRule.amount,
                currency: claimedRule.currency,
                description: claimedRule.description,
                date: dueDate,
                recurring_rule_id: claimedRule._id
            });

            currentRule = claimedRule;
        }
    }

}

module.exports = {runCatchUp};