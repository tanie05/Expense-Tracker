const router = require("express").Router()
const Transaction = require("../models/transactionModel")
const { requiredSignIn } = require("../middlewares/authMiddleware")

router.route('/:username').get(requiredSignIn, (req, res) => {
  Transaction.find({ username: req.params.username })
    .then(transactions => res.json(transactions))
    .catch(err => res.status(400).json('Error: ' + err));
});


router.route('/add').post(requiredSignIn, (req, res) => {
  const username = req.body.username;
  const amount = req.body.amount;
  const category = req.body.category;
  const date = Date.parse(req.body.date);
  const type = req.body.type;

  // Input validation
  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({success: false, message: 'Valid username is required'});
  }
  
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({success: false, message: 'Amount must be a positive number'});
  }
  
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({success: false, message: 'Category is required'});
  }
  
  // Sanitize category to prevent XSS
  const sanitizedCategory = category.trim().replace(/[<>]/g, '');
  
  if (!type || !['budget', 'expense'].includes(type)) {
    return res.status(400).json({success: false, message: 'Type must be either "budget" or "expense"'});
  }
  
  if (!date || isNaN(date)) {
    return res.status(400).json({success: false, message: 'Valid date is required'});
  }

  const newTransaction = new Transaction({
    username: username.trim(),
    amount: parseFloat(amount),
    category: sanitizedCategory,
    date,
    type
  });

  newTransaction.save()
  .then(() => res.json({success: true, message: 'Transaction added!'}))
  .catch(err => res.status(400).json({success: false, message: 'Error adding transaction'}));
});

router.route('/:id').get(requiredSignIn, (req, res) => {
  Transaction.findById(req.params.id)
    .then(transactions => res.json(transactions))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete(requiredSignIn, (req, res) => {
  Transaction.findByIdAndDelete(req.params.id)
    .then(() => res.json('Transaction deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').put(requiredSignIn, async (req,res) => {
  const {id} = req.params;
  const updateType = req.body.type;
  const updateAmount = req.body.amount;
  const updateCat = req.body.category;

  // Input validation
  if (updateAmount !== undefined && (isNaN(updateAmount) || parseFloat(updateAmount) <= 0)) {
    return res.status(400).json({success: false, message: 'Amount must be a positive number'});
  }
  
  if (updateCat !== undefined && (typeof updateCat !== 'string' || updateCat.trim() === '')) {
    return res.status(400).json({success: false, message: 'Category cannot be empty'});
  }
  
  if (updateType !== undefined && !['budget', 'expense'].includes(updateType)) {
    return res.status(400).json({success: false, message: 'Type must be either "budget" or "expense"'});
  }
  
  // Sanitize category
  const sanitizedCategory = updateCat ? updateCat.trim().replace(/[<>]/g, '') : updateCat;

  try{
    const updatedObject = await Transaction.findByIdAndUpdate(id, {
      amount: updateAmount ? parseFloat(updateAmount) : undefined,
      type: updateType,
      category: sanitizedCategory
    }, { new: true });

    if(!updatedObject){
      return res.status(404).json({success: false, message: "Transaction not found"})
    }
    return res.json({success: true, message: "Updated successfully", transaction: updatedObject});
  } catch(err){
    console.log(err);
    return res.status(500).json({success: false, message: "Update failed"})
  }
});

module.exports = router;