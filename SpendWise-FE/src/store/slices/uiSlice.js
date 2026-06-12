import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [],
  },
  reducers: {
    addToast(state, action) {
      state.toasts.push({
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type || 'info', // 'info' | 'success' | 'error' | 'warning'
      })
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const { addToast, removeToast } = uiSlice.actions

export const selectToasts = (state) => state.ui.toasts

export default uiSlice.reducer
