import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchRecurringRules = createAsyncThunk(
  'recurringRules/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/recurring-rule')
      return data.rules
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch recurring rules')
    }
  }
)

export const fetchUpcomingRecurringRules = createAsyncThunk(
  'recurringRules/fetchUpcoming',
  async (days, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/recurring-rule/upcoming', { params: days ? { days } : {} })
      return data.rules
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch upcoming recurring rules')
    }
  }
)

export const createRecurringRule = createAsyncThunk(
  'recurringRules/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/recurring-rule', payload)
      return data.rule
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create recurring rule')
    }
  }
)

export const editRecurringRule = createAsyncThunk(
  'recurringRules/edit',
  async (payload, { rejectWithValue }) => {
    try {
      const { id, ...body } = payload
      const { data } = await api.put(`/recurring-rule/${id}`, body)
      return data.rule
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to edit recurring rule')
    }
  }
)

export const deleteRecurringRule = createAsyncThunk(
  'recurringRules/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/recurring-rule/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete recurring rule')
    }
  }
)

export const pauseRecurringRule = createAsyncThunk(
  'recurringRules/pause',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/recurring-rule/${id}/pause`)
      return data.rule
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to pause recurring rule')
    }
  }
)

export const resumeRecurringRule = createAsyncThunk(
  'recurringRules/resume',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/recurring-rule/${id}/resume`)
      return data.rule
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to resume recurring rule')
    }
  }
)

const recurringRuleSlice = createSlice({
  name: 'recurringRules',
  initialState: {
    items: [],
    upcoming: [],
    editingRuleId: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    startEditing(state, action) {
      state.editingRuleId = action.payload
    },
    stopEditing(state) {
      state.editingRuleId = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecurringRules.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchRecurringRules.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchRecurringRules.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchUpcomingRecurringRules.fulfilled, (state, action) => {
        state.upcoming = action.payload
      })
      .addCase(createRecurringRule.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(editRecurringRule.fulfilled, (state, action) => {
        state.items = state.items.map((r) => (r._id === action.payload._id ? action.payload : r))
      })
      .addCase(deleteRecurringRule.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r._id !== action.payload)
      })
      .addCase(pauseRecurringRule.fulfilled, (state, action) => {
        state.items = state.items.map((r) => (r._id === action.payload._id ? action.payload : r))
      })
      .addCase(resumeRecurringRule.fulfilled, (state, action) => {
        state.items = state.items.map((r) => (r._id === action.payload._id ? action.payload : r))
      })
  },
})

export const { startEditing, stopEditing } = recurringRuleSlice.actions

export const selectRecurringRules = (state) => state.recurringRules.items
export const selectUpcomingRecurringRules = (state) => state.recurringRules.upcoming
export const selectRecurringRuleStatus = (state) => state.recurringRules.status
export const selectEditingRuleId = (state) => state.recurringRules.editingRuleId
export const selectEditingRule = (state) =>
  state.recurringRules.items.find((r) => r._id === state.recurringRules.editingRuleId)

export default recurringRuleSlice.reducer
