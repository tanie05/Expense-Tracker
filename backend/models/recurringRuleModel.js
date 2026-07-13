const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const recurringRuleSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income']
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  interval: {
    // kitne week chhod ke if weekly
    type: Number,
    required: true,
    default: 1
  },
  day_of_month: {
    // for yearly and monthy , which day
    type: Number,
    min: 1,
    max: 31
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date
  },
  next_run_date: {
    type: Date,
    required: true
  },
  last_generated_date: {
    type: Date
  },
  is_active: {
    type: Boolean,
    default: true
  }



}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

const RecurringRule = mongoose.model('RecurringRule', recurringRuleSchema);

module.exports = RecurringRule;
