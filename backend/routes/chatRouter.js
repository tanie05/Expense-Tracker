const router = require("express").Router()
const { handleChatMessage, getUserContext } = require("../controllers/chatController")
const { requiredSignIn } = require("../middlewares/authMiddleware")
const { requireFeatureFlag } = require("../middlewares/featureFlagMiddleware")
const validate = require("../middlewares/validate")
const { sendMessage } = require("../validators/chatValidators")
const rateLimit = require("express-rate-limit")

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: "Too many chat requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

router.post("/message", requiredSignIn, requireFeatureFlag("ai_chatbot"), chatLimiter, ...sendMessage, validate, handleChatMessage)

router.get("/context/:username", requiredSignIn, requireFeatureFlag("ai_chatbot"), getUserContext)

module.exports = router
