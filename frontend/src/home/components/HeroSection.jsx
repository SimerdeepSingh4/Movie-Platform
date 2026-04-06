import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Info, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import TrailerModal from '../../movie/components/TrailerModal';
import { toast } from 'sonner';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const HeroSection = () => {
  const { trending, trendingTV } = useSelector((state) => state.movies);
  const { user } = useSelector((state) => state.auth);
  const [movie, setMovie] = useState(null);
  const navigate = useNavigate();

  // Trailer states
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [trailerVideoId, setTrailerVideoId] = useState(null);
  const [fetchingTrailer, setFetchingTrailer] = useState(false);

  const [movieIndex, setMovieIndex] = useState(0);

  // Auto-change movie every 15 seconds
  useEffect(() => {
    const combinedTrending = [...(trending || []), ...(trendingTV || [])];
    if (combinedTrending.length === 0) return;

    // Set initial random movie if none exists
    if (!movie) {
      const initialIndex = Math.floor(Math.random() * Math.min(20, combinedTrending.length));
      setMovieIndex(initialIndex);
      setMovie(combinedTrending[initialIndex]);
    }

    const interval = setInterval(() => {
      setMovieIndex((prevIndex) => {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * Math.min(20, combinedTrending.length));
        } while (nextIndex === prevIndex && combinedTrending.length > 1);
        
        setMovie(combinedTrending[nextIndex]);
        setTrailerVideoId(null); // Reset trailer for new movie
        return nextIndex;
      });
    }, 45000);

    return () => clearInterval(interval);
  }, [trending, trendingTV, movie]);

  useEffect(() => {
    const fetchTrailerForBackdrop = async () => {
      if (!movie || trailerVideoId) return;
      setFetchingTrailer(true);
      try {
        const mediaType = movie.mediaType || movie.media_type || 'movie';
        const res = await axios.get(`https://api.themoviedb.org/3/${mediaType}/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=videos`);
        const trailer = res.data.videos?.results?.find(
          (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
        ) || res.data.videos?.results?.[0];
        
        if (trailer) {
          setTrailerVideoId(trailer.key);
        }
      } catch (err) {
        console.error("Failed to fetch trailer for hero backdrop");
      } finally {
        setFetchingTrailer(false);
      }
    };

    fetchTrailerForBackdrop();
  }, [movie]);

  const handleWatchTrailer = () => {
    if (!user) {
      return navigate('/login');
    }

    if (trailerVideoId) {
      setIsTrailerOpen(true);
    } else {
      toast.error("No trailer available for this title.");
    }
  };

  const handleMoreDetails = () => {
    if (!user) {
      navigate('/login');
    } else {
      const mediaType = movie.mediaType || movie.media_type || 'movie';
      navigate(`/${mediaType}/${movie.id}`);
    }
  };

  if (!movie) {
    return (
      <div className="relative h-[75vh] md:h-[85vh] w-full flex items-center justify-start overflow-hidden pt-16 mt-[-64px]">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  const title = movie.title || movie.name;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
    : (trailerVideoId 
        ? `https://img.youtube.com/vi/${trailerVideoId}/maxresdefault.jpg` 
        : (movie.posterUrl || (movie.poster_path ? `https://image.tmdb.org/t/p/w1280${movie.poster_path}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoWcWg0E8pSjBNi0TtiZsqu8uD2PAr_K11DA&s')));

  return (
    <div className="relative h-[85vh] md:h-[90vh] w-full flex items-center justify-start overflow-hidden pt-72 md:pt-46">
      <AnimatePresence mode="wait">
        <motion.div 
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          {/* Background Image with Ken Burns Zoom */}
          <motion.img
            src={backdropUrl}
            alt={title}
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
          
          {/* Advanced Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/10 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/20 z-0" /> 
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={movie.id + "_content"}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="container mx-auto px-4 md:px-12 z-20 relative"
        >
          <div className="max-w-4xl">
            <div className="flex items-center flex-wrap gap-4 mb-6">
              <Badge variant="default" className="bg-primary/20 backdrop-blur-md text-primary border border-primary/20 text-xs md:text-sm px-4 py-1.5 font-black uppercase tracking-widest">
                {movie?.mediaType === 'tv' ? 'Featured Series' : 'Featured Movie'}
              </Badge>

              <div className="flex items-center gap-2 text-yellow-500 font-black bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xl border border-white/10 shadow-xl">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm">{rating}</span>
              </div>

              {releaseDate && (
                <span className="text-sm font-black text-foreground/70 bg-white/5 px-3 py-1.5 rounded-full backdrop-blur-xl border border-white/5 uppercase tracking-widest">
                  {releaseDate.substring(0, 4)}
                </span>
              )}
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tightest mb-6 text-foreground drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] line-clamp-2 uppercase italic leading-[0.9]">
              {title}
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/70 mb-10 line-clamp-3 leading-relaxed max-w-2xl font-medium border-l-2 border-primary/30 pl-6">
              {movie.overview}
            </p>

            <div className="flex flex-nowrap gap-3 md:gap-6 items-center">
            <Button 
              size="lg" 
              className="h-12 md:h-14 flex-1 md:flex-none px-4 md:px-10 font-black uppercase tracking-widest text-[10px] md:text-sm gap-2 md:gap-3 rounded-full shadow-2xl shadow-primary/40 transition-all active:scale-95 bg-primary text-primary-foreground group"
              onClick={handleWatchTrailer}
              disabled={fetchingTrailer}
            >
              {fetchingTrailer ? (
                 <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
              ) : (
                 <Play className="h-5 w-5 md:h-6 md:w-6 fill-current" />
              )}
              <span className="truncate">Watch Trailer</span>
            </Button>

            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 md:h-14 flex-1 md:flex-none px-4 md:px-10 font-black uppercase tracking-widest text-[10px] md:text-sm gap-2 md:gap-3 rounded-full backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all active:scale-95 border-white/10"
              onClick={handleMoreDetails}
            >
              <Info className="h-5 w-5 md:h-6 md:w-6" /> <span className="truncate">Details</span>
            </Button>
          </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        videoId={trailerVideoId}
        movieId={movie?.id}
        mediaType={movie?.mediaType || movie?.media_type || 'movie'}
      />
    </div>
  );
};

export default HeroSection;
