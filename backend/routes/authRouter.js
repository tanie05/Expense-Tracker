const express =  require("express");
const {  requiredSignIn } = require("../middlewares/authMiddleware.js")

const {registerController, loginController} = require('../controllers/authController.js')


const router = express.Router()


router.post('/register', registerController)

router.post('/login', loginController)


module.exports = router