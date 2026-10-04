import React, { memo } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Authentic Netflix-style bold outline 3D number
const NetflixTop10Number = memo(({ rank }) => {
  const isTen = rank === 10;
  
  return (
    <div className="absolute left-0 bottom-8 md:bottom-9 z-20 select-none pointer-events-none drop-shadow-[0_6px_20px_rgba(0,0,0,0.95)] transition-transform duration-300 group-hover/top10:scale-105">
      <svg
        viewBox={isTen ? "0 0 120 150" : "0 0 76 150"}
        className="h-[135px] sm:h-[155px] md:h-[185px] w-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Heavy Black Drop-Shadow Outer Stroke */}
        <text
          x={isTen ? "46%" : "48%"}
          y="135"
          textAnchor="middle"
          fontSize={isTen ? "135" : "155"}
          fontFamily="'Bebas Neue', 'Impact', 'Arial Black', sans-serif"
          letterSpacing={isTen ? "-8" : "-3"}
          stroke="#000000"
          strokeWidth="14"
          strokeLinejoin="round"
          fill="none"
        >
          {rank}
        </text>

        {/* Crisp Solid White/Light Bevel Stroke (Netflix Signature) */}
        <text
          x={isTen ? "46%" : "48%"}
          y="135"
          textAnchor="middle"
          fontSize={isTen ? "135" : "155"}
          fontFamily="'Bebas Neue', 'Impact', 'Arial Black', sans-serif"
          letterSpacing={isTen ? "-8" : "-3"}
          stroke="#f5f5f5"
          strokeWidth="4"
          strokeLinejoin="round"
          fill="none"
        >
          {rank}
        </text>

        {/* Pure Solid Black Face */}
        <text
          x={isTen ? "46%" : "48%"}
          y="135"
          textAnchor="middle"
          fontSize={isTen ? "135" : "155"}
          fontFamily="'Bebas Neue', 'Impact', 'Arial Black', sans-serif"
          letterSpacing={isTen ? "-8" : "-3"}
          fill="#000000"
        >
          {rank}
        </text>
      </svg>
    </div>
  );
});

NetflixTop10Number.displayName = 'NetflixTop10Number';

const Top10Row = memo(({ title = "Top 10 Today", movies = [], explorePath = null, mediaType = "movie" }) => {
  const navigate = useNavigate();

  if (!movies || movies.length === 0) return null;
  const validMovies = movies.filter(m => m && (m.poster_path || m.posterUrl));
  const top10List = (validMovies.length >= 10 ? validMovies : movies).slice(0, 10);

  const handleClick = (movie) => {
    const cardId = movie.id || movie._id;
    const isInternal = !!movie._id;
    const finalMediaType = mediaType || movie.mediaType || movie.media_type || 'movie';
    const isInternalQuery = isInternal ? '?source=internal' : '';
    navigate(`/${finalMediaType}/${cardId}${isInternalQuery}`);
  };

  return (
    <div className="py-6 md:py-8 relative group/row w-full overflow-hidden">
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
            slidesToScroll: "auto",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 h-[320px] md:h-[400px] items-center">
            {top10List.map((movie, index) => {
              const displayTitle = movie.title || movie.name || 'Untitled';
              const finalMediaType = mediaType || movie.mediaType || movie.media_type || 'movie';
              const releaseDate = movie.release_date || movie.first_air_date;
              const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;
              const rating = movie.vote_average || movie.rating;

              const imgUrl = movie.posterUrl || (movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoWcWg0E8pSjBNi0TtiZsqu8uD2PAr_K11DA&s');

              return (
                <CarouselItem key={`top10-${movie.id || movie._id}-${index}`} className="pl-4 basis-auto">
                  <div className="py-4">
                    <div 
                      onClick={() => handleClick(movie)}
                      className="group/top10 relative shrink-0 cursor-pointer flex flex-col"
                    >
                      {/* Poster Container with padding-left for the protruding Netflix rank number */}
                      <div className="relative pl-10 sm:pl-12 md:pl-16">
                        {/* 3D Netflix-Style Rank Number overlapping bottom-left corner of poster */}
                        <NetflixTop10Number rank={index + 1} />

                        {/* The Movie Poster */}
                        <div className="relative w-[150px] md:w-[195px] aspect-[2/3] overflow-hidden rounded-2xl bg-surface-container-low transition-all duration-500 group-hover/top10:shadow-2xl group-hover/top10:shadow-primary/20 group-hover/top10:ring-1 group-hover/top10:ring-primary/40 border border-white/10">
                          <img
                            src={imgUrl}
                            alt={displayTitle}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/top10:scale-110 group-hover/top10:rotate-1"
                            loading="lazy"
                          />
                          
                          {/* Rating Badge */}
                          {rating ? (
                            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-amber-400 text-[10px] font-bold tracking-widest shadow-sm">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              {Number(rating).toFixed(1)}
                            </div>
                          ) : null}

                          {/* Hover Bottom Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent opacity-0 group-hover/top10:opacity-100 transition-all duration-300">
                            <div className="absolute bottom-3 right-3 flex items-center justify-end flex-wrap gap-1.5">
                              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/20 backdrop-blur-md rounded-md border border-primary/30 text-primary">
                                {finalMediaType}
                              </span>
                              {releaseYear && (
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-background/50 backdrop-blur-md rounded-md border border-border/50 text-muted-foreground">
                                  {releaseYear}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Title Underneath */}
                        <div className="mt-3 px-1 w-[150px] md:w-[195px]">
                          <p className="text-sm font-black truncate tracking-tighter text-foreground/80 group-hover/top10:text-primary transition-colors duration-300">
                            {displayTitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          <CarouselPrevious variant="edge" />
          <CarouselNext variant="edge" />
        </Carousel>
      </div>
    </div>
  );
});

Top10Row.displayName = 'Top10Row';

export default Top10Row;
