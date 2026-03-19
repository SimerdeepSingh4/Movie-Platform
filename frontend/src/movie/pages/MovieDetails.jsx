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
import { formatDate, getFullCountryName, getFullLanguageName, formatRuntime } from '@/lib/utils';
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
          `${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits,similar,watch/providers,release_dates`
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

      // Track watch history (viewed page)
      const trackHistory = async () => {
        try {
          await api.post('/user/history', {
            tmdbId: !movie._id ? Number(id) : undefined,
            _id_custom: movie._id ? movie._id : undefined,
            mediaType: movie.mediaType || 'movie',
            action: 'opened',
            source: movie._id ? 'internal' : 'tmdb'
          });
        } catch (err) {
          console.error("Failed to track history:", err);
        }
      };
      trackHistory();
    }
  }, [movie, user, id, checkFavoriteStatus, checkWatchlistStatus]);

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

  const getUpcomingLabel = () => {
    if (!movie) return "Coming Soon";
    
    // Check production companies - Very reliable for "Streaming Originals"
    const companies = movie.production_companies || [];
    const companyNames = companies.map(c => c.name.toLowerCase());
    
    if (companyNames.some(n => n.includes('netflix'))) return "Coming to Netflix";
    if (companyNames.some(n => n.includes('amazon') || n.includes('prime video'))) return "Coming to Prime";
    if (companyNames.some(n => n.includes('disney'))) return "Coming to Disney+";
    if (companyNames.some(n => n.includes('apple'))) return "Coming to Apple TV+";
    if (companyNames.some(n => n.includes('hbo') || n.includes('max'))) return "Coming to Max";

    // Check watch providers (Specific to India/Global)
    const providers = movie['watch/providers']?.results?.IN || movie['watch/providers']?.results?.US;
    const allProviders = [...(providers?.flatrate || []), ...(providers?.rent || []), ...(providers?.buy || [])];
    
    if (allProviders.some(p => p.provider_name.toLowerCase().includes('netflix'))) return "Coming to Netflix";
    if (allProviders.some(p => p.provider_name.toLowerCase().includes('prime video'))) return "Coming to Prime";
    if (allProviders.some(p => p.provider_name.toLowerCase().includes('disney'))) return "Coming to Disney+";

    // Check release types for digital (type 4) or TV (type 6)
    const releaseDates = movie.release_dates?.results?.find(r => r.iso_3166_1 === 'IN' || r.iso_3166_1 === 'US')?.release_dates || [];
    if (releaseDates.some(d => d.type === 4 || d.type === 6)) return "Digital Release";
    
    // Default for most major studio movies
    return "Coming to Theaters";
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

  // Safe deduplicated providers with regional fallbacks
  const getWatchProviders = (data) => {
    if (!data?.['watch/providers']?.results) return {};
    const results = data['watch/providers'].results;
    return results.IN || results.US || Object.values(results)[0] || {};
  };

  const watchProviders = getWatchProviders(movie);
  const flatrateProviders = deduplicateProviders([
    ...(watchProviders.flatrate || []),
    ...(watchProviders.ads || []),
    ...(watchProviders.free || [])
  ]);
  const rentProviders = deduplicateProviders(watchProviders.rent);
  const buyProviders = deduplicateProviders(watchProviders.buy);

  return (
    <div className="min-h-screen pb-16 bg-background text-foreground">
      {/* Hero Banner Area */}
      <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          {/* Main Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/20 z-10" />
        </div>

        {/* Central Play Button */}
        <button
          onClick={() => setIsTrailerOpen(true)}
          className="relative z-20 group transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
          disabled={!trailerVideo}
        >
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
            <Play className="h-8 w-8 md:h-10 md:w-10 text-white fill-white ml-1" />
          </div>
          <div className="absolute inset-0 rounded-full bg-white/10 animate-ping -z-10 group-hover:block hidden" />
        </button>

        {/* Top-Right Info Box (Optional/Upcoming) */}
        {movie.release_date && (new Date(movie.release_date) > new Date() || ['In Production', 'Planned', 'Post Production'].includes(movie.status)) ? (
          <div className="absolute top-24 right-4 md:right-12 z-20 bg-black/40 backdrop-blur-lg border border-white/10 p-4 rounded-2xl max-w-[240px] hidden md:block">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-primary uppercase tracking-widest">{getUpcomingLabel()}</span>
              <span className="text-orange-500">🔥</span>
            </div>
            <p className="font-extrabold text-xl mb-1 text-white">{formatDate(movie.release_date)}</p>
          </div>
        ) : null}
      </div>

      {/* Content Container (Overlapping Hero) */}
      <div className="container mx-auto px-4 -mt-44 relative z-30">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Poster & Title Row (Mobile optimization) */}
          <div className="flex flex-row md:flex-col gap-4 md:gap-0 w-full md:w-auto items-start md:items-start relative">
            {/* Floating Poster */}
            <div className="shrink-0 w-[120px] sm:w-[150px] md:w-[220px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 -mt-10 md:-mt-12 uppercase group relative">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
                alt={movie.title}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            {/* Title & Metadata for Mobile (Hidden on Desktop) */}
            <div className="md:hidden flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-1 text-[10px] sm:text-xs font-medium text-muted-foreground/80 lowercase">
                <span className="text-primary font-bold capitalize">Movie</span>
                <span>•</span>
                <span>{movie.release_date?.substring(0, 4)}</span>
                {movie.runtime && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span>{movie.runtime}m</span>
                      <Clock className="h-2 w-2" />
                    </div>
                  </>
                )}
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 text-primary fill-primary" />
                  <span className="text-foreground font-bold">{movie.vote_average?.toFixed(1)}</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white line-clamp-2 drop-shadow-lg">
                {movie.title}
              </h1>
            </div>
          </div>

          {/* Main Info Area */}
          <div className="flex-1 w-full">
            {/* Desktop Only Metadata & Title */}
            <div className="hidden md:block">
              <div className="flex flex-wrap items-center gap-2 mb-2 text-md font-medium text-muted-foreground/80">
                <span className="text-primary font-bold">Movie</span>
                <span>•</span>
                <span>{movie.release_date?.substring(0, 4)}</span>
                <span>•</span>
                <span>{formatRuntime(movie.runtime)}</span>
                {movie.vote_average > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                      <span className="font-bold">{movie.vote_average?.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-white drop-shadow-2xl">
                {movie.title}
              </h1>
            </div>

            {/* Fluid Info & Actions (No Grid Box) */}
            <div className="flex flex-col lg:flex-row justify-between gap-10 items-start lg:items-center w-full mt-10">
              <div className="flex flex-wrap items-center gap-x-10 gap-y-8 flex-1">
                <div className="border-l-2 border-primary pl-4 md:pl-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40 mb-1">Directed By</p>
                  <p className="font-extrabold text-sm md:text-md text-white truncate">
                    {movie.credits?.crew?.find(c => c.job === 'Director')?.name || 'N/A'}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-4 md:pl-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40 mb-1">Country</p>
                  <p className="font-extrabold text-sm md:text-md text-white">
                    {getFullCountryName(movie.production_countries?.[0]?.iso_3166_1 || 'US')}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-4 md:pl-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40 mb-1">Language</p>
                  <p className="font-extrabold text-sm md:text-md text-white">
                    {getFullLanguageName(movie.original_language || 'en')}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-4 md:pl-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40 mb-1">Age Rating</p>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                    <span className="font-black text-[10px] md:text-xs text-primary uppercase">
                      {movie.release_dates?.results?.find(r => r.iso_3166_1 === 'IN')?.release_dates?.[0]?.certification ||
                        movie.release_dates?.results?.find(r => r.iso_3166_1 === 'US')?.release_dates?.[0]?.certification || 'PG-13'}
                    </span>
                  </div>
                </div>
                <div className="border-l-2 border-primary pl-4 md:pl-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40 mb-1">Where to Watch</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {flatrateProviders && flatrateProviders.length > 0 ? (
                      flatrateProviders.map(provider => (
                        <div key={provider.provider_id} className="group/provider relative">
                          <img 
                            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                            alt={provider.provider_name}
                            className="h-8 w-8 md:h-9 md:w-9 rounded-xl border border-white/10 shadow-lg transition-transform hover:scale-110"
                          />
                        </div>
                      ))
                    ) : (
                      <span className="font-extrabold text-[10px] md:text-xs text-white/30 uppercase tracking-tighter">Not Streaming</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-row gap-3 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
                <Button
                  size="xl"
                  className="h-12 md:h-14 px-4 md:px-8 font-black gap-2 text-[11px] md:text-sm rounded-2xl bg-primary hover:bg-primary/90 shadow-[0_10px_30px_rgba(234,179,8,0.2)] transition-all hover:scale-[1.03] active:scale-95 text-primary-foreground flex-1 sm:flex-none lg:w-64 border border-primary/20"
                  onClick={handleToggleWatchlist}
                  disabled={isAddingWatchlist || !user}
                >
                  <Bookmark className={`h-4 w-4 md:h-5 md:w-5 ${isWatchlisted ? 'fill-white' : ''}`} />
                  <span className="hidden sm:inline">{isWatchlisted ? 'In Collection' : 'Add to Collection'}</span>
                  <span className="sm:hidden">{isWatchlisted ? 'Collected' : 'Add to List'}</span>
                </Button>
                <Button
                  size="xl"
                  variant="secondary"
                  className="h-12 md:h-14 px-4 md:px-8 font-black gap-2 text-[11px] md:text-sm rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all hover:scale-[1.03] active:scale-95 flex-1 sm:flex-none lg:w-64"
                  onClick={handleToggleFavorite}
                  disabled={isAddingFavorite || !user}
                >
                  <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}`} />
                  <span className="hidden sm:inline">{isFavorite ? 'Favorited' : 'Mark as Favorite'}</span>
                  <span className="sm:hidden">{isFavorite ? 'Loved' : 'Favorite'}</span>
                </Button>
              </div>
            </div>

            {/* Upcoming / Interest Box (Mobile Version - below buttons) */}
            {movie.release_date && (new Date(movie.release_date) > new Date() || ['In Production', 'Planned', 'Post Production'].includes(movie.status)) && (
              <div className="mt-6 w-full md:hidden bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-5 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <span className="text-orange-500">🔥</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{getUpcomingLabel()}</span>

                  </div>
                  <p className="font-black text-xl mb-1 text-white">{formatDate(movie.release_date)}</p>
                </div>
              </div>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mt-8">
              {movie.genres?.map(genre => (
                <Badge key={genre.id} variant="secondary" className="bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm border-white/10 text-[9px] px-3 py-1 uppercase tracking-widest font-black text-muted-foreground">
                  {genre.name}
                </Badge>
              ))}
            </div>

            {/* Overview Section */}
            <div className="mt-12 max-w-4xl">
              <h1 className="text-xl md:text-2xl font-black mb-6 text-white">Overview</h1>
              <p className="text-md md:text-xl text-muted-foreground leading-relaxed">
                {movie.overview}
              </p>
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
