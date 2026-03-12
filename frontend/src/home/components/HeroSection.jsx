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
  const { trending } = useSelector((state) => state.movies);
  const { user } = useSelector((state) => state.auth);
  const [movie, setMovie] = useState(null);
  const navigate = useNavigate();

  // Trailer states
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [trailerVideoId, setTrailerVideoId] = useState(null);
  const [fetchingTrailer, setFetchingTrailer] = useState(false);

  useEffect(() => {
    if (trending && trending.length > 0) {
      // Pick a random movie from the top 15 trending
      const randomIndex = Math.floor(Math.random() * Math.min(25, trending.length));
      setMovie(trending[randomIndex]);
      setTrailerVideoId(null); // Reset when a new movie is picked
    }
  }, [trending]);

  const handleWatchTrailer = async () => {
    if (!user) {
      return navigate('/login');
    }

    if (trailerVideoId) {
      setIsTrailerOpen(true);
      return;
    }
    
    setFetchingTrailer(true);
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=videos`);
      const trailer = res.data.videos?.results?.find(
        (vid) => vid.site === 'YouTube' && vid.type === 'Trailer'
      ) || res.data.videos?.results?.[0];
      
      if (trailer) {
        setTrailerVideoId(trailer.key);
        setIsTrailerOpen(true);
      } else {
        toast.error("No trailer available for this movie.");
      }
    } catch (err) {
      toast.error("Failed to fetch the trailer at this time.");
    } finally {
      setFetchingTrailer(false);
    }
  };

  const handleMoreDetails = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/movie/${movie.id}`);
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
  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'https://images.unsplash.com/photo-1772678595035-4ff18bac6d93?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  return (
    <div className="relative h-[75vh] md:h-[85vh] w-full flex items-center justify-start overflow-hidden pt-16">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover scale-105"
          />
          {/* Dynamic gradient overlay that looks good in both light and dark mode */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/0 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/0 to-transparent z-10" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container mx-auto px-4 z-20 relative">
        <motion.div 
          key={`content-${movie.id}`}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Badge variant="default" className="bg-primary text-primary-foreground text-xs md:text-sm px-3 py-1">
              Trending
            </Badge>
            <div className="flex items-center text-yellow-500 font-semibold bg-black/40 px-2 py-1 rounded-md backdrop-blur-md">
              <Star className="h-4 w-4 mr-1 fill-current" />
              <span>{rating}</span>
            </div>
            {releaseDate && (
              <span className="text-sm font-medium text-muted-foreground bg-background/40 px-2 py-1 rounded-md backdrop-blur-md">
                {releaseDate.substring(0, 4)}
              </span>
            )}
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-5 text-foreground drop-shadow-lg line-clamp-2 ">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 line-clamp-3 leading-relaxed max-w-2xl drop-shadow-md font-medium">
            {movie.overview}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="h-12 px-8 font-bold gap-2 text-md shadow-lg shadow-primary/30 transition-all hover:scale-105"
              onClick={handleWatchTrailer}
              disabled={fetchingTrailer}
            >
              {fetchingTrailer ? (
                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                 <Play className="h-5 w-5 fill-current" />
              )}
              Watch Trailer
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              className="h-12 px-8 font-bold gap-2 text-md backdrop-blur-md bg-secondary/80 transition-all hover:scale-105 border border-border/50"
              onClick={handleMoreDetails}
            >
              <Info className="h-5 w-5" /> More Details
            </Button>
          </div>
        </motion.div>
      </div>

      <TrailerModal 
        isOpen={isTrailerOpen} 
        onClose={() => setIsTrailerOpen(false)} 
        videoId={trailerVideoId}
        movieId={movie?.id}
      />
    </div>
  );
};

export default HeroSection;
