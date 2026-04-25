import { createSlice } from '@reduxjs/toolkit';

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState: { items: [] },
  reducers: {
    setWatchlist: (state, action) => { state.items = action.payload; },
  },
});

export const { setWatchlist } = watchlistSlice.actions;
export default watchlistSlice.reducer;
