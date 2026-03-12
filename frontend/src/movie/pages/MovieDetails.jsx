import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Star, Clock, Calendar, Heart, Bookmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import MovieRow from '../../home/components/MovieRow';
import CastRow from '../components/CastRow';
import TrailerModal from '../components/TrailerModal';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingWatchlist, setIsAddingWatchlist] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const fetchMovieDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    const searchParams = new URLSearchParams(window.location.search);
    const isInternal = searchParams.get('source') === 'internal';

    try {
      if (isInternal) {
        const res = await api.get(`/movies/${id}`);
        const localMovie = res.data.movie;
        // Map local movie to TMDB format for the UI
        setMovie({
          ...localMovie,
          name: localMovie.title, // Map title to name for consistency
          poster_path: localMovie.posterUrl,
          release_date: localMovie.releaseDate,
          overview: localMovie.description,
          vote_average: localMovie.rating || 0,
          videos: localMovie.trailerUrl ? {
            results: [{
              key: localMovie.trailerUrl.split('v=')[1] || localMovie.trailerUrl.split('/').pop(),
              site: 'YouTube',
              type: 'Trailer'
            }]
          } : { results: [] }
        });
      } else {
        const res = await axios.get(
          `${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits,similar,watch/providers`
        );
        setMovie(res.data);
      }
    } catch (err) {
      setError("Failed to load movie details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkFavoriteStatus = useCallback(async () => {
    if (!user || !movie) return;
    try {
      const res = await api.get('/user/favorites');
      const favorites = res.data.favorites || [];
      const isFav = movie._id 
        ? favorites.some(fav => fav._id_custom?._id === movie._id || fav._id_custom === movie._id)
        : favorites.some(fav => fav.tmdbId === Number(id) && fav.mediaType === 'movie');
      setIsFavorite(isFav);
    } catch (err) {

    }
  }, [id, user, movie]);

  const checkWatchlistStatus = useCallback(async () => {
    if (!user || !movie) return;
    try {
      const res = await api.get('/user/watchlist');
      const watchlist = res.data.watchlist || [];
      const isAdded = movie._id 
        ? watchlist.some(item => item._id_custom?._id === movie._id || item._id_custom === movie._id)
        : watchlist.some(item => item.tmdbId === Number(id));
      setIsWatchlisted(isAdded);
    } catch (err) {
    }
  }, [id, user, movie]);

  useEffect(() => {
    if (id) {
       fetchMovieDetails();
    }
    // Scroll to top when loading a new movie
    window.scrollTo(0, 0);
  }, [id, fetchMovieDetails]);

  useEffect(() => {
    if (movie && user) {
      checkFavoriteStatus();
      checkWatchlistStatus();
    }
  }, [movie, user, checkFavoriteStatus, checkWatchlistStatus]);

  const handleToggleFavorite = async () => {
    setIsAddingFavorite(true);
    try {
      if (isFavorite) {
        await api.delete(`/user/favorites/${movie.mediaType || 'movie'}/${id}`);
        setIsFavorite(false);
        toast.info("Removed from favorites");
      } else {
        await api.post('/user/favorites', {
          tmdbId: !movie._id ? Number(id) : undefined,
          _id_custom: movie._id ? movie._id : undefined,
          mediaType: movie.mediaType || 'movie',
          source: movie._id ? 'internal' : 'tmdb'
        });
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (err) {
      toast.error("Failed to update favorites");
    } finally {
      setIsAddingFavorite(false);
    }
  };

  const handleToggleWatchlist = async () => {
    setIsAddingWatchlist(true);
    try {
      if (isWatchlisted) {
        await api.delete(`/user/watchlist/${movie.mediaType || 'movie'}/${movie._id || id}`);
        setIsWatchlisted(false);
        toast.info("Removed from watchlist");
      } else {
        await api.post('/user/watchlist', {
          tmdbId: !movie._id ? Number(id) : undefined,
          _id_custom: movie._id ? movie._id : undefined,
          mediaType: movie.mediaType || 'movie',
          source: movie._id ? 'internal' : 'tmdb'
        });
        setIsWatchlisted(true);
        toast.success("Added to watchlist");
      }
    } catch (err) {
      toast.error("Failed to update watchlist");
    } finally {
      setIsAddingWatchlist(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <Skeleton className="w-full h-[60vh] md:h-[75vh]" />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-xl text-destructive font-semibold">{error || "Movie not found"}</div>
      </div>
    );
  }

  // Get trailer video
  const trailerVideo = movie.videos?.results?.find(
    (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
  ) || movie.videos?.results?.[0]; // Fallback to first video if no trailer

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : movie.posterUrl || 'https://images.unsplash.com/photo-1772678595035-4ff18bac6d93?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  const formatRuntime = (minutes) => {
    if (!minutes) return 'Unknown';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const deduplicateProviders = (providers) => {
    if (!providers) return null;
    const seen = new Set();
    return providers.filter(provider => {
      // Normalize name to catch "Amazon Prime Video with Ads" vs "Amazon Prime Video"
      const normalizedName = provider.provider_name.replace(/ with Ads/i, '').trim();
      if (seen.has(normalizedName)) {
        return false;
      }
      seen.add(normalizedName);
      return true;
    });
  };

  // Safe deduplicated providers
  const watchProvidersIN = movie['watch/providers']?.results?.IN;
  const flatrateProviders = deduplicateProviders(watchProvidersIN?.flatrate);
  const rentProviders = deduplicateProviders(watchProvidersIN?.rent);
  const buyProviders = deduplicateProviders(watchProvidersIN?.buy);

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Banner Area */}
      <div className="relative min-h-[60vh] md:min-h-[75vh] w-full flex items-end justify-start overflow-hidden pt-32 mt-[-64px]">
        <div className="absolute inset-0 z-0">
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
        </div>

        <div className="container mx-auto px-4 z-20 relative pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end md:items-start">
            {/* Poster for Desktop */}
            <div className="hidden md:block shrink-0 w-[250px] rounded-lg overflow-hidden shadow-2xl border border-white/10 relative -bottom-16">
              <img 
                src={movie.posterUrl || (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster')} 
                alt={`${movie.title} Poster`}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Main Info */}
            <div className="flex-1 max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-foreground drop-shadow-lg">
                {movie.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-medium">
                <div className="flex items-center text-yellow-500 bg-black/40 px-3 py-1.5 rounded-md backdrop-blur-md">
                  <Star className="h-4 w-4 mr-1.5 fill-current" />
                  <span className="text-base">{movie.vote_average?.toFixed(1)}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground bg-background/40 px-3 py-1.5 rounded-md backdrop-blur-md">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>{movie.release_date?.substring(0, 4)}</span>
                </div>

                <div className="flex items-center text-muted-foreground bg-background/40 px-3 py-1.5 rounded-md backdrop-blur-md">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {movie.genres?.map(genre => (
                    <Badge key={genre.id} variant="secondary" className="bg-secondary/60 backdrop-blur-sm">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Watch Providers Section */}
              {watchProvidersIN && (flatrateProviders || rentProviders || buyProviders) && (
                <div className="mb-6 bg-background/30 p-4 rounded-xl backdrop-blur-md border border-white/5 w-fit">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Play className="h-4 w-4 text-primary" /> Where to Watch
                  </h3>
                  <div className="flex flex-col gap-3">
                    {/* Stream */}
                    {flatrateProviders && flatrateProviders.length > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12 font-medium uppercase tracking-wider">Stream</span>
                        <div className="flex flex-wrap gap-2">
                          {flatrateProviders.map(provider => (
                            <img 
                              key={provider.provider_id}
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                              alt={provider.provider_name}
                              title={provider.provider_name}
                              className="h-8 w-8 rounded-md shadow-md object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Rent */}
                    {rentProviders && rentProviders.length > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12 font-medium uppercase tracking-wider">Rent</span>
                        <div className="flex flex-wrap gap-2">
                          {rentProviders.map(provider => (
                            <img 
                              key={provider.provider_id}
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                              alt={provider.provider_name}
                              title={provider.provider_name}
                              className="h-8 w-8 rounded-md shadow-md object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Buy */}
                    {buyProviders && buyProviders.length > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-12 font-medium uppercase tracking-wider">Buy</span>
                        <div className="flex flex-wrap gap-2">
                          {buyProviders.map(provider => (
                            <img 
                              key={provider.provider_id}
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                              alt={provider.provider_name}
                              title={provider.provider_name}
                              className="h-8 w-8 rounded-md shadow-md object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-lg text-muted-foreground leading-relaxed drop-shadow-md mb-8 max-w-3xl">
                {movie.overview}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="h-12 px-8 font-bold gap-2 text-md shadow-lg transition-transform hover:scale-105"
                  onClick={() => setIsTrailerOpen(true)}
                  disabled={!trailerVideo}
                >
                  <Play className="h-5 w-5 fill-current" /> 
                  {trailerVideo ? 'Watch Trailer' : 'No Trailer Available'}
                </Button>

                <Button 
                  size="lg" 
                  variant="secondary"
                  className="h-12 px-8 font-bold gap-2 text-md backdrop-blur-md bg-secondary/80 transition-transform hover:scale-105"
                  onClick={handleToggleFavorite}
                  disabled={isAddingFavorite}
                >
                  {isAddingFavorite ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground"></div>
                  ) : (
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}`} />
                  )}
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>

                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-12 px-8 font-bold gap-2 text-md backdrop-blur-md transition-transform hover:scale-105"
                  onClick={handleToggleWatchlist}
                  disabled={isAddingWatchlist}
                >
                  {isAddingWatchlist ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground"></div>
                  ) : (
                    <Bookmark className={`h-5 w-5 ${isWatchlisted ? 'fill-primary text-primary' : ''}`} />
                  )}
                  {isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      {movie.credits?.cast && movie.credits.cast.length > 0 && (
        <div className="mt-8 md:mt-24">
          <CastRow title="Top Cast" cast={movie.credits.cast} />
        </div>
      )}

      {/* Similar Movies Section */}
      {movie.similar?.results && movie.similar.results.length > 0 && (
        <div className="mt-4">
          <MovieRow title="Similar Movies" movies={movie.similar.results} explorePath="/movies" />
        </div>
      )}

      {/* Trailer Modal */}
      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        videoId={trailerVideo?.key}
        movieId={movie.id}
      />
    </div>
  );
};

export default MovieDetails;
