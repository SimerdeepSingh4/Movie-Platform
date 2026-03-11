import React, { useRef } from 'react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MovieCard from './MovieCard';

const MovieRow = ({ title, movies = [], explorePath = null }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="pl-4 py-6 relative group w-full overflow-hidden">
      <div className="flex justify-between items-end mb-4 px-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {explorePath && (
          <Button 
            variant="link" 
            className="text-muted-foreground hover:text-primary p-0"
            onClick={() => navigate(explorePath)}
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
      
      {/* Custom Navigation Buttons visible on hover */}
      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 hidden md:flex hover:bg-white hover:text-black"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 hidden md:flex hover:bg-white hover:text-black"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Horizontal Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie, index) => (
          <div key={`${movie.id || movie._id}-${index}`} className="snap-start shrink-0">
            <MovieCard 
              {...movie} 
              title={movie.title || movie.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieRow;
