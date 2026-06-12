const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const tools = require('../chat/toolDeclarations');
const { executeFunction } = require('../chat/toolHandlers');
const { buildSystemPrompt } = require('../chat/systemPrompt');

const handleChatMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user._id; // from auth middleware

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', tools });

    const systemPrompt = await buildSystemPrompt(userId);

    const history = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
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
      if (!functionCalls || functionCalls.length === 0) break;

      const functionResponses = [];

      for (const functionCall of functionCalls) {
        try {
          const functionResult = await executeFunction(functionCall.name, functionCall.args, userId);
          functionResponses.push({
            functionResponse: { name: functionCall.name, response: functionResult },
          });
        } catch (error) {
          functionResponses.push({
            functionResponse: { name: functionCall.name, response: { error: error.message } },
          });
        }
      }

      result = await chat.sendMessage(functionResponses);
      response = result.response;
    }

    return res.json({ success: true, response: response.text() });
  } catch (error) {
    console.error('Chat error:', error);

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: "Oh no, something's wrong! The AI assistant is temporarily unavailable due to high demand. Please try again in a moment.",
      });
    }

    return res.status(500).json({ success: false, message: 'Error processing chat message', error: error.message });
  }
};

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
      { $addFields: { category_name: { $arrayElemAt: ['$category.name', 0] } } },
    ]);

    const categories = [...new Set(recentTransactions.map(t => t.category_name).filter(Boolean))];

    return res.json({ success: true, categories, recentTransactionsCount: recentTransactions.length });
  } catch (error) {
    console.error('Error getting user context:', error);
    return res.status(500).json({ success: false, message: 'Error fetching user context' });
  }
};

module.exports = { handleChatMessage, getUserContext };
