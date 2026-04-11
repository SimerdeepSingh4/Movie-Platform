import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";

const CastRow = memo(({ title, cast = [] }) => {
  const navigate = useNavigate();

  if (!cast || cast.length === 0) return null;

  return (
    <div className="py-8 relative group/row w-full overflow-hidden">
      <div className="flex justify-between items-end mb-6 px-4 md:px-12">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl md:text-3xl font-black tracking-tighter text-foreground uppercase italic drop-shadow-sm">
            {title}
          </h2>
          <div className="h-1 w-12 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
        </div>
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
          <CarouselContent className="-ml-4 pb-4">
            {cast.slice(0, 20).map((actor, index) => (
              actor.profile_path && (
                <CarouselItem key={`${actor.id}-${index}`} className="pl-4 basis-auto">
                  <div 
                    className="w-[140px] md:w-[180px] group/actor cursor-pointer snap-start"
                    onClick={() => navigate(`/person/${actor.id}`)}
                  >
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-muted mb-4 relative shadow-lg ring-1 ring-border/50 group-hover/actor:ring-primary/50 transition-all duration-500">
                      <img
                        src={`https://image.tmdb.org/t/p/w300${actor.profile_path}`}
                        alt={actor.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/actor:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/actor:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="px-1">
                      <p className="font-black text-sm md:text-base leading-tight truncate group-hover/actor:text-primary transition-colors tracking-tight italic uppercase">{actor.name}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground/70 font-bold truncate mt-1.5 uppercase tracking-widest">{actor.character}</p>
                    </div>
                  </div>
                </CarouselItem>
              )
            ))}
          </CarouselContent>
          
          <div className="hidden md:block">
            <CarouselPrevious className="left-4 h-12 w-12 rounded-full border-border/20 bg-background/20 backdrop-blur-xl hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all opacity-0 group-hover/row:opacity-100" />
            <CarouselNext className="right-4 h-12 w-12 rounded-full border-border/20 bg-background/20 backdrop-blur-xl hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all opacity-0 group-hover/row:opacity-100" />
          </div>
        </Carousel>
      </div>
    </div>
  );
});

export default CastRow;
