const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  is_default: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
