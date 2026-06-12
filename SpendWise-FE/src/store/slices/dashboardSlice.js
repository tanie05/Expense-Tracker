import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchAll',
  async (dateRange, { rejectWithValue }) => {
    try {
      const params = dateRange || {}
      const [summary, categoryBreakdown, cashflow] = await Promise.all([
        api.get('/dashboard/summary', { params }),
        api.get('/dashboard/category-breakdown', { params }),
        api.get('/dashboard/cashflow', { params }),
      ])
      console.log(summary.data, categoryBreakdown.data, cashflow.data)
      return {
        summary: summary.data,
        categoryBreakdown: categoryBreakdown.data,
        cashflow: cashflow.data,
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    summary: null,
    categoryBreakdown: [],
    cashflow: [],
    dateRange: (() => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      }
    })(),
    status: 'idle',
    error: null,
  },
  reducers: {
    setDateRange(state, action) {
      state.dateRange = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.summary = action.payload.summary
        state.categoryBreakdown = action.payload.categoryBreakdown
        state.cashflow = action.payload.cashflow
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { setDateRange } = dashboardSlice.actions

export const selectDashboardSummary = (state) => state.dashboard.summary
export const selectCategoryBreakdown = (state) => state.dashboard.categoryBreakdown
export const selectCashflow = (state) => state.dashboard.cashflow
export const selectDashboardDateRange = (state) => state.dashboard.dateRange
export const selectDashboardStatus = (state) => state.dashboard.status

export default dashboardSlice.reducer
