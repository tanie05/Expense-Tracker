const express = require("express")
const { requiredSignIn } = require("../middlewares/authMiddleware")
const { authLimiter } = require("../middlewares/rateLimiter")
const { registerController, loginController } = require("../controllers/authController")


const router = express.Router()


router.post('/register', authLimiter, registerController)

router.post('/login', authLimiter, loginController)


module.exports = router