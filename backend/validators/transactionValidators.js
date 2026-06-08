const { body } = require("express-validator");

const createTransaction = [
  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("type")
    .notEmpty().withMessage("Type is required")
    .isIn(["income", "expense"]).withMessage('Type must be either "income" or "expense"'),
  body("date")
    .notEmpty().withMessage("Date is required")
    .isISO8601().withMessage("Valid date is required"),
];

const updateTransaction = [
  body("amount")
    .optional()
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("type")
    .optional()
    .isIn(["income", "expense"]).withMessage('Type must be either "income" or "expense"'),
  body("date")
    .optional()
    .isISO8601().withMessage("Valid date is required"),
];

module.exports = { createTransaction, updateTransaction };
