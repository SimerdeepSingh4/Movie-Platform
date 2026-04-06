import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  movies: {
    list: [],
    page: 1,
    genre: null,
    lang: null,
    totalPages: 1,
    scrollPos: 0,
    hasLoaded: false
  },
  tv: {
    list: [],
    page: 1,
    genre: null,
    lang: null,
    totalPages: 1,
    scrollPos: 0,
    hasLoaded: false
  },
  search: {
    query: '',
    type: 'movie',
    results: [],
    page: 1,
    totalPages: 1,
    scrollPos: 0,
    hasLoaded: false
  }
};

const exploreSlice = createSlice({
  name: 'explore',
  initialState,
  reducers: {
    setMoviesState: (state, action) => {
      state.movies = { ...state.movies, ...action.payload };
    },
    setTVState: (state, action) => {
      state.tv = { ...state.tv, ...action.payload };
    },
    setSearchState: (state, action) => {
      state.search = { ...state.search, ...action.payload };
    },
    updateMoviesList: (state, action) => {
        const { list, page, totalPages } = action.payload;
        if (page === 1) {
            state.movies.list = list;
        } else {
            const existingIds = new Set(state.movies.list.map(m => m.id));
            const newItems = list.filter(m => !existingIds.has(m.id));
            state.movies.list = [...state.movies.list, ...newItems];
        }
        state.movies.page = page;
        state.movies.totalPages = totalPages;
        state.movies.hasLoaded = true;
    },
    updateTVList: (state, action) => {
        const { list, page, totalPages } = action.payload;
        if (page === 1) {
            state.tv.list = list;
        } else {
            const existingIds = new Set(state.tv.list.map(s => s.id));
            const newItems = list.filter(s => !existingIds.has(s.id));
            state.tv.list = [...state.tv.list, ...newItems];
        }
        state.tv.page = page;
        state.tv.totalPages = totalPages;
        state.tv.hasLoaded = true;
    },
    updateSearchList: (state, action) => {
        const { list, page, totalPages } = action.payload;
        if (page === 1) {
            state.search.results = list;
        } else {
            const idField = state.search.type === 'user' ? '_id' : 'id';
            const existingIds = new Set(state.search.results.map(item => item[idField]));
            const newItems = list.filter(item => !existingIds.has(item[idField]));
            state.search.results = [...state.search.results, ...newItems];
        }
        state.search.page = page;
        state.search.totalPages = totalPages;
        state.search.hasLoaded = true;
    },
    saveScrollPosition: (state, action) => {
      const { type, position } = action.payload;
      if (type === 'movie') state.movies.scrollPos = position;
      if (type === 'tv') state.tv.scrollPos = position;
      if (type === 'search') state.search.scrollPos = position;
    },
    resetExploreState: (state, action) => {
      const { type } = action.payload;
      if (type === 'movie') state.movies = initialState.movies;
      if (type === 'tv') state.tv = initialState.tv;
      if (type === 'search') state.search = initialState.search;
    }
  }
});

export const { 
  setMoviesState, 
  setTVState, 
  setSearchState,
  updateMoviesList, 
  updateTVList, 
  updateSearchList,
  saveScrollPosition, 
  resetExploreState 
} = exploreSlice.actions;

export default exploreSlice.reducer;
