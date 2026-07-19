import { useDispatch, useSelector } from 'react-redux'
import {
  createTransaction,
  selectEditingTransactionId,
  selectEditingTransaction,
  editTransaction,
  stopEditing,
  startEditing
} from '../store/slices/transactionSlice'
import { createRecurringRule } from '../store/slices/recurringRuleSlice'
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
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState('')
  const [ruleInterval, setRuleInterval] = useState(1)
  const [dayOfMonth, setDayOfMonth] = useState('')
  const [endDate, setEndDate] = useState('')

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
    setIsRecurring(false)
    setFrequency('')
    setRuleInterval(1)
    setDayOfMonth('')
    setEndDate('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingTransaction) {
      const payload = { description, amount: Number(amount), type, category_id: categoryId, date }
      dispatch(startEditing(editingTransaction._id))
      dispatch(editTransaction({ id: editingTransaction._id, ...payload }))
      dispatch(stopEditing())
    } else if (isRecurring) {
      dispatch(createRecurringRule({
        description,
        amount: Number(amount),
        type,
        category_id: categoryId,
        frequency,
        interval: Number(ruleInterval) || 1,
        day_of_month: dayOfMonth ? Number(dayOfMonth) : undefined,
        start_date: date,
        end_date: endDate || undefined,
      }))
    } else {
      dispatch(createTransaction({ description, amount: Number(amount), type, category_id: categoryId, date }))
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

      {!editingTransaction && (
        <label style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          Make this a recurring transaction
        </label>
      )}

      {isRecurring && !editingTransaction && (
        <>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            required
            style={{ flex: '1 1 110px' }}
          >
            <option value="">Frequency</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            type="number"
            min="1"
            placeholder="Every N"
            value={ruleInterval}
            onChange={(e) => setRuleInterval(e.target.value)}
            style={{ flex: '1 1 90px', maxWidth: 100 }}
          />
          {(frequency === 'monthly' || frequency === 'yearly') && (
            <input
              type="number"
              min="1"
              max="31"
              placeholder="Day of month"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              style={{ flex: '1 1 110px', maxWidth: 130 }}
            />
          )}
          <input
            type="date"
            placeholder="End date (optional)"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ flex: '1 1 130px' }}
          />
        </>
      )}

      <button className="btn btn-primary" type="submit">
        {editingId ? 'Save' : isRecurring ? 'Create Recurring Rule' : 'Add'}
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
