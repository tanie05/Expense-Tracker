import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/categories')
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories')
    }
  }
)

export const createCategory = createAsyncThunk(
  'categories/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/categories', payload)
      return data.category
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create category')
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete category')
    }
  }
)

export const editCategory = createAsyncThunk(
  'categories/edit',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/categories/${payload._id}`, payload)
      return data.category
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to edit category')
    }
  }
)

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    editingCategoryId: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload)
      })
      .addCase(editCategory.fulfilled, (state, action) => {
        state.items = state.items.map((c) => (c._id === action.payload._id ? action.payload : c))
      })
  },
})

export const selectCategories = (state) => state.categories.items
export const selectCategoryStatus = (state) => state.categories.status

export default categorySlice.reducer
