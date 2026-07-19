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
import {
  fetchUpcomingRecurringRules,
  selectUpcomingRecurringRules
} from '../store/slices/recurringRuleSlice'
import { fetchCategories, selectCategories } from '../store/slices/categorySlice'
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';


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
  const upcoming = useSelector(selectUpcomingRecurringRules)
  const categories = useSelector(selectCategories)

  useEffect(() => {
    dispatch(fetchDashboard(dateRange))
  }, [dispatch, dateRange])

  useEffect(() => {
    dispatch(fetchUpcomingRecurringRules(30))
    dispatch(fetchCategories())
  }, [dispatch])

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
  const VISIBLE_COLS = new Set(['type', 'amount', 'date', 'is_recurring'])
  const visibleKeys = (row) => Object.keys(row).filter((k) => VISIBLE_COLS.has(k))


  const fmtCell = (v) => {
    if (v == null) return '—'
    const s = String(v)
    if (/^\d{4}-\d{2}-\d{2}(T|$)/.test(s)) {
      return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    return s
  }
  // Fixed 8-hue categorical palette (CVD-validated). Category -> hue is
  // assigned by a stable hash so a given category always keeps the same
  // color, regardless of sort order or which categories are present.
  const CATEGORY_PALETTE = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834']

  const colorForCategory = (name) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
    return CATEGORY_PALETTE[Math.abs(hash) % CATEGORY_PALETTE.length]
  }

  const categoryTotal = categoryBreakdown.reduce((sum, item) => sum + Number(item.total || 0), 0)

  const pieData = categoryBreakdown.map((item) => ({
    id: item.category,
    label: item.category,
    value: Number(item.total || 0),
    color: colorForCategory(item.category),
  }))

  const categoryName = (id) => categories.find((c) => c._id === id)?.name || '—'

  const fmtUpcomingDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const chartAxisSx = {
    fontFamily: 'inherit',
    '& .MuiChartsAxis-tickLabel': { fill: 'var(--text-muted)', fontSize: 12 },
    '& .MuiChartsAxis-line': { stroke: 'var(--border)' },
    '& .MuiChartsAxis-tick': { stroke: 'var(--border)' },
    '& .MuiChartsGrid-line': { stroke: 'var(--border)' },
    '& .MuiChartsLegend-series text': { fill: 'var(--text) !important', fontSize: '13px !important' },
    '& .MuiChartsTooltip-table': { fontFamily: 'inherit' },
  }
  const updatedCashflow = cashflow.map((item) => ({
    ...item,
    is_recurring: Boolean(item.recurring_rule_id),
  }))

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

      <div className="card" style={{ marginBottom: 24 }}>
        <p className="section-title">Upcoming this month</p>
        {upcoming.length === 0 ? (
          <p className="empty-text">No recurring transactions due in the next 30 days.</p>
        ) : (
          <ul className="category-list">
            {upcoming.map((rule) => (
              <li key={rule._id} className="category-item">
                <span className="category-name">
                  {rule.description || categoryName(rule.category_id)} — {fmt(rule.amount)}
                </span>
                <span className="range-label">{fmtUpcomingDate(rule.next_run_date)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <p className="section-title">Spending by Category</p>
          {pieData.length > 0 ? (
            <PieChart
              series={[
                {
                  data: pieData,
                  innerRadius: 55,
                  outerRadius: 100,
                  paddingAngle: 2,
                  cornerRadius: 3,
                  highlightScope: { fade: 'global', highlight: 'item' },
                  faded: { innerRadius: 55, additionalRadius: -6, color: 'var(--border)' },
                  valueFormatter: (item) => fmt(item.value),
                  arcLabel: (item) => (item.value / categoryTotal >= 0.08 ? `${Math.round((item.value / categoryTotal) * 100)}%` : ''),
                },
              ]}
              height={280}
              slotProps={{ legend: { direction: 'vertical', position: { vertical: 'middle', horizontal: 'right' } } }}
              sx={{
                ...chartAxisSx,
                '& .MuiPieArcLabel-root': { fill: '#fff', fontSize: 12, fontWeight: 600 },
              }}
            />
          ) : (
            <p className="empty-text">No category data for this period.</p>
          )}
        </div>

        <div className="chart-card">
          <p className="section-title">Income vs Expense</p>
          {summary ? (
            <BarChart
              dataset={[{ label: 'This period', income: summary.income, expense: summary.expense }]}
              xAxis={[{ dataKey: 'label', scaleType: 'band' }]}
              series={[
                { dataKey: 'income', label: 'Income', color: '#CB9650', valueFormatter: (v) => fmt(v) },
                { dataKey: 'expense', label: 'Expense', color: '#9B3C27', valueFormatter: (v) => fmt(v) },
              ]}
              colors={['#CB9650', '#9B3C27']}
              height={280}
              barLabel="value"
              slotProps={{ legend: { direction: 'row', position: { vertical: 'top', horizontal: 'middle' } } }}
              sx={{
                ...chartAxisSx,
                '& .MuiBarLabel-root': { fill: 'var(--toasted)', fontSize: 12, fontWeight: 600 },
              }}
            />
          ) : (
            <p className="empty-text">No summary data for this period.</p>
          )}
        </div>
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

      {updatedCashflow?.length > 0 && (
        <div className="card">
          <p className="section-title">Cashflow</p>
          <table className="data-table">
            <thead>
              <tr>
                {visibleKeys(updatedCashflow[0]).map((k) => <th key={k}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {updatedCashflow.map((row, i) => (
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
