import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import transactionReducer from './slices/transactionSlice'
import categoryReducer from './slices/categorySlice'
import dashboardReducer from './slices/dashboardSlice'
import chatReducer from './slices/chatSlice'
import uiReducer from './slices/uiSlice'
import recurringRuleReducer from './slices/recurringRuleSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    categories: categoryReducer,
    dashboard: dashboardReducer,
    chat: chatReducer,
    ui: uiReducer,
    recurringRules: recurringRuleReducer,
  },
})

