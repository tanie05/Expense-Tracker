import { useDispatch, useSelector } from 'react-redux'
import { deleteTransaction, startEditing } from '../store/slices/transactionSlice'
import {selectCurrentUser} from '../store/slices/authSlice'
export default function TransactionList({ transactions }) {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)

  if (!transactions.length) return <p className="empty-text">No transactions yet.</p>

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const fmtAmt  = (n) => `${user.preferred_currency} ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  return (
    <ul className="transaction-list">
      {transactions.map((t) => (
        <li key={t._id} className="transaction-item">
          <span className={`txn-type-dot ${t.type}`} title={t.type} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="txn-name">{t.name}</div>
            <div className="txn-meta">
              {fmtDate(t.date)}
              {t.category_name && <span className="txn-category">{t.category_name}</span>}
            </div>
          </div>
          
          <span className={`txn-amount ${t.type}`}>
            {t.type === 'expense' ? '−' : '+'}{fmtAmt(t.amount)}
          </span>
          <div className="txn-actions">
            <button className="btn-ghost" onClick={() => dispatch(startEditing(t._id))}>Edit</button>
            <button className="btn-danger" onClick={() => dispatch(deleteTransaction(t._id))}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  )
}
