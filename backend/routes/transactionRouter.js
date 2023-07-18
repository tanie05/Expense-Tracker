const router = require('express').Router();
let Transaction = require('../models/transactionModel');

// router.route('/').get((req, res) => {
//   Transaction.find()
//     .then(transactions => res.json(transactions))
//     .catch(err => res.status(400).json('Error: ' + err));
// });

router.route('/:username').get((req, res) => {
  Transaction.find()
    .then(transactions => 
      {
        transactions = transactions.filter(data => data.username === req.params.username)
        res.json(transactions)
      })
    .catch(err => res.status(400).json('Error: ' + err));
});


router.route('/add').post((req, res) => {
  const username = req.body.username;
  const amount = req.body.amount;
  const category = req.body.category;
  const date = Date.parse(req.body.date);
  const type = req.body.type;

  const newTransaction = new Transaction({
    username,
    amount,
    category,
    date,
    type
  });

  newTransaction.save()
  .then(() => res.json('Transaction added!'))
  .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
  Transaction.findById(req.params.id)
    .then(transactions => res.json(transactions))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
  Transaction.findByIdAndDelete(req.params.id)
    .then(() => res.json('Transaction deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').put(async (req,res) => {
  const {id} = req.params;
  const updateType = req.body.type;
  const updateAmount = req.body.amount;
  const updateCat = req.body.category;

  try{
    const updatedObject = await Transaction.findByIdAndUpdate(id, {
      amount: updateAmount,
      type: updateType,
      category : updateCat
    });

    if(!updatedObject){
      return res.status(404).json({success: false,message: "object not found"})
    }
    return res.json({success: true, message: "updated successfully"});
  } catch(err){
    console.log(err);
    return res.status(500).json({success: false, message: "update failed"})
  }
});


router.route('/update/:id').post((req, res) => {
  Transaction.findById(req.params.id)
    .then(transaction => { 
      transaction.username = req.body.username;
      transaction.amount = req.body.amount;
      transaction.date = req.body.date;
      transaction.category = req.body.category;
      transaction.type = req.body.type;

      transaction.save()
        .then(() => res.json('Transaction updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;