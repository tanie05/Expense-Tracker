const router = require("express").Router()
const Transaction = require("../models/transactionModel")
const { requiredSignIn } = require("../middlewares/authMiddleware")
const validate = require("../middlewares/validate")
const { createTransaction, updateTransaction } = require("../validators/transactionValidators")
const { listTransactions, createTransactionDirect } = require("../services/transactionService")

router.route("/")
  .get(requiredSignIn, async (req, res) => {
    try {
      const result = await listTransactions({}, req.user._id)
      res.json({ success: true, transactions: result.transactions })
    } catch {
      res.status(500).json({ success: false, message: "Error fetching transactions" })
    }
  })

  .post(requiredSignIn, ...createTransaction, validate, async (req, res) => {
    try {
      const result = await createTransactionDirect(req.body, req.user._id)
      
      res.json(result)
    } catch {
      res.status(400).json({ success: false, message: "Error adding transaction" })
    }
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
      const updated = await Transaction.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
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
