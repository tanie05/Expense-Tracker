const router = require('express').Router();
const { handleChatMessage, getUserContext } = require('../controllers/chatController');
const { requiredSignIn } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiter for chat endpoint to prevent API abuse
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each user to 20 requests per minute
  message: 'Too many chat requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /chat/message - Send a chat message and get AI response
router.post('/message', requiredSignIn, chatLimiter, handleChatMessage);

// GET /chat/context/:username - Get user context (categories, recent transactions)
router.get('/context/:username', requiredSignIn, getUserContext);

module.exports = router;

