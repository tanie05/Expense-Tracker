const { query } = require("express-validator");

const dateRange = [
  query("startDate")
    .optional()
    .isISO8601().withMessage("startDate must be a valid date"),
  query("endDate")
    .optional()
    .isISO8601().withMessage("endDate must be a valid date"),
];

module.exports = { dateRange };
