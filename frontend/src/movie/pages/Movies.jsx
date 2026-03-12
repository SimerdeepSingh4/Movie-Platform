import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import MovieCard from '../../home/components/MovieCard';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "400px",
  });

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
        setGenres(res.data.genres || []);
      } catch (err) {
      }
    };
    fetchGenres();
  }, []);

  const fetchMovies = useCallback(async (pageNum, genreId) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&page=${pageNum}&sort_by=popularity.desc`;
      if (genreId) {
        endpoint += `&with_genres=${genreId}`;
      }
      
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
      setError("Failed to fetch movies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchMovies(1, selectedGenre);
  }, [selectedGenre, fetchMovies]);

  useEffect(() => {
    if (inView && !loading && page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage, selectedGenre);
    }
  }, [inView, loading, page, totalPages, fetchMovies, selectedGenre]);

  const handleGenreSelect = (genreId) => {
    setSelectedGenre(genreId === selectedGenre ? null : genreId);
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-6">Explore Movies</h1>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-center gap-2 pb-4 -mx-1 px-1">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all shrink-0 border ${
                selectedGenre === null 
                  ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                  : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
            >
              All Genres
            </button>
            {genres.map(genre => (
              <button
                key={genre.id}
                onClick={() => handleGenreSelect(genre.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all shrink-0 border ${
                  selectedGenre === genre.id 
                    ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                    : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
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
              <p className="text-muted-foreground">You've reached the end!</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Movies;
