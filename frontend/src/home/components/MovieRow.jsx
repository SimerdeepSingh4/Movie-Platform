import React, { memo } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MovieCard from './MovieCard';
import { motion } from 'framer-motion';

const MovieRow = memo(({ title, movies = [], explorePath = null, mediaType }) => {
  const navigate = useNavigate();

  if (!movies || movies.length === 0) return null;

  return (
    <div className="py-4 relative group/row w-full overflow-hidden">
      <div className="flex justify-between items-end mb-4 px-4 md:px-12">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl md:text-3xl font-black tracking-tighter text-foreground uppercase italic drop-shadow-sm">
            {title}
          </h2>
          <div className="h-1 w-12 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
        </div>
        
        {explorePath && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 font-bold uppercase tracking-widest text-[10px] gap-2 rounded-full px-4 transition-all"
            onClick={() => navigate(explorePath)}
          >
            Explore All <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="px-4 md:px-12 relative">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 h-[300px] md:h-[380px] items-center">
            {movies.map((movie, index) => (
              <CarouselItem key={`${movie.id || movie._id}-${index}`} className="pl-4 basis-auto">
                <div className="py-4">
                  <MovieCard 
                    {...movie} 
                    title={movie.title || movie.name}
                    mediaType={mediaType || movie.mediaType || movie.media_type}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <div className="hidden md:block">
            <CarouselPrevious className="left-4 h-12 w-12 rounded-full border-border/20 bg-background/20 backdrop-blur-xl hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all opacity-0 hover:opacity-100" />
            <CarouselNext className="right-4 h-12 w-12 rounded-full border-border/20 bg-background/20 backdrop-blur-xl hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all opacity-0 hover:opacity-100" />
          </div>
        </Carousel>
      </div>
    </div>
  );
});

export default MovieRow;
