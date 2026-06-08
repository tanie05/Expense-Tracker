const { body } = require("express-validator");

const updateUser = [
  body("email")
    .optional()
    .isEmail().withMessage("Invalid email format"),
  body("username")
    .optional()
    .notEmpty().withMessage("Username cannot be empty"),
];

module.exports = { updateUser };
