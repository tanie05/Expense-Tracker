const express = require("express")
const { authLimiter } = require("../middlewares/rateLimiter")
const { registerController, loginController } = require("../controllers/authController")
const { register, login } = require("../validators/authValidators")
const validate = require("../middlewares/validate")

const router = express.Router()

router.post("/register", authLimiter, ...register, validate, registerController)
router.post("/login", authLimiter, ...login, validate, loginController)

module.exports = router
