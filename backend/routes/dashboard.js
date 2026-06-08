const router = require("express").Router()
const Transactions = require("../models/transactionModel")
const { requiredSignIn } = require("../middlewares/authMiddleware")
const validate = require("../middlewares/validate")
const { dateRange } = require("../validators/dashboardValidators")

const buildDateMatch = (userId, query, extraMatch = {}) => {
  const match = { user_id: userId, ...extraMatch }
  if (query.startDate && query.endDate) {
    match.date = {
      $gte: new Date(query.startDate),
      $lte: new Date(query.endDate)
    }
  }
  return match
}

router.get("/summary", requiredSignIn, ...dateRange, validate, async (req, res) => {
  try {
    const match = buildDateMatch(req.user._id, req.query)
    const [summary] = await Transactions.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
          transactionCount: { $sum: 1 }
        }
      }
    ])
    res.json({
      income: summary?.income || 0,
      expense: summary?.expense || 0,
      balance: (summary?.income || 0) - (summary?.expense || 0),
      transactionCount: summary?.transactionCount || 0
    })
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch summary" })
  }
})

router.get("/category-breakdown", requiredSignIn, ...dateRange, validate, async (req, res) => {
  try {
    const match = buildDateMatch(req.user._id, req.query, { type: "expense" })
    const categoryBreakdown = await Transactions.aggregate([
  {
    $match: match
  },
  {
    $group: {
      _id: "$category_id",
      total: {
        $sum: "$amount"
      }
    }
  },
  {
    $lookup: {
      from: "categories",
      localField: "_id",
      foreignField: "_id",
      as: "category"
    }
  },
  {
    $unwind: "$category"
  },
  {
    $project: {
      _id: 0,
      category: "$category.name",
      total: 1
    }
  }
]);
    res.json(categoryBreakdown)
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch category breakdown" })
  }
})

router.get("/cashflow", requiredSignIn, ...dateRange, validate, async (req, res) => {
  try {
    const match = buildDateMatch(req.user._id, req.query)
    const cashflow = await Transactions.aggregate([{ $match: match }])
    res.json(cashflow)
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch cashflow" })
  }
})

module.exports = router
