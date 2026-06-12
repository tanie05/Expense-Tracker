const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Category = require('../models/categoryModel');

async function findOrCreateCategory(categoryName, userId) {
  const trimmed = categoryName.trim();
  let category = await Category.findOne({ user_id: userId, name: trimmed });
  if (!category) {
    category = await Category.create({ user_id: userId, name: trimmed, is_default: false });
  }
  return category;
}

async function listTransactions({ category, type, startDate, endDate }, userId) {
  const matchQuery = { user_id: new mongoose.Types.ObjectId(userId) };

  if (type) matchQuery.type = type;

  if (startDate || endDate) {
    matchQuery.date = {};
    if (startDate) matchQuery.date.$gte = new Date(startDate);
    if (endDate) matchQuery.date.$lte = new Date(endDate);
  }

  const pipeline = [
    { $match: matchQuery },
    { $lookup: { from: 'categories', localField: 'category_id', foreignField: '_id', as: 'category' } },
    { $addFields: { category_name: { $arrayElemAt: ['$category.name', 0] } } },
    { $project: { category: 0 } },
  ];

  if (category) {
    pipeline.push({ $match: { category_name: { $regex: new RegExp(category, 'i') } } });
  }

  pipeline.push({ $sort: { date: -1 } });

  const transactions = await Transaction.aggregate(pipeline);
  return { success: true, count: transactions.length, transactions };
}

async function createTransaction({ amount, category, type, date, description }, userId) {
  if (!amount || amount <= 0) throw new Error('Amount must be a positive number');
  if (!category || typeof category !== 'string' || category.trim() === '') throw new Error('Category is required');
  if (!['income', 'expense'].includes(type)) throw new Error('Type must be either "income" or "expense"');

  const categoryDoc = await findOrCreateCategory(category, userId);

  const saved = await new Transaction({
    user_id: userId,
    category_id: categoryDoc._id,
    amount: parseFloat(amount),
    type,
    date: new Date(date),
    description: description || '',
  }).save();

  return {
    success: true,
    message: 'Transaction created successfully',
    transaction: { ...saved.toObject(), category_name: categoryDoc.name },
  };
}

async function getSummary({ categories, type, startDate, endDate }, userId) {
  const matchQuery = { user_id: new mongoose.Types.ObjectId(userId) };

  if (type) matchQuery.type = type;

  if (startDate || endDate) {
    matchQuery.date = {};
    if (startDate) matchQuery.date.$gte = new Date(startDate);
    if (endDate) matchQuery.date.$lte = new Date(endDate);
  }

  const pipeline = [
    { $match: matchQuery },
    { $lookup: { from: 'categories', localField: 'category_id', foreignField: '_id', as: 'category' } },
    { $addFields: { category_name: { $arrayElemAt: ['$category.name', 0] } } },
    { $project: { category: 0 } },
  ];

  if (categories && categories.length > 0) {
    pipeline.push({ $match: { category_name: { $in: categories.map(c => new RegExp(c, 'i')) } } });
  }

  const transactions = await Transaction.aggregate(pipeline);

  const summary = {
    totalTransactions: transactions.length,
    totalAmount: 0,
    byCategory: {},
    byType: { income: 0, expense: 0 },
  };

  for (const t of transactions) {
    summary.totalAmount += t.amount;
    const catName = t.category_name || 'Uncategorized';
    if (!summary.byCategory[catName]) summary.byCategory[catName] = { count: 0, total: 0 };
    summary.byCategory[catName].count += 1;
    summary.byCategory[catName].total += t.amount;
    if (summary.byType[t.type] !== undefined) summary.byType[t.type] += t.amount;
  }

  return { success: true, summary, transactions };
}

// Used by the REST API — category_id is already known (resolved by the client)
async function createTransactionDirect({ amount, category_id, type, date, description }, userId) {
  const saved = await new Transaction({
    user_id: userId,
    category_id,
    amount: parseFloat(amount),
    type,
    date: Date.parse(date),
    description: description || '',
  }).save();

  const [transaction] = await Transaction.aggregate([
    { $match: { _id: saved._id } },
    { $lookup: { from: 'categories', localField: 'category_id', foreignField: '_id', as: 'category' } },
    { $addFields: { category_name: { $arrayElemAt: ['$category.name', 0] } } },
    { $project: { category: 0 } },
  ]);

  return { success: true, message: 'Transaction added!', transaction };
}

module.exports = { listTransactions, createTransaction, createTransactionDirect, getSummary };
