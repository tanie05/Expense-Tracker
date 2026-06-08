const router = require("express").Router()
const Users = require("../models/userModel")
const { requiredSignIn } = require("../middlewares/authMiddleware")
const validate = require("../middlewares/validate")
const { updateUser } = require("../validators/userValidators")

router.route("/me")
  .get(requiredSignIn, (req, res) => {
    Users.findById(req.user._id)
      .then(user => {
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        res.json({ success: true, user })
      })
      .catch(() => res.status(400).json({ success: false, message: "Error fetching user" }))
  })

  .patch(requiredSignIn, ...updateUser, validate, (req, res) => {
    Users.findByIdAndUpdate(req.user._id, { $set: req.body }, { new: true })
      .then(user => {
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        res.json({ success: true, message: "User updated!", user })
      })
      .catch(() => res.status(400).json({ success: false, message: "Error updating user" }))
  })

module.exports = router
