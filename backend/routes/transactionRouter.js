const router = require("express").Router()
const Transaction = require("../models/transactionModel")
const { requiredSignIn } = require("../middlewares/authMiddleware")

router.route('/').get(requiredSignIn, (req, res) => {
  Transaction.find({ user_id: req.user._id })
    .then(transactions => res.json(transactions))
    .catch(err => res.status(400).json('Error: ' + err));
});


router.route('/').post(requiredSignIn, (req, res) => {

  const amount = req.body.amount;
  const category_id = req.body.category_id;
  const date = Date.parse(req.body.date);
  const type = req.body.type;

  
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({success: false, message: 'Amount must be a positive number'});
  }
  
  if (!type || !['budget', 'expense'].includes(type)) {
    return res.status(400).json({success: false, message: 'Type must be either "budget" or "expense"'});
  }


  
  if (!date || isNaN(date)) {
    return res.status(400).json({success: false, message: 'Valid date is required'});
  }
  const newTransaction = new Transaction({
    user_id: req.user._id,
    amount: parseFloat(amount),
    category_id: category_id,
    date,
    type
  });

  newTransaction.save()
  .then(() => res.json({success: true, message: 'Transaction added!', transaction: newTransaction}))
  .catch(err => res.status(400).json({success: false, message: 'Error adding transaction'}));
});

router.route('/:id').get(requiredSignIn, (req, res) => {
  Transaction.findById(req.params.id)
    .then(transactions => {
      if (!transactions) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }
      res.json(transactions);
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete(requiredSignIn, (req, res) => {
  Transaction.findByIdAndDelete(req.params.id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
      }
      res.json('Transaction deleted.')
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').patch(requiredSignIn, async (req,res) => {
  const {id} = req.params;
  
  try{
    const updatedObject = await Transaction.findByIdAndUpdate(id, {
      $set: req.body
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