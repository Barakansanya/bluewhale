import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import companiesSlice from './slices/companiesSlice'
import watchlistSlice from './slices/watchlistSlice'
import uiSlice from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    companies: companiesSlice,
    watchlist: watchlistSlice,
    ui: uiSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch