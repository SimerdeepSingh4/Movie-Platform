import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

const MovieCard = ({ title, poster_path, id, rating }) => {
  // Use a fallback image if no poster is provided
  const imgUrl = poster_path 
    ? `https://image.tmdb.org/t/p/w500${poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Image';

  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
      <Link to={`/movie/${id}`}>
        <Card className="w-[150px] md:w-[200px] shrink-0 overflow-hidden group border-0 bg-transparent relative cursor-pointer">
          <CardContent className="p-0 aspect-[2/3] relative rounded-lg overflow-hidden">
            <img 
              src={imgUrl} 
              alt={title || "Movie cover"} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Play className="h-12 w-12 text-white fill-white opacity-80" />
            </div>
            {/* Optional Rating Badge */}
            {rating && (
               <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 font-bold text-xs px-2 py-1 rounded-sm backdrop-blur-sm z-10">
                 {rating.toFixed(1)}
               </div>
            )}
          </CardContent>
          <div className="mt-2 px-1">
            <p className="text-sm md:text-md font-semibold truncate text-foreground">{title}</p>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
