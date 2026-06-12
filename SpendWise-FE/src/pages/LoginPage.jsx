import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { login, selectAuthStatus, selectAuthError } from '../store/slices/authSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const status = useSelector(selectAuthStatus)
  const error = useSelector(selectAuthError)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const result = await dispatch(login({ email: form.get('email'), password: form.get('password') }))
    if (login.fulfilled.match(result)) navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">ExpenseTracker</div>
        <h1>Welcome back</h1>
        {error && <p className="error-msg">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <p className="auth-footer">No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  )
}
