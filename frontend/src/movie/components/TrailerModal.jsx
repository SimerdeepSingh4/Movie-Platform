import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const TrailerModal = ({ isOpen, onClose, videoId, movieId, mediaType = 'movie' }) => {
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    // Reset tracking flag when modal opens for a new video
    if (isOpen) {
      setHasTracked(false);
    }
  }, [isOpen, videoId]);

  useEffect(() => {
    // Track history when modal is open and hasn't been tracked yet
    const trackWatchHistory = async () => {
      if (isOpen && videoId && movieId && !hasTracked) {
        try {
          const isMongoId = String(movieId).length > 10;
          await api.post('/user/history', {
            tmdbId: isMongoId ? undefined : Number(movieId),
            _id_custom: isMongoId ? movieId : undefined,
            mediaType: mediaType,
            action: 'watchedTrailer',
            source: isMongoId ? 'internal' : 'tmdb'
          });
          setHasTracked(true);
        } catch (error) {
          // Silent error for history tracking
        }
      }
    };

    trackWatchHistory();
  }, [isOpen, videoId, movieId, hasTracked, mediaType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 gpu-accelerated">
      <div 
        className="absolute inset-0 z-0" 
        onClick={onClose} 
        aria-label="Close modal background"
      />
      <div className="relative z-10 w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl border border-white/10 aspect-video md:h-[450px]">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-black/80 text-white rounded-full h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
        {videoId ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white bg-black">
            <p>Trailer not available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrailerModal;
