import { createSlice } from '@reduxjs/toolkit';

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem('movie_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: getInitialUser(),
  loading: false,
  initialized: Boolean(getInitialUser()),
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
      if (action.payload) {
        localStorage.setItem('movie_user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('movie_user');
      }
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
      localStorage.removeItem('movie_user');
    },
  },
});

export const { setLoading, setUser, setError, setInitialized, clearAuth } = authSlice.actions;
export default authSlice.reducer;
