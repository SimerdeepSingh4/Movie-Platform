import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import api from '@/lib/api';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import { setMovies, setLoading, setError } from '../../store/movieSlice';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const Home = () => {
  const dispatch = useDispatch();
  const {
    trending, popular, topRated, 
    trendingTV, popularTV, topRatedTV,
    trendingIndia,
    exclusive,
    netflix, prime, action, comedy, horror, scifi, anime,
    loading, error
  } = useSelector((state) => state.movies);

  useEffect(() => {
    const fetchMovies = async () => {
      dispatch(setLoading(true));
      try {
        const results = await Promise.allSettled([
          axios.get(`${BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=1`),
          axios.get(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`),
          axios.get(`${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=1`),
          axios.get(`${BASE_URL}/trending/tv/day?api_key=${TMDB_API_KEY}&page=1`),
          axios.get(`${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=1`),
          axios.get(`${BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&page=1`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&region=IN&with_original_language=hi|te|ta|kn|ml|pa|bn&primary_release_date.gte=${new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0]}&sort_by=popularity.desc&page=1`),
          api.get('/movies')
        ]);

        const [
          trendingRes, popularRes, topRatedRes,
          trendingTVRes, popularTVRes, topRatedTVRes,
          trendingIndiaRes,
          exclusiveRes
        ] = results;

        if (trendingRes.status === 'fulfilled') dispatch(setMovies({ category: 'trending', data: trendingRes.value.data.results.map(m => ({ ...m, mediaType: 'movie' })) }));
        if (popularRes.status === 'fulfilled') dispatch(setMovies({ category: 'popular', data: popularRes.value.data.results.map(m => ({ ...m, mediaType: 'movie' })) }));
        if (topRatedRes.status === 'fulfilled') dispatch(setMovies({ category: 'topRated', data: topRatedRes.value.data.results.map(m => ({ ...m, mediaType: 'movie' })) }));
        
        if (trendingTVRes.status === 'fulfilled') dispatch(setMovies({ category: 'trendingTV', data: trendingTVRes.value.data.results.map(t => ({ ...t, mediaType: 'tv' })) }));
        if (popularTVRes.status === 'fulfilled') dispatch(setMovies({ category: 'popularTV', data: popularTVRes.value.data.results.map(t => ({ ...t, mediaType: 'tv' })) }));
        if (topRatedTVRes.status === 'fulfilled') dispatch(setMovies({ category: 'topRatedTV', data: topRatedTVRes.value.data.results.map(t => ({ ...t, mediaType: 'tv' })) }));
        
        if (trendingIndiaRes.status === 'fulfilled') dispatch(setMovies({ category: 'trendingIndia', data: trendingIndiaRes.value.data.results.map(m => ({ ...m, mediaType: 'movie' })) }));

        if (exclusiveRes.status === 'fulfilled') dispatch(setMovies({ category: 'exclusive', data: (exclusiveRes.value.data.movies || []).map(m => ({ ...m, mediaType: 'movie' })) }));

        // Check for major failures
        const failedCount = results.filter(r => r.status === 'rejected').length;
        if (failedCount > 0) {
          console.error("Some sections failed to load:", results.filter(r => r.status === 'rejected'));
        }

      } catch (err) {
        console.error("Critical Fetch Error:", err);
        dispatch(setError('Failed to fetch movies.'));
        toast.error(`Fetch Error: ${err.message}`);
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
        const results = await Promise.allSettled([
          // Movies
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=8&watch_region=IN&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=119&watch_region=IN&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=27&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=878&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc`),
          // TV Shows
          axios.get(`${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_watch_providers=8&watch_region=IN&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_watch_providers=119&watch_region=IN&sort_by=popularity.desc`),
          axios.get(`${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=10759&sort_by=popularity.desc`), // Action & Adventure
          axios.get(`${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=35&sort_by=popularity.desc`),    // Comedy
          axios.get(`${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=10765&sort_by=popularity.desc`), // Sci-Fi & Fantasy
          axios.get(`${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc`), // Anime (Animation)
        ]);

        const [
          netflixRes, primeRes,
          actionRes, comedyRes, horrorRes, scifiRes, animeRes,
          netflixTVRes, primeTVRes,
          actionTVRes, comedyTVRes, scifiTVRes, animeTVRes
        ] = results;

        const combineAndSort = (moviesResult, tvsResult) => {
          if (moviesResult.status !== 'fulfilled' && tvsResult?.status !== 'fulfilled') return [];
          const movies = moviesResult.status === 'fulfilled' ? moviesResult.value.data.results : [];
          const tvs = (tvsResult && tvsResult.status === 'fulfilled') ? tvsResult.value.data.results : [];
          
          const m = movies.map(item => ({ ...item, mediaType: 'movie' }));
          const t = tvs.map(item => ({ ...item, mediaType: 'tv' }));
          
          const combined = [];
          const max = Math.max(m.length, t.length);
          for (let i = 0; i < max; i++) {
            if (m[i]) combined.push(m[i]);
            if (t[i]) combined.push(t[i]);
          }
          return combined;
        };

        dispatch(setMovies({ category: 'netflix', data: combineAndSort(netflixRes, netflixTVRes) }));
        dispatch(setMovies({ category: 'prime', data: combineAndSort(primeRes, primeTVRes) }));
        dispatch(setMovies({ category: 'action', data: combineAndSort(actionRes, actionTVRes) }));
        dispatch(setMovies({ category: 'comedy', data: combineAndSort(comedyRes, comedyTVRes) }));
        dispatch(setMovies({ category: 'horror', data: horrorRes.status === 'fulfilled' ? horrorRes.value.data.results.map(m => ({ ...m, mediaType: 'movie' })) : [] }));
        dispatch(setMovies({ category: 'scifi', data: combineAndSort(scifiRes, scifiTVRes) }));
        dispatch(setMovies({ category: 'anime', data: combineAndSort(animeRes, animeTVRes) }));
      } catch (err) {
        console.error("Extended Categories Error:", err);
        toast.error(`Fetch Extended Categories Error: ${err.message}`);
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
                <MovieRow title={<span className="border-l-4 border-primary pl-3 text-foreground tracking-tight">Posted by CINEBASE Admin's</span>} movies={exclusive} />
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <MovieRow
                title={<span className="border-l-4 border-orange-500 pl-3 text-foreground tracking-tight">Trending Movies</span>}
                movies={trending}
                explorePath="/movies"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <MovieRow
                title={<span className="border-l-4 border-yellow-500 pl-3 text-foreground tracking-tight">Trending TV Shows</span>}
                movies={trendingTV}
                explorePath="/tv"
                mediaType="tv"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <MovieRow
                title={<span className="border-l-4 border-emerald-500 pl-3 text-foreground tracking-tight">Critics' Choice TV</span>}
                movies={topRatedTV}
                explorePath="/tv"
                mediaType="tv"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <MovieRow
                title={<span className="border-l-4 border-orange-600 pl-3 text-foreground tracking-tight">Trending in India</span>}
                movies={trendingIndia}
                explorePath="/movies"
                mediaType="movie"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
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
