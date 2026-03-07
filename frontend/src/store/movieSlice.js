import { createSlice } from '@reduxjs/toolkit';

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    trending: [],
    popular: [],
    topRated: [],
    loading: false,
    error: null,
  },
  reducers: {
    setMovies: (state, action) => {
      const { category, data } = action.payload;
      state[category] = data;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setMovies, setLoading, setError } = movieSlice.actions;
export default movieSlice.reducer;
