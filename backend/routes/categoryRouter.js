const router = require("express").Router()
const Category = require("../models/categoryModel")
const Transaction = require("../models/transactionModel")
const { requiredSignIn } = require("../middlewares/authMiddleware")
const validate = require("../middlewares/validate")
const { createCategory, updateCategory } = require("../validators/categoryValidators")

router.route("/")
  .get(requiredSignIn, (req, res) => {
    Category.find({
      $or: [{ is_default: true }, { user_id: req.user._id }]
    })
      .then(categories => res.json(categories))
      .catch(() => res.status(400).json({ success: false, message: "Error fetching categories" }))
  })

  .post(requiredSignIn, ...createCategory, validate, (req, res) => {
    const newCategory = new Category({
      user_id: req.user._id,
      name: req.body.name.trim(),
      is_default: req.body.is_default || false
    })

    newCategory.save()
      .then(() => res.json({ success: true, message: "Category added!", category: newCategory }))
      .catch(() => res.status(400).json({ success: false, message: "Error adding category" }))
  })

router.route("/:id")
  .patch(requiredSignIn, ...updateCategory, validate, (req, res) => {
    Category.findByIdAndUpdate(req.params.id, { name: req.body.name.trim() }, { new: true })
      .then(category => {
        if (!category) return res.status(404).json({ success: false, message: "Category not found" })
        res.json({ success: true, message: "Category updated!", category })
      })
      .catch(() => res.status(400).json({ success: false, message: "Error updating category" }))
  })

  .delete(requiredSignIn, async (req, res) => {
    try {
      const inUse = await Transaction.exists({ category_id: req.params.id })
      if (inUse) return res.status(400).json({ success: false, message: "Cannot delete category with existing transactions" })

      const data = await Category.findByIdAndDelete(req.params.id)
      if (!data) return res.status(404).json({ success: false, message: "Category not found" })
      res.json({ success: true, message: "Category deleted!" })
    } catch {
      res.status(400).json({ success: false, message: "Error deleting category" })
    }
  })

module.exports = router
