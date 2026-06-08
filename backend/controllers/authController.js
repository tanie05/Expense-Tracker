const userModel = require("../models/userModel")
const { comparePassword, hashPassword } = require("../helper/authHelper")
const JWT = require("jsonwebtoken")
const { isFeatureEnabled } = require("../helper/featureFlagHelper")

const registerController = async (req, res) => {
  try {
    const { username, password, email } = req.body

    const existingEmail = await userModel.findOne({ email })
    if (existingEmail) {
      return res.status(400).send({ success: false, message: "Email already registered" })
    }

    const password_hash = await hashPassword(password)
    const user = await new userModel({ username, password_hash, email }).save()

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    const { enabled: chatbotEnabled } = await isFeatureEnabled(user._id.toString(), "ai_chatbot")

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user: { _id: user._id, username: user.username, email: user.email },
      token,
      features: { chatbot: chatbotEnabled }
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({ success: false, message: "Error in Registration" })
  }
}

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(401).send({ success: false, message: "Invalid email or password" })
    }

    const match = await comparePassword(password, user.password_hash)
    if (!match) {
      return res.status(401).send({ success: false, message: "Invalid email or password" })
    }

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    const { enabled: chatbotEnabled } = await isFeatureEnabled(user._id.toString(), "ai_chatbot")

    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: { _id: user._id, username: user.username, email: user.email },
      token,
      features: { chatbot: chatbotEnabled }
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({ success: false, message: "Error in login" })
  }
}

module.exports = { registerController, loginController }
