import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const TrailerModal = ({ isOpen, onClose, videoId, movieId, mediaType = 'movie' }) => {
  const [hasTracked, setHasTracked] = useState(false);

  // Notify background players (Hero, MovieDetails, TvDetails) to pause while modal trailer is active
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('modal-trailer-playing', { detail: { playing: true } }));
      return () => {
        window.dispatchEvent(new CustomEvent('modal-trailer-playing', { detail: { playing: false } }));
      };
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-6 md:p-8 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 z-0" 
        onClick={onClose} 
        aria-label="Close modal background"
      />
      <div className="relative z-10 w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/15 aspect-video">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black/90 text-white rounded-full h-9 w-9 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 border border-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
        {videoId ? (
          <iframe
            className="w-full h-full border-0 block"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&enablejsapi=1&playsinline=1&rel=0&iv_load_policy=3&modestbranding=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="eager"
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white bg-black">
            <p className="text-muted-foreground text-sm font-medium">Trailer not available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrailerModal;
