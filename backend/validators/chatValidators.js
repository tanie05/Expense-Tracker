const { body } = require("express-validator");

const sendMessage = [
  body("message").notEmpty().withMessage("Message is required"),
  body("conversationHistory")
    .optional()
    .isArray().withMessage("conversationHistory must be an array"),
];

module.exports = { sendMessage };
