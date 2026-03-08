import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Star, Calendar, Heart, Bookmark, List, Tv } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import MovieRow from '../../home/components/MovieRow';
import CastRow from '../../movie/components/CastRow';
import TrailerModal from '../../movie/components/TrailerModal';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

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
        `${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits,similar,watch/providers`
      );
      setShow(res.data);
    } catch (err) {
      console.error("Failed to fetch TV details:", err);
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
      console.error("Failed to check favorite status:", err);
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
      console.error("Failed to check watchlist status:", err);
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
    }
  }, [show, user, checkFavoriteStatus, checkWatchlistStatus]);

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
      console.error("Failed to toggle favorite:", err);
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
      console.error("Failed to toggle watchlist:", err);
      toast.error("Failed to update watchlist");
    } finally {
      setIsAddingWatchlist(false);
    }
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

  const watchProvidersIN = show['watch/providers']?.results?.IN;
  const flatrateProviders = deduplicateProviders(watchProvidersIN?.flatrate);
  const rentProviders = deduplicateProviders(watchProvidersIN?.rent);
  const buyProviders = deduplicateProviders(watchProvidersIN?.buy);

  return (
    <div className="min-h-screen pb-16">
      <div className="relative h-[60vh] md:h-[75vh] w-full flex items-end justify-start overflow-hidden pt-16 mt-[-64px]">
        <div className="absolute inset-0 z-0">
          <img src={backdropUrl} alt={show.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
        </div>

        <div className="container mx-auto px-4 z-20 relative pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end md:items-start">
            <div className="hidden md:block shrink-0 w-[250px] rounded-lg overflow-hidden shadow-2xl border border-white/10 relative -bottom-16">
              <img 
                src={show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'} 
                alt={show.name}
                className="w-full h-auto object-cover"
              />
            </div>

            <div className="flex-1 max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-foreground drop-shadow-lg">
                {show.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-medium">
                <div className="flex items-center text-yellow-500 bg-black/40 px-3 py-1.5 rounded-md backdrop-blur-md">
                  <Star className="h-4 w-4 mr-1.5 fill-current" />
                  <span className="text-base">{show.vote_average?.toFixed(1)}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground bg-background/40 px-3 py-1.5 rounded-md backdrop-blur-md">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>{show.first_air_date?.substring(0, 4)}</span>
                </div>

                <div className="flex items-center text-muted-foreground bg-background/40 px-3 py-1.5 rounded-md backdrop-blur-md">
                  <Tv className="h-4 w-4 mr-1.5" />
                  <span>{show.number_of_seasons} Seasons</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {show.genres?.map(genre => (
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
                {show.overview}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="h-12 px-8 font-bold gap-2 text-md shadow-lg" onClick={() => setIsTrailerOpen(true)} disabled={!trailerVideo}>
                  <Play className="h-5 w-5 fill-current" /> 
                  {trailerVideo ? 'Watch Trailer' : 'No Trailer'}
                </Button>

                <Button size="lg" variant="secondary" className="h-12 px-8 font-bold gap-2 text-md backdrop-blur-md bg-secondary/80" onClick={handleToggleFavorite} disabled={isAddingFavorite}>
                  {isAddingFavorite ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground"></div> : <Heart className={`h-5 w-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}`} />}
                  {isFavorite ? 'In Favorites' : 'Add to Favorites'}
                </Button>

                <Button size="lg" variant="outline" className="h-12 px-8 font-bold gap-2 text-md backdrop-blur-md" onClick={handleToggleWatchlist} disabled={isAddingWatchlist}>
                  {isAddingWatchlist ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground"></div> : <Bookmark className={`h-5 w-5 ${isWatchlisted ? 'fill-primary text-primary' : ''}`} />}
                  {isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
              </div>
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
          <MovieRow title="Similar TV Shows" movies={show.similar.results} explorePath="/tv" />
        </div>
      )}

      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        videoId={trailerVideo?.key}
      />
    </div>
  );
};

export default TvDetails;
