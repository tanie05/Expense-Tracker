const router = require("express").Router()
const Users = require('../models/userModel')
const {requiredSignIn} = require('../middlewares/authMiddleware')


router.route("/me")
  .get(requiredSignIn, (req, res) => {
    Users.findById(req.user._id)
      .then(user => {
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
      })
      .catch(err => res.status(400).json('Error: ' + err));
  })
  .patch(requiredSignIn, (req, res) => {
    

    Users.findByIdAndUpdate(req.user._id, {
      $set : req.body
    }, { new: true })
      .then(user => {
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "User updated!", user });
      })
      .catch(err => res.status(400).json('Error: ' + err));
  });

module.exports = router