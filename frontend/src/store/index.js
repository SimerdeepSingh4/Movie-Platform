import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import movieReducer from './movieSlice';
import exploreReducer from './exploreSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: movieReducer,
    explore: exploreReducer,
  },
});

