import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import api from '@/lib/api';
import { useQuickView } from '@/context/QuickViewContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Info, Heart, Bookmark, X, Star, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TrailerModal from '@/movie/components/TrailerModal';
import { toast } from 'sonner';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const QuickViewDrawer = () => {
  const { isOpen, activeItem, closeQuickView } = useQuickView();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // UI state
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  
  // Trailer state
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [trailerVideoId, setTrailerVideoId] = useState(null);
  const [fetchingTrailer, setFetchingTrailer] = useState(false);

  // Sync favorites/watchlist status when item opens
  useEffect(() => {
    if (!activeItem || !user || !isOpen) return;

    const checkStatus = async () => {
      setLoadingStatus(true);
      const itemId = activeItem.id || activeItem._id;
      try {
        const [favRes, watchRes] = await Promise.all([
          api.get('/user/favorites'),
          api.get('/user/watchlist')
        ]);
        
        const favorites = favRes.data.favorites || [];
        const watchlist = watchRes.data.watchlist || [];
        
        const isFav = activeItem._id
          ? favorites.some(fav => fav._id_custom?._id === activeItem._id || fav._id_custom === activeItem._id)
          : favorites.some(fav => fav.tmdbId === Number(itemId));
          
        const isWatch = activeItem._id
          ? watchlist.some(item => item._id_custom?._id === activeItem._id || item._id_custom === activeItem._id)
          : watchlist.some(item => item.tmdbId === Number(itemId));
          
        setIsFavorite(isFav);
        setIsWatchlisted(isWatch);
      } catch (err) {
        console.error("Failed to check status in drawer:", err);
      } finally {
        setLoadingStatus(false);
      }
    };
    
    checkStatus();
  }, [activeItem, user, isOpen]);

  // Fetch trailer on demand
  useEffect(() => {
    if (!activeItem || !isOpen) return;
    
    const fetchTrailer = async () => {
      setFetchingTrailer(true);
      setTrailerVideoId(null);
      const itemId = activeItem.id || activeItem._id;
      const mediaType = activeItem.mediaType || 'movie';
      try {
        if (activeItem.isInternal) {
          const res = await api.get(`/movies/${itemId}`);
          const localMovie = res.data.movie;
          if (localMovie.trailerUrl) {
            const key = localMovie.trailerUrl.split('v=')[1] || localMovie.trailerUrl.split('/').pop();
            setTrailerVideoId(key);
          }
        } else {
          const res = await axios.get(
            `https://api.themoviedb.org/3/${mediaType}/${itemId}?api_key=${TMDB_API_KEY}&append_to_response=videos`
          );
          const trailer = res.data.videos?.results?.find(
            (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
          ) || res.data.videos?.results?.[0];
          
          if (trailer) {
            setTrailerVideoId(trailer.key);
          }
        }
      } catch (err) {
        console.error("Failed to fetch trailer in QuickView:", err);
      } finally {
        setFetchingTrailer(false);
      }
    };

    fetchTrailer();
  }, [activeItem, isOpen]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!activeItem) return null;

  const title = activeItem.title || activeItem.name || 'Untitled';
  const rating = activeItem.rating || activeItem.vote_average ? (activeItem.rating || activeItem.vote_average).toFixed(1) : 'N/A';
  const releaseDate = activeItem.release_date || activeItem.first_air_date || '';
  const backdropUrl = activeItem.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${activeItem.backdrop_path}` 
    : (activeItem.posterUrl || `https://image.tmdb.org/t/p/w500${activeItem.poster_path}`);

  const handleToggleFavorite = async () => {
    if (!user) {
      closeQuickView();
      return navigate('/login');
    }
    const itemId = activeItem.id || activeItem._id;
    try {
      if (isFavorite) {
        await api.delete(`/user/favorites/${activeItem.mediaType || 'movie'}/${itemId}`);
        setIsFavorite(false);
        toast.info("Removed from favorites");
      } else {
        await api.post('/user/favorites', {
          tmdbId: !activeItem._id ? Number(itemId) : undefined,
          _id_custom: activeItem._id ? activeItem._id : undefined,
          mediaType: activeItem.mediaType || 'movie',
          source: activeItem._id ? 'internal' : 'tmdb'
        });
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (err) {
      toast.error("Failed to update favorites");
    }
  };

  const handleToggleWatchlist = async () => {
    if (!user) {
      closeQuickView();
      return navigate('/login');
    }
    const itemId = activeItem.id || activeItem._id;
    try {
      if (isWatchlisted) {
        await api.delete(`/user/watchlist/${activeItem.mediaType || 'movie'}/${itemId}`);
        setIsWatchlisted(false);
        toast.info("Removed from watchlist");
      } else {
        await api.post('/user/watchlist', {
          tmdbId: !activeItem._id ? Number(itemId) : undefined,
          _id_custom: activeItem._id ? activeItem._id : undefined,
          mediaType: activeItem.mediaType || 'movie',
          source: activeItem._id ? 'internal' : 'tmdb'
        });
        setIsWatchlisted(true);
        toast.success("Added to watchlist");
      }
    } catch (err) {
      toast.error("Failed to update watchlist");
    }
  };

  const handleMoreDetails = () => {
    closeQuickView();
    const itemId = activeItem.id || activeItem._id;
    const isInternalQuery = activeItem.isInternal ? '?source=internal' : '';
    navigate(`/${activeItem.mediaType || 'movie'}/${itemId}${isInternalQuery}`);
  };

  const handleWatchTrailer = () => {
    if (trailerVideoId) {
      setIsTrailerOpen(true);
    } else {
      toast.error("No trailer available for this title.");
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] cursor-pointer"
              onClick={closeQuickView}
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] md:max-h-[75vh] w-full max-w-5xl mx-auto rounded-t-[32px] bg-background/90 backdrop-blur-2xl border-t border-x border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-[95] overflow-y-auto"
            >
              {/* Close Button */}
              <button 
                onClick={closeQuickView}
                className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-105 active:scale-95 transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col md:flex-row h-full">
                {/* Visual / Image Side */}
                <div className="relative w-full md:w-2/5 aspect-video md:aspect-[3/4] overflow-hidden md:rounded-tl-[32px]">
                  <img 
                    src={backdropUrl} 
                    alt={title} 
                    className="w-full h-full object-cover"
                  />
                  {/* Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent hidden md:block z-10" />
                  <div className="absolute inset-0 bg-black/10 z-0" />

                  {/* Play Trigger Overlay */}
                  {trailerVideoId && (
                    <button 
                      onClick={handleWatchTrailer}
                      className="absolute inset-0 flex items-center justify-center z-20 group"
                    >
                      <div className="h-14 w-14 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/30 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
                        <Play className="h-6 w-6 fill-current ml-0.5" />
                      </div>
                    </button>
                  )}
                </div>

                {/* Content Side */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Tags & Rating */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="default" className="bg-primary/20 backdrop-blur-md text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest px-3 py-1">
                        {activeItem.mediaType === 'tv' ? 'TV Series' : 'Movie'}
                      </Badge>
                      
                      {rating && rating !== 'N/A' && (
                        <div className="flex items-center gap-1.5 text-yellow-500 font-black bg-white/5 px-2.5 py-1 rounded-full border border-white/5 text-xs">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>{rating}</span>
                        </div>
                      )}

                      {releaseDate && (
                        <span className="text-xs font-black text-foreground/60">
                          {new Date(releaseDate).getFullYear()}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-black tracking-tightest leading-tight uppercase italic text-white">
                      {title}
                    </h2>

                    {/* Overview */}
                    <p className="text-sm md:text-base text-muted-foreground/90 leading-relaxed font-medium line-clamp-4 md:line-clamp-6 border-l-2 border-primary/30 pl-4">
                      {activeItem.overview || 'No description available for this archive entry.'}
                    </p>
                  </div>

                  {/* Action Row */}
                  <div className="mt-8 flex flex-wrap gap-4 items-center border-t border-white/5 pt-6">
                    {/* Primary Button: Watch Trailer */}
                    <Button 
                      onClick={handleWatchTrailer}
                      disabled={fetchingTrailer}
                      className="h-11 px-6 font-black uppercase tracking-widest text-xs gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10 active:scale-95 transition-all flex-1 md:flex-none"
                    >
                      {fetchingTrailer ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Play className="h-4 w-4 fill-current" />
                      )}
                      Watch Preview
                    </Button>

                    {/* Details Button */}
                    <Button 
                      variant="outline"
                      onClick={handleMoreDetails}
                      className="h-11 px-6 font-black uppercase tracking-widest text-xs gap-2 rounded-full bg-white/5 border-white/10 hover:bg-white/10 active:scale-95 transition-all flex-1 md:flex-none"
                    >
                      <Info className="h-4 w-4" />
                      More Info
                    </Button>

                    {/* Favorites & Watchlist Toggle Toggles */}
                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end md:ml-auto">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleToggleWatchlist}
                        disabled={loadingStatus}
                        className="h-11 w-11 rounded-full border border-white/10 hover:bg-white/5 text-white active:scale-95 transition-all shadow-sm"
                      >
                        <Bookmark className={`h-4.5 w-4.5 ${isWatchlisted ? 'fill-primary text-primary' : ''}`} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleToggleFavorite}
                        disabled={loadingStatus}
                        className="h-11 w-11 rounded-full border border-white/10 hover:bg-white/5 text-rose-500 active:scale-95 transition-all shadow-sm"
                      >
                        <Heart className={`h-4.5 w-4.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Embedded Trailer Modal */}
      {trailerVideoId && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          videoId={trailerVideoId}
          movieId={activeItem.id || activeItem._id}
          mediaType={activeItem.mediaType || 'movie'}
        />
      )}
    </>
  );
};

export default QuickViewDrawer;
