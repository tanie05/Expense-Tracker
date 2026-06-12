import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/transactions', { params })
      return data.transactions
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch transactions')
    }
  }
)

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/transactions', payload)
      console.log(data)
      return data.transaction
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create transaction')
    }
  }
)

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/transactions/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete transaction')
    }
  }
)

export const editTransaction = createAsyncThunk(
  'transactions/edit',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/transactions/${payload.id}`, payload)
      return data.transaction
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to edit transaction')
    }
  }
)

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: [],
    filters: {
      category: null,
      dateRange: { start: null, end: null },
      type: null, // 'income' | 'expense' | null
    },
    editingTransactionId: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters(state) {
      state.filters = { category: null, dateRange: { start: null, end: null }, type: null }
    },
    startEditing(state, action) {
    state.editingTransactionId = action.payload
    },

    stopEditing(state) {
      state.editingTransactionId = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload)
      })
      .addCase(editTransaction.fulfilled, (state, action) => {
        state.items = state.items.map((t) => (t._id === action.payload._id ? action.payload : t))
      })
  },
})

export const { setFilter, clearFilters, startEditing, stopEditing } = transactionSlice.actions

const selectAllTransactions = (state) => state.transactions.items
const selectFilters = (state) => state.transactions.filters

export const selectFilteredTransactions = createSelector(
  [selectAllTransactions, selectFilters],
  (items, filters) => {
    return items.filter((t) => {
      if (filters.category && t.category !== filters.category) return false
      if (filters.type && t.type !== filters.type) return false
      if (filters.dateRange.start && new Date(t.date) < new Date(filters.dateRange.start)) return false
      if (filters.dateRange.end && new Date(t.date) > new Date(filters.dateRange.end)) return false
      return true
    })
  }
)

export const selectTransactionStatus = (state) => state.transactions.status
export const selectTransactionError = (state) => state.transactions.error
export const selectEditingTransactionId = (state) => state.transactions.editingTransactionId
export const selectEditingTransaction = (state) =>
  state.transactions.items.find(
    (t) => t._id === state.transactions.editingTransactionId
  )

export default transactionSlice.reducer
