import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import { setMovies, setLoading, setError } from '../../store/movieSlice';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'YOUR_TMDB_KEY_HERE'; // Replace or set in .env
const BASE_URL = 'https://api.themoviedb.org/3';

const Home = () => {
  const dispatch = useDispatch();
  const { trending, popular, topRated, loading, error } = useSelector((state) => state.movies);

  useEffect(() => {
    const fetchMovies = async () => {
      dispatch(setLoading(true));
      try {
        // Fetch Trending
        const trendingRes = await axios.get(`${BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`);
        dispatch(setMovies({ category: 'trending', data: trendingRes.data.results }));

        // Fetch Popular
        const popularRes = await axios.get(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
        dispatch(setMovies({ category: 'popular', data: popularRes.data.results }));

        // Fetch Top Rated
        const topRatedRes = await axios.get(`${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`);
        dispatch(setMovies({ category: 'topRated', data: topRatedRes.data.results }));
        
      } catch (err) {
        dispatch(setError('Failed to fetch movies.'));
        console.error("TMDB Fetch Error:", err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (trending.length === 0) {
      fetchMovies();
    }
  }, [dispatch, trending.length]);

  return (
    <div className="bg-gradient-to-b from-background via-background to-muted/20 min-h-screen pb-16">
      <HeroSection />
      
      <div className="mt-[-60px] md:mt-[-100px] relative z-30 space-y-10">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        {error && (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-lg">
              <h3 className="font-bold text-lg mb-1">Attention</h3>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {!loading && !error && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <MovieRow title="🔥 Trending Now" movies={trending} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <MovieRow title="⭐ Popular on CineBase" movies={popular} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <MovieRow title="🏆 Top Rated Classics" movies={topRated} />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
