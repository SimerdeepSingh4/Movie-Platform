import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import api from '@/lib/api';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import { setMovies, setLoading, setError } from '../../store/movieSlice';
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
    <div className="bg-background min-h-screen pb-24 overflow-x-hidden">
      <HeroSection />

      <div className="relative z-30 pt-2 space-y-4 md:space-y-6">
        {loading && trending.length === 0 && (
          <div className="flex justify-center items-center py-40">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"></div>
          </div>
        )}

        {error && trending.length === 0 && (
          <div className="container mx-auto px-4 py-12">
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-8 py-6 rounded-2xl backdrop-blur-xl">
              <h3 className="font-black uppercase tracking-widest text-xl mb-2 italic">Alert</h3>
              <p className="font-medium opacity-80">{error}</p>
            </div>
          </div>
        )}

        {(!loading || trending.length > 0) && !error && (
          <>
            {exclusive && exclusive.length > 0 && (
              <MovieRow title="Exclusive Originals" movies={exclusive} explorePath="/movies?category=exclusive" />
            )}

            <MovieRow
              title="Weekly Top Trending"
              movies={trending}
              explorePath="/movies?category=trending"
            />

            <MovieRow
              title="Binge-worthy Series"
              movies={trendingTV}
              explorePath="/tv?category=trending"
              mediaType="tv"
            />

            <MovieRow
              title="Critics' Highest Rated"
              movies={topRatedTV}
              explorePath="/tv?category=top_rated"
              mediaType="tv"
            />

            <MovieRow
              title="Trending in India"
              movies={trendingIndia}
              explorePath="/movies?category=trending_india"
              mediaType="movie"
            />

            <MovieRow
              title="All-Time Classics"
              movies={topRated}
              explorePath="/movies?category=top_rated"
            />

            {/* OTT Platforms - Visual Separator */}
            <div className="py-2 md:py-4">
              {netflix.length > 0 && (
                <MovieRow
                  title={
                    <div className="flex items-center gap-3">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/75/Netflix_icon.svg"
                        alt="Netflix"
                        className="h-8 w-8 object-contain drop-shadow-lg"
                      />
                      <span>Trending on Netflix</span>
                    </div>
                  }
                  movies={netflix}
                  explorePath="/platform/8?name=Netflix"
                />
              )}

              {prime.length > 0 && (
                <div className="mt-4 md:mt-8">
                  <MovieRow
                    title={
                      <div className="flex items-center gap-3">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg"
                          alt="Prime Video"
                          className="h-6 w-auto object-contain brightness-0 invert"
                        />
                        <span>Featured on Prime Video</span>
                      </div>
                    }
                    movies={prime}
                    explorePath="/platform/119?name=Prime+Video"
                  />
                </div>
              )}

            </div>

            {/* Genre-based Curated Lists */}
            <div className="space-y-4 md:space-y-8">
              {action.length > 0 && (
                <MovieRow title="High Octane Action" movies={action} explorePath="/movies?category=popular" />
              )}
              {comedy.length > 0 && (
                <MovieRow title="Laughter Unlimited" movies={comedy} explorePath="/movies?category=popular" />
              )}
              {horror.length > 0 && (
                <MovieRow title="Midnight Thrillers" movies={horror} explorePath="/movies?category=popular" />
              )}
              {scifi.length > 0 && (
                <MovieRow title="Future & Beyond" movies={scifi} explorePath="/movies?category=popular" />
              )}
              {anime.length > 0 && (
                <MovieRow title="Masterpiece Anime" movies={anime} explorePath="/movies?category=popular" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;

