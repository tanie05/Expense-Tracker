import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  selectCategories,
  selectCategoryStatus,
  editCategory
} from '../store/slices/categorySlice'

export default function CategoriesPage() {
  const dispatch = useDispatch()
  const categories = useSelector(selectCategories)
  const status = useSelector(selectCategoryStatus)

  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      dispatch(editCategory({ _id: editingId, name }))
    } else {
      dispatch(createCategory({ name }))
    }
    e.target.reset()
    setName('')
    setEditingId(null)
  }

  const handleEdit = (id) => {
    const category = categories.find((c) => c._id === id)
    if (category) {
      setName(category.name)
      setEditingId(id)
    }
  }

  const handleCancel = () => {
    setName('')
    setEditingId(null)
  }

  if (status === 'loading') return <p className="loading-text">Loading…</p>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Categories</h1>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <p className="section-title">{editingId ? 'Edit Category' : 'New Category'}</p>
        <form className="form-row" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Category name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
          />
          <button className="btn btn-primary" type="submit">
            {editingId ? 'Save' : 'Add'}
          </button>
          {editingId && (
            <button className="btn btn-secondary" type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="card">
        <p className="section-title">All Categories</p>
        {categories.length === 0 ? (
          <p className="empty-text">No categories yet.</p>
        ) : (
          <ul className="category-list">
            {categories.map((cat) => (
              <li key={cat._id} className="category-item">
                <span className="category-name">{cat.name}</span>
                <button className="btn-ghost" onClick={() => handleEdit(cat._id)}>Edit</button>
                <button className="btn-danger" onClick={() => dispatch(deleteCategory(cat._id))}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
