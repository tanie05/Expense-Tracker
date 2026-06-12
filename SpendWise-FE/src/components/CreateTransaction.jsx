import { useDispatch, useSelector } from 'react-redux'
import {
  createTransaction,
  selectEditingTransactionId,
  selectEditingTransaction,
  editTransaction,
  stopEditing,
  startEditing
} from '../store/slices/transactionSlice'
import { selectCategories } from '../store/slices/categorySlice'
import { useState, useEffect } from 'react'

export default function CreateTransaction() {
  const dispatch = useDispatch()
  const categories = useSelector(selectCategories)
  const editingId = useSelector(selectEditingTransactionId)
  const editingTransaction = useSelector(selectEditingTransaction)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description)
      setAmount(editingTransaction.amount)
      setType(editingTransaction.type)
      setCategoryId(editingTransaction.category_id)
      setDate(editingTransaction.date?.split('T')[0])
    }
  }, [editingTransaction])

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setType('')
    setCategoryId('')
    setDate('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { description, amount: Number(amount), type, category_id: categoryId, date }
    if (editingTransaction) {
      dispatch(startEditing(editingTransaction._id))
      dispatch(editTransaction({ id: editingTransaction._id, ...payload }))
      dispatch(stopEditing())
    } else {
      dispatch(createTransaction(payload))
    }
    resetForm()
  }

  return (
    <form className="form-row" onSubmit={handleSubmit}>
      <textarea
        name="description"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ flex: '2 1 160px' }}
      />
      <input
        name="amount"
        type="number"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        style={{ flex: '1 1 100px', maxWidth: 130 }}
      />
      <select
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
        style={{ flex: '1 1 110px' }}
      >
        <option value="">Type</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <select
        name="category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        required
        style={{ flex: '1 1 130px' }}
      >
        <option value="">Category</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>
      <input
        name="date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        style={{ flex: '1 1 130px' }}
      />
      <button className="btn btn-primary" type="submit">
        {editingId ? 'Save' : 'Add'}
      </button>
      {editingId && (
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => { dispatch(stopEditing()); resetForm() }}
        >
          Cancel
        </button>
      )}
    </form>
  )
}
