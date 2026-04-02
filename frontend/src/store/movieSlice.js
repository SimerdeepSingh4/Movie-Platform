import { createSlice } from '@reduxjs/toolkit';

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    trending: [],
    popular: [],
    topRated: [],
    trendingTV: [],
    popularTV: [],
    topRatedTV: [],
    trendingIndia: [],
    exclusive: [],
    netflix: [],
    prime: [],
    action: [],
    comedy: [],
    horror: [],
    scifi: [],
    anime: [],
    pages: {
      trending: 1,
      popular: 1,
      topRated: 1,
      trendingTV: 1,
      popularTV: 1,
      topRatedTV: 1,
      trendingIndia: 1,
      exclusive: 1,
      netflix: 1,
      prime: 1,
      action: 1,
      comedy: 1,
      horror: 1,
      scifi: 1,
      anime: 1
    },
    loading: false,
    error: null,
  },
  reducers: {
    setMovies: (state, action) => {
      const { category, data, page } = action.payload;
      if (page && page > 1) {
        // Append new movies, avoiding duplicates (TMDB sometimes returns duplicates on pagination)
        const existingIds = new Set(state[category].map(m => m.id));
        const newMovies = data.filter(m => !existingIds.has(m.id));
        state[category] = [...state[category], ...newMovies];
      } else {
        state[category] = data;
      }
    },
    setPage: (state, action) => {
      const { category, page } = action.payload;
      state.pages[category] = page;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setMovies, setPage, setLoading, setError } = movieSlice.actions;
export default movieSlice.reducer;
