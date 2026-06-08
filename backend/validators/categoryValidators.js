const { body } = require("express-validator");

const categoryName = body("name")
  .notEmpty().withMessage("Category name is required")
  .isString().withMessage("Category name must be a string")
  .trim();

const createCategory = [categoryName];

const updateCategory = [categoryName];

module.exports = { createCategory, updateCategory };
