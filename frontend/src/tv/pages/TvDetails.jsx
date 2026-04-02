import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Star, Calendar, Heart, Bookmark, List, Tv, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import MovieRow from '../../home/components/MovieRow';
import CastRow from '../../movie/components/CastRow';
import TrailerModal from '../../movie/components/TrailerModal';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { formatDate, getFullCountryName, getFullLanguageName } from '@/lib/utils';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const TvDetails = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingWatchlist, setIsAddingWatchlist] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const fetchTvDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits,similar,watch/providers,content_ratings`
      );
      setShow(res.data);
    } catch (err) {
      setError("Failed to load TV details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkFavoriteStatus = useCallback(async () => {
    if (!user || !show) return;
    try {
      const res = await api.get('/user/favorites');
      const favorites = res.data.favorites || [];
      const isFav = favorites.some(fav => fav.tmdbId === Number(id) && fav.mediaType === 'tv');
      setIsFavorite(isFav);
    } catch (err) {
    }
  }, [id, user, show]);

  const checkWatchlistStatus = useCallback(async () => {
    if (!user || !show) return;
    try {
      const res = await api.get('/user/watchlist');
      const watchlist = res.data.watchlist || [];
      const isAdded = watchlist.some(item => item.tmdbId === Number(id) && item.mediaType === 'tv');
      setIsWatchlisted(isAdded);
    } catch (err) {
    }
  }, [id, user, show]);

  useEffect(() => {
    if (id) {
      fetchTvDetails();
    }
    window.scrollTo(0, 0);
  }, [id, fetchTvDetails]);

  useEffect(() => {
    if (show && user) {
      checkFavoriteStatus();
      checkWatchlistStatus();

      // Track watch history
      const trackHistory = async () => {
        try {
          await api.post('/user/history', {
            tmdbId: Number(id),
            mediaType: 'tv',
            action: 'opened',
            source: 'tmdb'
          });
        } catch (err) {
          console.error("Failed to track history:", err);
        }
      };
      trackHistory();
    }
  }, [show, user, id, checkFavoriteStatus, checkWatchlistStatus]);

  const handleToggleFavorite = async () => {
    if (!user) { toast.error("Please login first"); return; }
    setIsAddingFavorite(true);
    try {
      if (isFavorite) {
        await api.delete(`/user/favorites/tv/${id}`);
        setIsFavorite(false);
        toast.info("Removed from favorites");
      } else {
        await api.post('/user/favorites', {
          tmdbId: Number(id),
          mediaType: 'tv',
          source: 'tmdb'
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
    if (!user) { toast.error("Please login first"); return; }
    setIsAddingWatchlist(true);
    try {
      if (isWatchlisted) {
        await api.delete(`/user/watchlist/tv/${id}`);
        setIsWatchlisted(false);
        toast.info("Removed from watchlist");
      } else {
        await api.post('/user/watchlist', {
          tmdbId: Number(id),
          mediaType: 'tv',
          source: 'tmdb'
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
    if (!show) return "New Season";
    
    // Check networks first for TV - Very reliable
    const networks = show.networks || [];
    const networkNames = networks.map(n => n.name.toLowerCase());
    
    const companies = show.production_companies || [];
    const companyNames = companies.map(c => c.name.toLowerCase());

    const isPremiere = show.number_of_seasons <= 1;
    const prefix = isPremiere ? "Series Premiere" : "New Season";
    
    if (networkNames.some(n => n.includes('netflix')) || companyNames.some(n => n.includes('netflix'))) return `${prefix} on Netflix`;
    if (networkNames.some(n => n.includes('amazon') || n.includes('prime video')) || companyNames.some(n => n.includes('amazon') || n.includes('prime video'))) return `${prefix} on Prime`;
    if (networkNames.some(n => n.includes('disney')) || companyNames.some(n => n.includes('disney'))) return `${prefix} on Disney+`;
    if (networkNames.some(n => n.includes('hbo')) || networkNames.some(n => n.includes('max'))) return `${prefix} on Max`;
    if (networkNames.some(n => n.includes('apple'))) return `${prefix} on Apple TV+`;

    return prefix;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <Skeleton className="w-full h-[60vh]" />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-xl text-destructive font-semibold">{error || "TV Show not found"}</div>
      </div>
    );
  }

  const trailerVideo = show.videos?.results?.find(
    (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
  ) || show.videos?.results?.[0];

  const backdropUrl = show.backdrop_path
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : 'https://images.unsplash.com/photo-1772678595035-4ff18bac6d93?q=80&w=687&auto=format&fit=crop';

  const deduplicateProviders = (providers) => {
    if (!providers) return null;
    const seen = new Set();
    return providers.filter(provider => {
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

  const watchProviders = getWatchProviders(show);
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
          <img src={backdropUrl} alt={show.name} className="w-full h-full object-cover" />
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

        {/* Top-Right Info Box (Optional/Interest) */}
        {((show.status === 'Returning Series' || show.status === 'Planned') && show.next_episode_to_air?.air_date) || 
         (show.first_air_date && new Date(show.first_air_date) > new Date()) ? (
          <div className="absolute top-24 right-4 md:right-12 z-20 bg-black/40 backdrop-blur-lg border border-white/10 p-4 rounded-2xl max-w-[240px] hidden md:block">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-primary uppercase tracking-widest">{getUpcomingLabel()}</span>
              <span className="text-orange-500">🔥</span>
            </div>
            <p className="font-extrabold text-xl mb-1 text-white">{formatDate(show.next_episode_to_air?.air_date || show.first_air_date)}</p>
          </div>
        ) : null}
      </div>

      {/* Content Container (Overlapping Hero) */}
      <div className="container mx-auto px-4 -mt-44 relative z-30">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Poster & Title Row (Mobile optimization) */}
          <div className="flex flex-row md:flex-col gap-4 md:gap-0 w-full md:w-auto items-start md:items-start">
            {/* Floating Poster */}
            <div className="shrink-0 w-[120px] sm:w-[150px] md:w-[220px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 -mt-10 md:-mt-12 uppercase">
              <img
                src={show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
                alt={show.name}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Title & Metadata for Mobile (Hidden on Desktop) */}
            <div className="md:hidden flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-1 text-[10px] sm:text-xs font-medium text-muted-foreground/80 lowercase">
                <span className="text-primary font-bold capitalize">Show</span>
                <span>•</span>
                <span>{show.first_air_date?.substring(0, 4)}</span>
                {show.episode_run_time?.[0] && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span>{show.episode_run_time[0]}m</span>
                      <Clock className="h-2 w-2" />
                    </div>
                  </>
                )}
                <span>•</span>
                <span>{show.number_of_seasons} {show.number_of_seasons === 1 ? 'Season' : 'Seasons'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white line-clamp-2">
                {show.name}
              </h1>
              {show.vote_average > 0 && (
                <div className="flex items-center text-yellow-500 mt-1">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  <span className="font-bold text-xs">{show.vote_average?.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Info Area */}
          <div className="flex-1 w-full">
            {/* Desktop Only Metadata & Title */}
            <div className="hidden md:block">
              <div className="flex flex-wrap items-center gap-2 mb-2 text-sm md:text-md font-medium text-muted-foreground/80">
                <span className="text-primary font-bold">Show</span>
                <span>•</span>
                <span>{show.first_air_date?.substring(0, 4)}</span>
                {show.episode_run_time?.[0] && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span>{show.episode_run_time[0]}m</span>
                      <Clock className="h-3 w-3" />
                    </div>
                  </>
                )}
                <span>•</span>
                <span>{show.number_of_seasons} {show.number_of_seasons === 1 ? 'Season' : 'Seasons'}</span>
                {show.vote_average > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                      <span className="font-bold">{show.vote_average?.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-white drop-shadow-2xl">
                {show.name}
              </h1>
            </div>

            {/* Fluid Info & Actions (No Grid Box) */}
            <div className="flex flex-col lg:flex-row justify-between gap-10 items-start lg:items-center w-full mt-10">
              <div className="flex flex-wrap items-center gap-x-10 gap-y-8 flex-1">
                <div className="border-l-2 border-primary pl-4 md:pl-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40 mb-1">Created By</p>
                  <p className="font-extrabold text-sm md:text-md text-white truncate">
                    {show.created_by?.[0]?.name || 'N/A'}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-4 md:pl-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40 mb-1">Country</p>
                  <p className="font-extrabold text-sm md:text-md text-white">
                    {getFullCountryName(show.origin_country?.[0] || 'US')}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-4 md:pl-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40 mb-1">Language</p>
                  <p className="font-extrabold text-sm md:text-md text-white">
                    {getFullLanguageName(show.original_language || 'en')}
                  </p>
                </div>
                <div className="border-l-2 border-primary pl-4 md:pl-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/40 mb-1">Age Rating</p>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                    <span className="font-black text-[10px] md:text-xs text-primary uppercase">
                      {show.content_ratings?.results?.find(r => r.iso_3166_1 === 'IN')?.rating ||
                        show.content_ratings?.results?.find(r => r.iso_3166_1 === 'US')?.rating || 'TV-MA'}
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
            {(((show.status === 'Returning Series' || show.status === 'Planned') && show.next_episode_to_air?.air_date) ||
              (show.first_air_date && new Date(show.first_air_date) > new Date())) && (
              <div className="mt-6 w-full md:hidden bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-5 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <span className="text-orange-500">🔥</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{getUpcomingLabel()}</span>
                  </div>
                  <p className="font-black text-xl mb-1 text-white">{formatDate(show.next_episode_to_air?.air_date || show.first_air_date)}</p>
                </div>
              </div>
            )}
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mt-8">
              {show.genres?.map(genre => (
                <Badge key={genre.id} variant="secondary" className="bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm border-white/10 text-[9px] px-3 py-1 uppercase tracking-widest font-black text-muted-foreground">
                  {genre.name}
                </Badge>
              ))}
            </div>

            {/* Overview Section */}
            <div className="mt-12 max-w-4xl">
              <h1 className="text-xl md:text-2xl font-black mb-6 text-white">Overview</h1>
              <p className="text-md md:text-xl text-muted-foreground leading-relaxed">
                {show.overview}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          {show.credits?.cast && show.credits.cast.length > 0 && (
            <CastRow title="Series Cast" cast={show.credits.cast} />
          )}
        </div>

        <div className="space-y-8 bg-card/30 p-6 rounded-2xl border border-border/50 backdrop-blur-sm h-fit">
          <h3 className="text-xl font-bold">Series Info</h3>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground mb-1 uppercase tracking-wider text-[10px] font-bold">Status</p>
              <p className="font-semibold">{show.status}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 uppercase tracking-wider text-[10px] font-bold">Network</p>
              <p className="font-semibold">{show.networks?.[0]?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 uppercase tracking-wider text-[10px] font-bold">Type</p>
              <p className="font-semibold">{show.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 uppercase tracking-wider text-[10px] font-bold">Episodes</p>
              <p className="font-semibold">{show.number_of_episodes}</p>
            </div>
          </div>
        </div>
      </div>

      {show.similar?.results && show.similar.results.length > 0 && (
        <div className="mt-8">
          <MovieRow title="Similar TV Shows" movies={show.similar.results} explorePath="/tv" mediaType="tv" />
        </div>
      )}

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        videoId={trailerVideo?.key}
        movieId={id}
        mediaType="tv"
      />
    </div>
  );
};

export default TvDetails;
