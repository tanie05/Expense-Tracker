const router = require("express").Router()
const Transaction = require("../models/transactionModel")
const { requiredSignIn } = require("../middlewares/authMiddleware")
const validate = require("../middlewares/validate")
const { createTransaction, updateTransaction } = require("../validators/transactionValidators")

router.route("/")
  .get(requiredSignIn, async (req, res) => {
    try {
      const transactions = await Transaction.aggregate([
        { $match: { user_id: req.user._id } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $addFields: {
            category_name: { $arrayElemAt: ['$category.name', 0] }
          }
        },
        { $project: { category: 0 } }
      ])
      res.json({ success: true, transactions })
    } catch {
      res.status(500).json({ success: false, message: "Error fetching transactions" })
    }
  })

  .post(requiredSignIn, ...createTransaction, validate, (req, res) => {
    const newTransaction = new Transaction({
      user_id: req.user._id,
      amount: parseFloat(req.body.amount),
      category_id: req.body.category_id,
      date: Date.parse(req.body.date),
      type: req.body.type,
      description: req.body.description
    })

    newTransaction.save()
      .then(() => res.json({ success: true, message: "Transaction added!", transaction: newTransaction }))
      .catch(() => res.status(400).json({ success: false, message: "Error adding transaction" }))
  })

router.route("/:id")
  .get(requiredSignIn, (req, res) => {
    Transaction.findById(req.params.id)
      .then(transaction => {
        if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" })
        res.json(transaction)
      })
      .catch(() => res.status(400).json({ success: false, message: "Error fetching transaction" }))
  })

  .patch(requiredSignIn, ...updateTransaction, validate, async (req, res) => {
    try {
      const updated = await Transaction.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      )
      if (!updated) return res.status(404).json({ success: false, message: "Transaction not found" })
      res.json({ success: true, message: "Updated successfully", transaction: updated })
    } catch {
      res.status(500).json({ success: false, message: "Update failed" })
    }
  })

  .delete(requiredSignIn, (req, res) => {
    Transaction.findByIdAndDelete(req.params.id)
      .then(data => {
        if (!data) return res.status(404).json({ success: false, message: "Transaction not found" })
        res.json({ success: true, message: "Transaction deleted." })
      })
      .catch(() => res.status(400).json({ success: false, message: "Error deleting transaction" }))
  })

module.exports = router
