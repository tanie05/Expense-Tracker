import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchDashboard,
  selectDashboardSummary,
  selectCategoryBreakdown,
  selectCashflow,
  selectDashboardDateRange,
  selectDashboardStatus,
  setDateRange
} from '../store/slices/dashboardSlice'
import { selectCurrentUser } from '../store/slices/authSlice'

const monthOptions = (() => {
  const opts = []
  const now = new Date()
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth()
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const lastDay = new Date(year, month + 1, 0).getDate()
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    opts.push({
      value: `${startDate}|${endDate}`,
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      startDate,
      endDate,
    })
  }
  return opts
})()

export default function DashboardPage() {
  const dispatch = useDispatch()
  const summary = useSelector(selectDashboardSummary)
  const categoryBreakdown = useSelector(selectCategoryBreakdown)
  const cashflow = useSelector(selectCashflow)
  const dateRange = useSelector(selectDashboardDateRange)
  const status = useSelector(selectDashboardStatus)
  const user = useSelector(selectCurrentUser)

  useEffect(() => {
    dispatch(fetchDashboard(dateRange))
  }, [dispatch, dateRange])

  const selectedValue = `${dateRange.startDate}|${dateRange.endDate}`

  const handleMonthChange = (e) => {
    const opt = monthOptions.find((o) => o.value === e.target.value)
    if (opt) dispatch(setDateRange({ startDate: opt.startDate, endDate: opt.endDate }))
  }

  const rangeLabel = useMemo(() => {
    const opt = monthOptions.find((o) => o.value === selectedValue)
    if (opt) return `Your stats for ${opt.label}`
    const s = new Date(dateRange.startDate)
    const e = new Date(dateRange.endDate)
    return `Your stats from ${s.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} to ${e.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
  }, [selectedValue, dateRange])

  const fmt = (n) =>
    n != null ? `${user.preferred_currency} ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'

  const HIDDEN_COLS = new Set(['category_id', 'categoryId', 'categoryid', 'created_at', 'createdAt', 'updated_at', 'updatedAt', '__v', '_id', 'user_id', 'description'])
  const visibleKeys = (row) => Object.keys(row).filter((k) => !HIDDEN_COLS.has(k))

  const fmtCell = (v) => {
    if (v == null) return '—'
    const s = String(v)
    if (/^\d{4}-\d{2}-\d{2}(T|$)/.test(s)) {
      return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    return s
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <span className="range-label">{rangeLabel}</span>
        </div>
        <select className="month-picker" value={selectedValue} onChange={handleMonthChange}>
          {monthOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {status === 'loading' && <p className="loading-text">Loading…</p>}
      {status === 'failed' && <p className="loading-text">Failed to load dashboard.</p>}

      {status !== 'loading' && summary && (
        <div className="stat-grid">
          <div className="stat-card income">
            <span className="stat-label">Income</span>
            <span className="stat-value">{fmt(summary.income)}</span>
          </div>
          <div className="stat-card expense">
            <span className="stat-label">Expenses</span>
            <span className="stat-value">{fmt(summary.expense)}</span>
          </div>
          <div className="stat-card balance">
            <span className="stat-label">Balance</span>
            <span className="stat-value">{fmt(summary.balance)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Transactions</span>
            <span className="stat-value">{summary.transactionCount ?? '—'}</span>
          </div>
        </div>
      )}

      {categoryBreakdown?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <p className="section-title">Category Breakdown</p>
          <table className="data-table">
            <thead>
              <tr>
                {visibleKeys(categoryBreakdown[0]).map((k) => <th key={k}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((row, i) => (
                <tr key={i}>
                  {visibleKeys(row).map((k) => <td key={k}>{fmtCell(row[k])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cashflow?.length > 0 && (
        <div className="card">
          <p className="section-title">Cashflow</p>
          <table className="data-table">
            <thead>
              <tr>
                {visibleKeys(cashflow[0]).map((k) => <th key={k}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {cashflow.map((row, i) => (
                <tr key={i}>
                  {visibleKeys(row).map((k) => <td key={k}>{fmtCell(row[k])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
