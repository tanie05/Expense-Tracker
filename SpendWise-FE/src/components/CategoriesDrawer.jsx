import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchCategories,
  createCategory,
  deleteCategory,
  editCategory,
  selectCategories,
  selectCategoryStatus,
} from '../store/slices/categorySlice'

export default function CategoriesDrawer({ open, onClose }) {
  const dispatch = useDispatch()
  const categories = useSelector(selectCategories)
  const status = useSelector(selectCategoryStatus)

  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    if (open) dispatch(fetchCategories())
  }, [open, dispatch])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      dispatch(editCategory({ _id: editingId, name }))
    } else {
      dispatch(createCategory({ name }))
    }
    setName('')
    setEditingId(null)
  }

  const handleEdit = (cat) => {
    setName(cat.name)
    setEditingId(cat._id)
  }

  const handleCancel = () => {
    setName('')
    setEditingId(null)
  }

  return (
    <>
      <div className={`drawer-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`drawer${open ? ' open' : ''}`}>
        <div className="drawer-header">
          <h2>Categories</h2>
          <button className="drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <input
            placeholder={editingId ? 'Edit name…' : 'New category name'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ flex: 1 }}
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

        <div className="drawer-body">
          {status === 'loading' && <p className="empty-text">Loading…</p>}
          {status !== 'loading' && categories.length === 0 && (
            <p className="empty-text">No categories yet.</p>
          )}
          {categories.length > 0 && (
            <ul className="category-list">
              {categories.map((cat) => (
                <li key={cat._id} className="category-item">
                  <span className="category-name">{cat.name}</span>
                  <button className="btn-ghost" onClick={() => handleEdit(cat)}>Edit</button>
                  <button className="btn-danger" onClick={() => dispatch(deleteCategory(cat._id))}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
