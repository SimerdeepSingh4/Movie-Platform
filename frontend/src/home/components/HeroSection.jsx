import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Info, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  // Placeholder data
  const [movie, setMovie] = useState({
    title: 'Dune: Part Two',
    overview: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    backdrop_path: 'https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vtec005uFlsSY.jpg',
    rating: 8.3,
    release_date: '2024-02-27',
  });

  return (
    <div className="relative h-[75vh] md:h-[85vh] w-full flex items-center justify-start overflow-hidden pt-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdrop_path}
          alt={movie.title}
          className="w-full h-full object-cover scale-105"
        />
        {/* Dynamic gradient overlay that looks good in both light and dark mode */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-20 relative">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Badge variant="default" className="bg-primary text-primary-foreground text-xs md:text-sm px-3 py-1">
              New Release
            </Badge>
            <div className="flex items-center text-yellow-500 font-semibold bg-black/40 px-2 py-1 rounded-md backdrop-blur-md">
              <Star className="h-4 w-4 mr-1 fill-current" />
              <span>{movie.rating}</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground bg-background/40 px-2 py-1 rounded-md backdrop-blur-md">
              {movie.release_date.substring(0, 4)}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-5 text-foreground drop-shadow-lg">
            {movie.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 line-clamp-3 leading-relaxed max-w-2xl drop-shadow-md font-medium">
            {movie.overview}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="h-12 px-8 font-bold gap-2 text-md shadow-lg shadow-primary/30 transition-all hover:scale-105">
              <Play className="h-5 w-5 fill-current" /> Watch Trailer
            </Button>
            <Button size="lg" variant="secondary" className="h-12 px-8 font-bold gap-2 text-md backdrop-blur-md bg-secondary/80 transition-all hover:scale-105 border border-border/50">
              <Info className="h-5 w-5" /> More Details
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
