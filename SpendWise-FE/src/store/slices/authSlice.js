import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const COOKIE_TOKEN = 'auth_token'
const COOKIE_USER = 'auth_user'

function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`
}

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

const storedToken = getCookie(COOKIE_TOKEN)
const storedUserRaw = getCookie(COOKIE_USER)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUserRaw ? JSON.parse(storedUserRaw) : null,
    token: storedToken || null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearError(state) {
      state.error = null
    },
    logout(state) {
      state.user = null
      state.token = null
      state.status = 'idle'
      state.error = null
      deleteCookie(COOKIE_TOKEN)
      deleteCookie(COOKIE_USER)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        setCookie(COOKIE_TOKEN, action.payload.token)
        setCookie(COOKIE_USER, JSON.stringify(action.payload.user))
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        setCookie(COOKIE_TOKEN, action.payload.token)
        setCookie(COOKIE_USER, JSON.stringify(action.payload.user))
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearError, logout } = authSlice.actions

export const selectCurrentUser = (state) => state.auth.user
export const selectToken = (state) => state.auth.token
export const selectAuthStatus = (state) => state.auth.status
export const selectAuthError = (state) => state.auth.error
export const selectChatbotEnabled = (state) => state.auth.user?.features?.chatbot ?? false

export default authSlice.reducer
