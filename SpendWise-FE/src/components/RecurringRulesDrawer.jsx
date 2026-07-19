import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchRecurringRules,
  editRecurringRule,
  deleteRecurringRule,
  pauseRecurringRule,
  resumeRecurringRule,
  selectRecurringRules,
  selectRecurringRuleStatus,
  selectEditingRuleId,
  selectEditingRule,
  startEditing,
  stopEditing,
} from '../store/slices/recurringRuleSlice'
import { fetchCategories, selectCategories } from '../store/slices/categorySlice'

const emptyForm = {
  description: '',
  amount: '',
  type: '',
  category_id: '',
  frequency: '',
  interval: 1,
  day_of_month: '',
  start_date: '',
  end_date: '',
}

export default function RecurringRulesDrawer({ open, onClose }) {
  const dispatch = useDispatch()
  const rules = useSelector(selectRecurringRules)
  const status = useSelector(selectRecurringRuleStatus)
  const categories = useSelector(selectCategories)
  const editingId = useSelector(selectEditingRuleId)
  const editingRule = useSelector(selectEditingRule)

  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (open) {
      dispatch(fetchRecurringRules())
      dispatch(fetchCategories())
    }
  }, [open, dispatch])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (editingRule) {
      setForm({
        description: editingRule.description || '',
        amount: editingRule.amount,
        type: editingRule.type,
        category_id: editingRule.category_id,
        frequency: editingRule.frequency,
        interval: editingRule.interval,
        day_of_month: editingRule.day_of_month || '',
        start_date: editingRule.start_date?.split('T')[0] || '',
        end_date: editingRule.end_date?.split('T')[0] || '',
      })
    }
  }, [editingRule])

  const resetForm = () => setForm(emptyForm)

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!editingId) return
    const payload = {
      description: form.description,
      amount: Number(form.amount),
      type: form.type,
      category_id: form.category_id,
      frequency: form.frequency,
      interval: Number(form.interval) || 1,
      day_of_month: form.day_of_month ? Number(form.day_of_month) : undefined,
      start_date: form.start_date,
      end_date: form.end_date || undefined,
    }
    dispatch(editRecurringRule({ id: editingId, ...payload }))
    dispatch(stopEditing())
    resetForm()
  }

  const handleEdit = (id) => dispatch(startEditing(id))

  const handleCancel = () => {
    dispatch(stopEditing())
    resetForm()
  }

  const categoryName = (id) => categories.find((c) => c._id === id)?.name || '—'

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—')

  return (
    <>
      <div className={`drawer-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`drawer${open ? ' open' : ''}`}>
        <div className="drawer-header">
          <h2>Recurring Rules</h2>
          <button className="drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {editingId && (
          <form className="drawer-form" onSubmit={handleSubmit} style={{ flexWrap: 'wrap' }}>
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={handleChange('description')}
              style={{ flex: '1 1 100%' }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange('amount')}
              required
              style={{ flex: '1 1 45%' }}
            />
            <select value={form.type} onChange={handleChange('type')} required style={{ flex: '1 1 45%' }}>
              <option value="">Type</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select value={form.category_id} onChange={handleChange('category_id')} required style={{ flex: '1 1 100%' }}>
              <option value="">Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <select value={form.frequency} onChange={handleChange('frequency')} required style={{ flex: '1 1 45%' }}>
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
              value={form.interval}
              onChange={handleChange('interval')}
              style={{ flex: '1 1 45%' }}
            />
            {(form.frequency === 'monthly' || form.frequency === 'yearly') && (
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Day of month"
                value={form.day_of_month}
                onChange={handleChange('day_of_month')}
                style={{ flex: '1 1 100%' }}
              />
            )}
            <input
              type="date"
              value={form.start_date}
              onChange={handleChange('start_date')}
              required
              style={{ flex: '1 1 45%' }}
            />
            <input
              type="date"
              placeholder="End date (optional)"
              value={form.end_date}
              onChange={handleChange('end_date')}
              style={{ flex: '1 1 45%' }}
            />
            <div style={{ display: 'flex', gap: 8, flex: '1 1 100%' }}>
              <button className="btn btn-primary" type="submit">Save</button>
              <button className="btn btn-secondary" type="button" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        )}

        <div className="drawer-body">
          {status === 'loading' && <p className="empty-text">Loading…</p>}
          {status !== 'loading' && rules.length === 0 && (
            <p className="empty-text">No recurring rules yet. Mark a transaction as recurring to create one.</p>
          )}
          {rules.length > 0 && (
            <ul className="category-list">
              {rules.map((rule) => (
                <li key={rule._id} className="category-item">
                  <div>
                    <span className="category-name">{rule.description || categoryName(rule.category_id)}</span>
                    <div className="empty-text" style={{ margin: 0 }}>
                      every {rule.interval} {rule.frequency} · next {fmtDate(rule.next_run_date)} · {rule.is_active ? 'Active' : 'Paused'}
                    </div>
                  </div>
                  <button className="btn-ghost" onClick={() => handleEdit(rule._id)}>Edit</button>
                  {rule.is_active ? (
                    <button className="btn-ghost" onClick={() => dispatch(pauseRecurringRule(rule._id))}>Pause</button>
                  ) : (
                    <button className="btn-ghost" onClick={() => dispatch(resumeRecurringRule(rule._id))}>Resume</button>
                  )}
                  <button className="btn-danger" onClick={() => dispatch(deleteRecurringRule(rule._id))}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
