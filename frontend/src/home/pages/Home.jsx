import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import api from '@/lib/api';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import { setMovies, setLoading, setError } from '../../store/movieSlice';
import { motion } from 'framer-motion';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const Home = () => {
  const dispatch = useDispatch();
  const {
    trending, popular, topRated, exclusive,
    netflix, prime, action, comedy, horror, scifi, anime,
    loading, error
  } = useSelector((state) => state.movies);

  useEffect(() => {
    const fetchMovies = async () => {
      dispatch(setLoading(true));
      try {
        const [trendingRes, popularRes, topRatedRes, exclusiveRes] = await Promise.all([
          axios.get(`${BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=1`),
          axios.get(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`),
          axios.get(`${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=1`),
          api.get('/movies')
        ]);

        dispatch(setMovies({ category: 'trending', data: trendingRes.data.results }));
        dispatch(setMovies({ category: 'popular', data: popularRes.data.results }));
        dispatch(setMovies({ category: 'topRated', data: topRatedRes.data.results }));
        dispatch(setMovies({ category: 'exclusive', data: exclusiveRes.data.movies }));
      } catch (err) {
        dispatch(setError('Failed to fetch movies.'));
        toast.error("Fetch Error:");
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (trending.length === 0) {
      fetchMovies();
    }
  }, [dispatch, trending.length]);

  // Fetch Extended Categories
  useEffect(() => {
    const fetchExtendedCategories = async () => {
      try {
        const [
          netflixRes, primeRes, 
          actionRes, comedyRes, horrorRes, scifiRes, animeRes
        ] = await Promise.all([
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=8&watch_region=IN&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=119&watch_region=IN&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=27&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=878&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc`),
        ]);

        dispatch(setMovies({ category: 'netflix', data: netflixRes.data.results }));
        dispatch(setMovies({ category: 'prime', data: primeRes.data.results }));
        dispatch(setMovies({ category: 'action', data: actionRes.data.results }));
        dispatch(setMovies({ category: 'comedy', data: comedyRes.data.results }));
        dispatch(setMovies({ category: 'horror', data: horrorRes.data.results }));
        dispatch(setMovies({ category: 'scifi', data: scifiRes.data.results }));
        dispatch(setMovies({ category: 'anime', data: animeRes.data.results }));
      } catch (err) {
        toast.error("Fetch Extended Categories Error:");
      }
    };

    // Only fetch if we have trending data and haven't fetched these yet
    if (trending.length > 0 && netflix.length === 0) {
      fetchExtendedCategories();
    }
  }, [dispatch, trending.length, netflix.length]);

  return (
    <div className="bg-gradient-to-b from-background via-background to-muted/20 min-h-screen pb-16">
      <HeroSection />

      <div className="mt-[-50px] md:mt-[-50px] relative z-30 space-y-10">
        {loading && trending.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        {error && trending.length === 0 && (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-lg">
              <h3 className="font-bold text-lg mb-1">Attention</h3>
              <p>{error}</p>
            </div>
          </div>
        )}
        {(!loading || trending.length > 0) && !error && (
          <>
            {exclusive && exclusive.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <MovieRow title={<span className="border-l-4 border-primary pl-3 text-foreground tracking-tight">Posted by CINEBASE Admin's</span>}  movies={exclusive} />
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <MovieRow 
                title={<span className="border-l-4 border-orange-500 pl-3 text-foreground tracking-tight">Trending Now</span>} 
                movies={trending} 
                explorePath="/movies" 
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <MovieRow 
                title={<span className="border-l-4 border-blue-500 pl-3 text-foreground tracking-tight">Top Rated Classics</span>} 
                movies={topRated} 
                explorePath="/movies" 
              />
            </motion.div>

            {/* OTT Platforms */}
            {netflix.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <MovieRow
                  title={
                    <span className="flex items-center gap-2 text-base lg:text-2xl">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/75/Netflix_icon.svg"
                        alt="Netflix"
                        className="h-6 w-6 object-contain"
                      />
                      Don't Miss These on Netflix
                    </span>
                  }
                  movies={netflix}
                  explorePath="/platform/8?name=Netflix"
                />
              </motion.div>
            )}

            {prime.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                <MovieRow
                  title={
                    <span className="flex items-center gap-2 text-base lg:text-2xl ">
                      <img
                        src="https://commons.wikimedia.org/wiki/Special:FilePath/Amazon_Prime_Video_blue_logo_1.svg"
                        alt="Prime Video"
                        className="h-5 w-auto object-contain"
                        title="Prime Video"
                      />
                      Worth Watching on Prime
                    </span>
                  }
                  movies={prime}
                  explorePath="/platform/119?name=Prime+Video"
                />
              </motion.div>
            )}

            {/* Genres */}
            {action.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
                <MovieRow 
                  title={<span className="border-l-4 border-red-500 pl-3 text-foreground tracking-tight">Action Packed</span>} 
                  movies={action} 
                  explorePath="/movies" 
                />
              </motion.div>
            )}
            {comedy.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
                <MovieRow 
                  title={<span className="border-l-4 border-yellow-500 pl-3 text-foreground tracking-tight">Comedy Picks</span>} 
                  movies={comedy} 
                  explorePath="/movies" 
                />
              </motion.div>
            )}
            {horror.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
                <MovieRow 
                  title={<span className="border-l-4 border-purple-500 pl-3 text-foreground tracking-tight">Late Night Screams</span>} 
                  movies={horror} 
                  explorePath="/movies" 
                />
              </motion.div>
            )}
            {scifi.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
                <MovieRow 
                  title={<span className="border-l-4 border-cyan-400 pl-3 text-foreground tracking-tight">Mind-Bending Sci-Fi</span>} 
                  movies={scifi} 
                  explorePath="/movies" 
                />
              </motion.div>
            )}
            {anime.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
                <MovieRow 
                  title={<span className="border-l-4 border-pink-500 pl-3 text-foreground tracking-tight">Anime Favorites</span>} 
                  movies={anime} 
                  explorePath="/movies" 
                />
              </motion.div>
            )}

          </>
        )}
      </div>
    </div>
  );
};

export default Home;
