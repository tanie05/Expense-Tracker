import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import Select from 'react-select'
import cc from 'currency-codes'
import { register, selectAuthStatus, selectAuthError } from '../store/slices/authSlice'

const CURRENCY_OPTIONS = cc.data.map((c) => ({
  value: c.code,
  label: `${c.code} — ${c.currency}`,
}))

const SELECT_STYLES = {
  control: (base, state) => ({
    ...base,
    background: 'var(--bg)',
    borderColor: state.isFocused ? 'var(--sun-stream)' : 'var(--border)',
    borderWidth: '1.5px',
    borderRadius: '7px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(203,150,80,0.18)' : 'none',
    minHeight: '38px',
    fontSize: '14px',
    '&:hover': { borderColor: 'var(--sun-stream)' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '8px',
    border: '1px solid var(--border)',
    boxShadow: '0 4px 16px rgba(45,58,56,0.12)',
    fontSize: '14px',
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? 'var(--golden-gate)'
      : state.isFocused
      ? 'var(--cream)'
      : 'white',
    color: state.isSelected ? 'white' : 'var(--text)',
    cursor: 'pointer',
  }),
  singleValue: (base) => ({ ...base, color: 'var(--text)' }),
  placeholder: (base) => ({ ...base, color: 'var(--text-muted)' }),
  input: (base) => ({ ...base, color: 'var(--text)' }),
}

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status = useSelector(selectAuthStatus)
  const error = useSelector(selectAuthError)
  const [currency, setCurrency] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const result = await dispatch(
      register({
        username: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
        preferred_currency: currency?.value ?? '',
      })
    )
    if (register.fulfilled.match(result)) navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">ExpenseTracker</div>
        <h1>Create account</h1>
        {error && <p className="error-msg">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Name" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <Select
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={setCurrency}
            placeholder="Currency"
            styles={SELECT_STYLES}
            isSearchable
            required
          />
          <button className="btn btn-primary" type="submit" disabled={status === 'loading' || !currency}>
            {status === 'loading' ? 'Registering…' : 'Create account'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}
