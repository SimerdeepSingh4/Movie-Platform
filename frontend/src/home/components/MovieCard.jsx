import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Play, Star, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * MovieCard Component
 * @param {string} variant - 'standard' | 'wide' | 'spotlight'
 */
const MovieCard = memo(({ 
  title, 
  name,
  poster_path, 
  posterUrl, 
  backdrop_path,
  id, 
  _id, 
  rating, 
  release_date,
  runtime,
  overview,
  genres = [],
  mediaType, 
  media_type, 
  className,
  variant = 'standard'
}) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const cardId = id || _id;
  const isInternal = !!_id;
  const finalMediaType = mediaType || media_type || 'movie';
  const displayTitle = title || name || 'Untitled';

  const handleClick = () => {
    if (user) {
      navigate(`/${finalMediaType}/${cardId}${isInternal ? '?source=internal' : ''}`);
    } else {
      navigate('/login');
    }
  };

  const imgUrl = (variant === 'wide' || variant === 'spotlight') && (backdrop_path || posterUrl)
    ? (posterUrl || `https://image.tmdb.org/t/p/w1280${backdrop_path}`)
    : (posterUrl || (poster_path
        ? `https://image.tmdb.org/t/p/w500${poster_path}`
        : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoWcWg0E8pSjBNi0TtiZsqu8uD2PAr_K11DA&s'));

  // Shared Rating Component
  const RatingBadge = ({ value, className }) => {
    if (!value) return null;
    return (
      <div className={cn("flex items-center gap-1 px-2 py-0.5 bg-primary/20 backdrop-blur-md border border-primary/20 rounded-full text-primary text-[10px] font-bold tracking-widest uppercase shadow-sm", className)}>
        <Star className="w-2.5 h-2.5 fill-current" />
        {value.toFixed(1)}
      </div>
    );
  };

  if (variant === 'spotlight') {
    return (
      <div
        onClick={handleClick}
        className={cn("group/spotlight relative w-full h-[400px] md:h-[500px] cursor-pointer overflow-hidden rounded-3xl border border-border/30 hover:border-primary/30 transition-colors duration-500", className)}
      >
        <img 
          src={imgUrl} 
          alt={displayTitle} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover/spotlight:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
        
        <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              <RatingBadge value={rating} className="px-3 py-1" />
              {release_date && (
                <div className="text-[10px] text-foreground/50 font-black uppercase tracking-widest ring-1 ring-inset ring-foreground/10 px-2 py-1 rounded-md">
                  {new Date(release_date).getFullYear()}
                </div>
              )}
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tightest leading-[0.8] text-glow uppercase drop-shadow-2xl">
              {displayTitle}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground line-clamp-2 md:line-clamp-3 font-medium max-w-xl">
              {overview}
            </p>
            <div className="pt-4">
              <span className="text-xs font-black uppercase tracking-tightest text-primary border-b border-primary/30 pb-0.5 group-hover/spotlight:text-foreground transition-colors group-hover/spotlight:border-foreground/30">Explore Piece</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'wide') {
    return (
      <div
        onClick={handleClick}
        className={cn("group/wide relative w-full aspect-video cursor-pointer overflow-hidden rounded-2xl border border-border/30 hover:border-primary/40 transition-all duration-300", className)}
      >
        <img 
          src={imgUrl} 
          alt={displayTitle} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover/wide:scale-110"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
        
        <RatingBadge value={rating} className="absolute top-4 right-4 z-10 scale-90 group-hover/wide:scale-100 transition-transform shadow-xl" />

        <div className="absolute bottom-0 left-0 p-5 w-full">
           <h3 className="text-xl font-black text-foreground tracking-tighter leading-none line-clamp-1 group-hover/wide:text-primary transition-colors">{displayTitle}</h3>
           <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
             <span className="bg-muted px-1.5 py-0.5 rounded text-[8px]">{finalMediaType}</span>
             {release_date && <span>{new Date(release_date).getFullYear()}</span>}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className={cn("group/card shrink-0 w-[150px] md:w-[200px] cursor-pointer", className)}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-surface-container-low transition-all duration-500 group-hover/card:shadow-2xl group-hover/card:shadow-primary/10 group-hover/card:ring-1 group-hover/card:ring-primary/30">
        <img
          src={imgUrl}
          alt={displayTitle}
          className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 group-hover/card:rotate-1"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300">
           <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
             <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-background/60 backdrop-blur-md rounded-md border border-border/50 text-foreground/80">
               {finalMediaType}
             </span>
             {release_date && (
                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-background/40 backdrop-blur-md rounded-md border border-border/50 text-muted-foreground">
                  {new Date(release_date).getFullYear()}
                </span>
             )}
           </div>
        </div>

        <RatingBadge value={rating} className="absolute top-3 right-3 z-10 scale-90 group-hover/card:scale-100 transition-transform" />
      </div>

      <div className="mt-3 px-1">
        <p className="text-sm font-black truncate tracking-tighter text-foreground/80 group-hover/card:text-foreground transition-colors duration-300">{displayTitle}</p>
      </div>
    </div>
  );
});

export default MovieCard;
