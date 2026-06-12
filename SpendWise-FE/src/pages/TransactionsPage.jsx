import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchTransactions,
  selectFilteredTransactions,
  selectTransactionStatus,
} from '../store/slices/transactionSlice'
import { fetchCategories } from '../store/slices/categorySlice'
import TransactionList from '../components/TransactionList'
import CreateTransaction from '../components/CreateTransaction'
import CategoriesDrawer from '../components/CategoriesDrawer'

export default function TransactionsPage() {
  const dispatch = useDispatch()
  const transactions = useSelector(selectFilteredTransactions)
  const status = useSelector(selectTransactionStatus)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchTransactions())
    dispatch(fetchCategories())
  }, [dispatch])

  if (status === 'loading') return <p className="loading-text">Loading…</p>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Transactions</h1>
        <button className="btn btn-secondary" onClick={() => setDrawerOpen(true)}>
          Manage Categories
        </button>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <p className="section-title">New Transaction</p>
        <CreateTransaction />
      </div>

      <div className="card">
        <p className="section-title">History</p>
        <TransactionList transactions={transactions} />
      </div>

      <CategoriesDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
