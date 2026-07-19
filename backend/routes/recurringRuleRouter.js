const router = require("express").Router()
const RecurringRule = require("../models/recurringRuleModel")
const { requiredSignIn } = require("../middlewares/authMiddleware")
const validate = require("../middlewares/validate")
const { createRecurringRule, updateRecurringRule, upcomingQuery } = require("../validators/recurringRuleValidators")

const UPDATABLE_FIELDS = [
  "category_id", "type", "amount", "currency", "description",
  "frequency", "interval", "day_of_month", "start_date", "end_date"
]

const pickUpdatableFields = (body) => {
  const update = {}
  for (const field of UPDATABLE_FIELDS) {
    if (body[field] !== undefined) update[field] = body[field]
  }
  return update
}

router.route("/")
  .get(requiredSignIn, async (req, res) => {
    try {
      const rules = await RecurringRule.find({ user_id: req.user._id }).sort({ next_run_date: 1 })
      res.json({ success: true, rules })
    } catch {
      res.status(500).json({ success: false, message: "Error fetching recurring rules" })
    }
  })

  .post(requiredSignIn, ...createRecurringRule, validate, async (req, res) => {
    try {
      const rule = await RecurringRule.create({
        user_id: req.user._id,
        category_id: req.body.category_id,
        type: req.body.type,
        amount: req.body.amount,
        currency: req.body.currency,
        description: req.body.description,
        frequency: req.body.frequency,
        interval: req.body.interval,
        day_of_month: req.body.day_of_month,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        next_run_date: req.body.start_date
      })
      res.json({ success: true, message: "Recurring rule created!", rule })
    } catch {
      res.status(400).json({ success: false, message: "Error creating recurring rule" })
    }
  })

router.get("/upcoming", requiredSignIn, ...upcomingQuery, validate, async (req, res) => {
  try {
    const days = req.query.days ? Number(req.query.days) : 30
    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + days)

    const rules = await RecurringRule.find({
      user_id: req.user._id,
      is_active: true,
      next_run_date: { $gte: from, $lte: to }
    }).sort({ next_run_date: 1 })

    res.json({ success: true, rules })
  } catch {
    res.status(500).json({ success: false, message: "Error fetching upcoming recurring rules" })
  }
})

router.route("/:id")
  .put(requiredSignIn, ...updateRecurringRule, validate, async (req, res) => {
    try {
      const rule = await RecurringRule.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user._id },
        { $set: pickUpdatableFields(req.body) },
        { new: true }
      )
      if (!rule) return res.status(404).json({ success: false, message: "Recurring rule not found" })
      res.json({ success: true, message: "Recurring rule updated!", rule })
    } catch {
      res.status(400).json({ success: false, message: "Error updating recurring rule" })
    }
  })

  .delete(requiredSignIn, async (req, res) => {
    try {
      const rule = await RecurringRule.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user._id },
        { $set: { is_active: false } },
        { new: true }
      )
      if (!rule) return res.status(404).json({ success: false, message: "Recurring rule not found" })
      res.json({ success: true, message: "Recurring rule deleted." })
    } catch {
      res.status(400).json({ success: false, message: "Error deleting recurring rule" })
    }
  })

router.patch("/:id/pause", requiredSignIn, async (req, res) => {
  try {
    const rule = await RecurringRule.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { $set: { is_active: false } },
      { new: true }
    )
    if (!rule) return res.status(404).json({ success: false, message: "Recurring rule not found" })
    res.json({ success: true, message: "Recurring rule paused.", rule })
  } catch {
    res.status(400).json({ success: false, message: "Error pausing recurring rule" })
  }
})

router.patch("/:id/resume", requiredSignIn, async (req, res) => {
  try {
    const rule = await RecurringRule.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { $set: { is_active: true } },
      { new: true }
    )
    if (!rule) return res.status(404).json({ success: false, message: "Recurring rule not found" })
    res.json({ success: true, message: "Recurring rule resumed.", rule })
  } catch {
    res.status(400).json({ success: false, message: "Error resuming recurring rule" })
  }
})

module.exports = router
