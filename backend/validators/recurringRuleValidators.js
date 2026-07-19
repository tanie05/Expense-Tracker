const { body, query } = require("express-validator");

const createRecurringRule = [
  body("category_id")
    .notEmpty().withMessage("Category is required"),
  body("type")
    .notEmpty().withMessage("Type is required")
    .isIn(["income", "expense"]).withMessage('Type must be either "income" or "expense"'),
  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("frequency")
    .notEmpty().withMessage("Frequency is required")
    .isIn(["daily", "weekly", "monthly", "yearly"]).withMessage("Invalid frequency"),
  body("interval")
    .optional()
    .isInt({ gt: 0 }).withMessage("Interval must be a positive integer"),
  body("day_of_month")
    .optional()
    .isInt({ min: 1, max: 31 }).withMessage("day_of_month must be between 1 and 31"),
  body("start_date")
    .notEmpty().withMessage("Start date is required")
    .isISO8601().withMessage("Valid start date is required"),
  body("end_date")
    .optional()
    .isISO8601().withMessage("Valid end date is required"),
  body("description")
    .optional()
    .isString(),
];

const updateRecurringRule = [
  body("category_id")
    .optional(),
  body("type")
    .optional()
    .isIn(["income", "expense"]).withMessage('Type must be either "income" or "expense"'),
  body("amount")
    .optional()
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("frequency")
    .optional()
    .isIn(["daily", "weekly", "monthly", "yearly"]).withMessage("Invalid frequency"),
  body("interval")
    .optional()
    .isInt({ gt: 0 }).withMessage("Interval must be a positive integer"),
  body("day_of_month")
    .optional()
    .isInt({ min: 1, max: 31 }).withMessage("day_of_month must be between 1 and 31"),
  body("start_date")
    .optional()
    .isISO8601().withMessage("Valid start date is required"),
  body("end_date")
    .optional()
    .isISO8601().withMessage("Valid end date is required"),
  body("description")
    .optional()
    .isString(),
];

const upcomingQuery = [
  query("days")
    .optional()
    .isInt({ gt: 0 }).withMessage("days must be a positive integer"),
];

module.exports = { createRecurringRule, updateRecurringRule, upcomingQuery };
