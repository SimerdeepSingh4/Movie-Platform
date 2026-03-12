import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CastRow = ({ title, cast = [] }) => {
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

  if (!cast || cast.length === 0) return null;

  return (
    <div className="py-6 container mx-auto px-4 relative group">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      </div>

      {/* Navigation Buttons */}
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
        className="flex space-x-4 overflow-x-auto pb-6 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {cast.slice(0, 15).map((actor, index) => (
          actor.profile_path && (
            <div 
              key={`${actor.id}-${index}`} 
              className="w-[180px] shrink-0 snap-start group/actor cursor-pointer"
              onClick={() => navigate(`/person/${actor.id}`)}
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-3 relative">
                <img
                  src={`https://image.tmdb.org/t/p/w276_and_h350_face${actor.profile_path}`}
                  alt={actor.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/actor:scale-110"
                  loading="lazy"
                />
              </div>
              <p className="font-semibold text-sm leading-tight truncate px-1 group-hover/actor:text-primary transition-colors">{actor.name}</p>
              <p className="text-xs text-muted-foreground truncate mt-1 px-1">{actor.character}</p>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default CastRow;
