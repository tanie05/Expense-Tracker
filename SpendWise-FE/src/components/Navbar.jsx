import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { logout, selectCurrentUser, selectToken } from '../store/slices/authSlice'

export default function Navbar() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const token = useSelector(selectToken)

  return (
    <nav className="navbar">
      <span className="navbar-brand">SpendWise</span>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/transactions">Transactions</Link>
      <div className="navbar-spacer" />
      {token && (
        <div className="navbar-user">
          {user && <span>{user.username || user.name}</span>}
          <button onClick={() => dispatch(logout())}>Logout</button>
        </div>
      )}
    </nav>
  )
}
