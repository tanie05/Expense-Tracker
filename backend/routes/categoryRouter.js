const router = require("express").Router()
const Category = require('../models/categoryModel')
const {requiredSignIn} = require('../middlewares/authMiddleware')



router.route('/')
  .get(requiredSignIn, (req, res) => {
    Category.find({
        $or: [
            {is_default: true},
            {user_id: req.user._id}
        ]
    })
      .then(categories => res.json(categories))
      .catch(err => res.status(400).json('Error: ' + err));
  })


  .post(requiredSignIn, (req, res) => {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Valid category name is required' });
    }

    const newCategory = new Category({
      user_id: req.user._id,
      name: name.trim(),
      is_default: req.body.is_default ? req.body.is_default : false
    });

    newCategory.save()
      .then(() => res.json({ success: true, message: 'Category added!', category: newCategory }))
      .catch(err => res.status(400).json({ success: false, message: 'Error adding category' }));
  });

router.route("/:id")
  .put(requiredSignIn, (req, res) => {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Valid category name is required' });
    }

    Category.findByIdAndUpdate(req.params.id, {
      name: name.trim()
    }, { new: true })
      .then(category => {
        if (!category) {
          return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.json({ success: true, message: "Category updated!", category });
      })
      .catch(err => res.status(400).json('Error: ' + err));
  })
  .delete(requiredSignIn, (req, res) => {
    Category.findByIdAndDelete(req.params.id)
      .then((data) => {
        if (!data) {
          return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.json({ success: true, message: "Category deleted!" });
      })
      .catch(err => res.status(400).json('Error: ' + err));
  });

module.exports = router