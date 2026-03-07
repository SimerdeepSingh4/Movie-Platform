import React, { useRef } from 'react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import MovieCard from './MovieCard';

const MovieRow = ({ title, movies = [] }) => {
  const scrollRef = useRef(null);

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
    <div className="py-6 container mx-auto px-4 relative group">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <Button variant="link" className="text-muted-foreground hover:text-primary p-0">
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
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
          <div key={movie.id || index} className="snap-start shrink-0">
            <MovieCard 
              id={movie.id} 
              title={movie.title || movie.name} 
              poster_path={movie.poster_path} 
              rating={movie.vote_average}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieRow;
