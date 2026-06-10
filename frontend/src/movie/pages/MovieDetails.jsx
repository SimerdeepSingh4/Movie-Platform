import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Star, Clock, Calendar, Heart, Bookmark, Volume2, VolumeX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import MovieRow from '../../home/components/MovieRow';
import CastRow from '../components/CastRow';
import TrailerModal from '../components/TrailerModal';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { formatDate, getFullCountryName, getFullLanguageName, formatRuntime } from '@/lib/utils';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : url.split('?')[0].split('&')[0].split('/').pop();
};

const getAmbientGlowColor = (genres) => {
  if (!genres || genres.length === 0) return 'oklch(0.75 0.16 85)';
  
  const genreName = typeof genres === 'string'
    ? genres.split(',')[0].trim().toLowerCase()
    : genres[0]?.name?.trim().toLowerCase() || '';

  switch (genreName) {
    case 'action':
    case 'adventure':
    case 'war':
      return 'oklch(0.65 0.22 25)';
    case 'sci-fi':
    case 'science fiction':
    case 'fantasy':
    case 'mystery':
      return 'oklch(0.70 0.18 250)';
    case 'drama':
    case 'history':
    case 'music':
      return 'oklch(0.75 0.16 85)';
    case 'horror':
    case 'thriller':
    case 'crime':
      return 'oklch(0.55 0.20 30)';
    case 'comedy':
    case 'family':
      return 'oklch(0.80 0.18 120)';
    case 'romance':
      return 'oklch(0.65 0.18 350)';
    case 'animation':
      return 'oklch(0.75 0.18 200)';
    case 'documentary':
    case 'western':
      return 'oklch(0.60 0.08 70)';
    default:
      return 'oklch(0.75 0.16 85)';
  }
};

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

  // Video auto-play states
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [player, setPlayer] = useState(null);

  // Load YouTube Iframe API on mount
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }, []);

  // Set up delay timer to display trailer in background
  useEffect(() => {
    setShowVideo(false);
    setPlayer(null);
    if (!movie) return;

    const trailer = movie.videos?.results?.find(vid => vid.site === 'YouTube' && vid.type === 'Trailer') || movie.videos?.results?.[0];
    if (!trailer) return;

    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 4000); // 4-second delay

    return () => clearTimeout(timer);
  }, [movie]);

  // Initialize YT Player instance when iframe is mounted
  useEffect(() => {
    if (!showVideo || !movie) return;
    
    const trailer = movie.videos?.results?.find(vid => vid.site === 'YouTube' && vid.type === 'Trailer') || movie.videos?.results?.[0];
    if (!trailer) return;

    let ytPlayer = null;
    const initPlayer = () => {
      try {
        ytPlayer = new window.YT.Player('details-youtube-player', {
          events: {
            onReady: (event) => {
              // Read current state values instead of relying on dependencies
              event.target.mute();
              setPlayer(event.target);
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
            }
          }
        });
      } catch (e) {
        console.error("Error creating YT Player", e);
      }
    };

    const checkYT = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(checkYT);
        initPlayer();
      }
    }, 200);

    return () => {
      clearInterval(checkYT);
      // Instantly kill the video decoder by clearing the iframe src.
      // We intentionally skip ytPlayer.destroy() because its heavy JavaScript teardown 
      // blocks the main thread and causes severe lag when navigating to heavy pages like Home.
      const iframe = document.getElementById('details-youtube-player');
      if (iframe) {
        iframe.src = 'about:blank';
      }
    };
  }, [showVideo, movie]);

  const handleToggleMute = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!player) return;
    
    if (isMuted) {
      player.unMute();
      player.setVolume(50);
      player.playVideo();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

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
          poster_path: localMovie.posterUrl || localMovie.poster_path,
          backdrop_path: localMovie.backdropUrl || localMovie.backdrop_path,
          release_date: localMovie.releaseDate,
          overview: localMovie.description,
          vote_average: localMovie.rating || 0,
          runtime: localMovie.runtime || 0,
          original_language: localMovie.language || 'en',
          production_countries: localMovie.country ? [{ name: localMovie.country, iso_3166_1: 'US' }] : [],
          genres: localMovie.genre ? localMovie.genre.split(',').map((g, i) => ({ id: i, name: g.trim() })) : [],
          credits: {
            cast: localMovie.cast || [],
            crew: localMovie.directedBy ? [{ name: localMovie.directedBy, job: 'Director' }] : []
          },
          release_dates: {
            results: [
              {
                iso_3166_1: 'US',
                release_dates: [{ certification: localMovie.ageRating || 'PG-13' }]
              },
              {
                iso_3166_1: 'IN',
                release_dates: [{ certification: localMovie.ageRating || 'UA' }]
              }
            ]
          },
          videos: localMovie.trailerUrl ? {
            results: [{
              key: extractYouTubeId(localMovie.trailerUrl),
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
    : (trailerVideo?.key 
        ? `https://img.youtube.com/vi/${trailerVideo.key}/maxresdefault.jpg` 
        : (movie.posterUrl || `https://image.tmdb.org/t/p/w1280${movie.poster_path}`));

  const deduplicateProviders = (providers) => {
    if (!providers || !Array.isArray(providers)) return [];
    const seen = new Set();
    return providers.filter(provider => {
      if (!provider) return false;
      // Normalize name to catch "Amazon Prime Video with Ads" vs "Amazon Prime Video"
      const name = provider.provider_name || provider.name || 'Unknown';
      const normalizedName = name.replace(/ with Ads/i, '').trim().toLowerCase();
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
    ...(watchProviders.free || []),
    ...(movie.watchProviders || []).map(p => ({
      provider_id: p.id || Math.random(),
      provider_name: p.name || 'Streaming Service',
      logo_path: p.logo_path || null
    }))
  ]);
  const rentProviders = deduplicateProviders(watchProviders.rent);
  const buyProviders = deduplicateProviders(watchProviders.buy);

  const ambientColor = getAmbientGlowColor(movie.genres || movie.genre);

  return (
    <div className="min-h-screen pb-16 bg-background text-foreground relative overflow-hidden">
      {/* Ambient Ambilight Backlight Layer */}
      <div className="absolute top-0 left-0 w-full h-[1200px] pointer-events-none overflow-hidden -z-10 opacity-[0.12] select-none">
        <div 
          className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[140%] aspect-square rounded-full blur-[160px] transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, ${ambientColor} 0%, transparent 60%)`
          }}
        />
      </div>

      {/* Hero Banner Area */}
      <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div 
            key={movie.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 z-0 origin-center"
          >
            {/* Background Image with Ken Burns Zoom */}
            <motion.img
              src={backdropUrl}
              alt={movie.title}
              initial={{ scale: 1 }}
              animate={{ scale: 1.15 }}
              transition={{ 
                duration: 45, 
                ease: "linear",
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-full h-full object-cover"
            />

            {/* Active Video Trailer Layer */}
            {showVideo && trailerVideo && (
              <motion.div
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1.02 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 z-0 overflow-hidden bg-background flex items-center justify-center"
              >
                <iframe
                  id="details-youtube-player"
                  src={`https://www.youtube.com/embed/${trailerVideo.key}?enablejsapi=1&autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerVideo.key}&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1`}
                  className="pointer-events-none shrink-0"
                  style={{
                    width: '105vw',
                    height: '59.06vw',
                    minWidth: '158.66vh',
                    minHeight: '89.25vh',
                    border: 'none'
                  }}
                  allow="autoplay; encrypted-media"
                  title="Trailer"
                />
              </motion.div>
            )}

            {/* Main Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/90 to-transparent z-20" />
            <div className="absolute inset-0 bg-black/20 z-10" />
          </motion.div>
        </AnimatePresence>

        {/* Central Play Button */}
        {trailerVideo && (
          <button
            onClick={() => setIsTrailerOpen(true)}
            className="relative z-20 group transition-transform hover:scale-110 active:scale-95"
          >
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl">
              <Play className="h-8 w-8 md:h-10 md:w-10 text-white fill-white ml-1" />
            </div>
            <div className="absolute inset-0 rounded-full bg-white/10 animate-ping -z-10 group-hover:block hidden" />
          </button>
        )}

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

        {/* Volume/Mute Controller */}
        {showVideo && player && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleMute}
            className="absolute bottom-[25vh] md:bottom-32 right-6 md:right-12 z-50 h-12 w-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white transition-all scale-90 md:scale-100 shadow-2xl"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5 text-primary" />
            )}
          </Button>
        )}
      </div>

      {/* Content Container (Overlapping Hero) */}
      <div className="container mx-auto px-4 -mt-44 relative z-30">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Poster & Title Row (Mobile optimization) */}
          <div className="flex flex-row md:flex-col gap-4 md:gap-0 w-full md:w-auto items-start md:items-start relative">
            {/* Floating Poster */}
            <div className="shrink-0 w-[120px] sm:w-[150px] md:w-[220px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 -mt-10 md:-mt-12 uppercase group relative">
              <img
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoWcWg0E8pSjBNi0TtiZsqu8uD2PAr_K11DA&s'}
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
                    {movie._id 
                      ? (movie.country || 'N/A') 
                      : getFullCountryName(movie.production_countries?.[0]?.iso_3166_1 || 'US')}
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
                          {provider.logo_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                              alt={provider.provider_name}
                              className="h-8 w-8 md:h-9 md:w-9 rounded-xl border border-white/10 shadow-lg transition-transform hover:scale-110"
                            />
                          ) : (
                            <div className="px-3 py-1.5 rounded-xl bg-primary/20 border border-primary/30 text-[10px] font-black text-primary uppercase whitespace-nowrap">
                              {provider.provider_name}
                            </div>
                          )}
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
        mediaType={movie?.mediaType || 'movie'}
      />
    </div>
  );
};

export default MovieDetails;
