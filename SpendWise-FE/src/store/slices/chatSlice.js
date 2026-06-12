import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/chat/message', { message })
      return data.response
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send message')
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addUserMessage(state, action) {
      state.messages.push({ role: 'user', content: action.payload, id: Date.now() })
    },
    clearChat(state) {
      state.messages = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = 'idle'
        state.messages.push({ role: 'assistant', content: action.payload, id: Date.now() })
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = 'idle'
        state.error = action.payload
        state.messages.push({
          role: 'assistant',
          content: action.payload || "Oh no, something's wrong! Please try again in a moment.",
          id: Date.now(),
          isError: true,
        })
      })
  },
})

export const { addUserMessage, clearChat } = chatSlice.actions

export const selectMessages = (state) => state.chat.messages
export const selectChatStatus = (state) => state.chat.status

export default chatSlice.reducer
