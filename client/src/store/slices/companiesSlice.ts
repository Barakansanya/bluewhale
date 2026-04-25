import { createSlice } from '@reduxjs/toolkit';

const companiesSlice = createSlice({
  name: 'companies',
  initialState: { list: [], loading: false },
  reducers: {
    setCompanies: (state, action) => { state.list = action.payload; },
  },
});

export const { setCompanies } = companiesSlice.actions;
export default companiesSlice.reducer;
