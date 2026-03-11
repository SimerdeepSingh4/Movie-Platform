import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading: false,
  initialized: false,
  error: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setInitialized: (state, action) => {
      state.initialized = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.loading = false;
      state.initialized = true;
      state.error = '';
    },
  },
});

export const { setLoading, setUser, setError, setInitialized, clearAuth } = authSlice.actions;
export default authSlice.reducer;
