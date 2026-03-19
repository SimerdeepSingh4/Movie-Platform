import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';
import MovieCard from '../../home/components/MovieCard';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const PlatformCollection = () => {
  const { providerId } = useParams();
  const [searchParams] = useSearchParams();
  const providerName = searchParams.get('name') || 'Platform';

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "400px",
  });

  const fetchMovies = useCallback(async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=${providerId}&watch_region=IN&sort_by=popularity.desc&page=${pageNum}`;

      const res = await axios.get(endpoint);

      if (pageNum === 1) {
        setMovies(res.data.results);
      } else {
        setMovies(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMovies = res.data.results.filter(m => !existingIds.has(m.id));
          return [...prev, ...newMovies];
        });
      }
      setTotalPages(res.data.total_pages);
    } catch (err) {
      setError(`Failed to fetch movies for ${providerName}.`);
    } finally {
      setLoading(false);
    }
  }, [providerId, providerName]);

  // Initial fetch on mount or when providerId changes
  useEffect(() => {
    setMovies([]);
    setPage(1);
    fetchMovies(1);
    window.scrollTo(0, 0);
  }, [providerId, fetchMovies]);

  // Handle infinite scroll trigger
  useEffect(() => {
    if (inView && !loading && page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage);
    }
  }, [inView, loading, page, totalPages, fetchMovies]);

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
          Popular on {providerName}
        </h1>
      </div>

      {error && (
        <div className="text-center text-destructive mb-8">{error}</div>
      )}

      {loading && page === 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[250px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {movies.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie, index) => (
              <MovieCard 
                key={`${movie.id}-${index}`}
                id={movie.id} 
                title={movie.title || movie.name} 
                poster_path={movie.poster_path} 
                rating={movie.vote_average}
                mediaType="movie"
              />
            ))}
          </div>

          <div
            ref={loadMoreRef}
            className="w-full flex justify-center py-8 mt-4"
          >
            {loading && page > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && page >= totalPages && movies.length > 0 && (
              <p className="text-muted-foreground font-medium py-8 text-center flex items-center justify-center gap-4 w-full">
                <span className="h-px w-12 bg-border block"></span>
                You've reached the end of the {providerName} catalog!
                <span className="h-px w-12 bg-border block"></span>
              </p>
            )}
          </div>
        </>
      )}

      {!loading && movies.length === 0 && !error && (
        <div className="text-center text-muted-foreground py-32">
          <p className="text-xl">No movies found for {providerName}.</p>
        </div>
      )}
    </div>
  );
};

export default PlatformCollection;
