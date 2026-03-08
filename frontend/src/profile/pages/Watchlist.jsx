import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Trash2, Bookmark, FolderOpen } from 'lucide-react';
import MovieCard from '../../home/components/MovieCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const Watchlist = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchWatchlist = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/user/watchlist');
        const watchData = res.data.watchlist || [];

        const hydratedList = await Promise.all(
          watchData.map(async (item) => {
            if (item.source === 'internal' && item._id_custom) {
              // Internal movie is already populated by backend `.populate("_id_custom")`
              const movie = item._id_custom;
              return {
                ...movie,
                mediaType: item.mediaType,
                isInternal: true
              };
            } else {
              // TMDB movie
              try {
                const tmdbRes = await axios.get(
                  `${BASE_URL}/${item.mediaType}/${item.tmdbId}?api_key=${TMDB_API_KEY}`
                );
                return {
                  ...tmdbRes.data,
                  mediaType: item.mediaType,
                  isInternal: false
                };
              } catch (err) {
                console.error(`Failed to fetch TMDB data for ${item.tmdbId}`, err);
                return null;
              }
            }
          })
        );
        
        setWatchlist(hydratedList.filter(f => f !== null));
      } catch (err) {
        console.error("Failed to fetch watchlist:", err);
        setError("Failed to load your watchlist. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user, navigate]);

  const removeEntry = async (item) => {
    try {
      const idToRemove = item._id || item.id;
      await api.delete(`/user/watchlist/${item.mediaType || 'movie'}/${idToRemove}`);
      setWatchlist(prev => prev.filter(f => (f._id || f.id) !== idToRemove));
      toast.success("Removed from watchlist");
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
      toast.error("Failed to remove item.");
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark className="h-8 w-8 text-primary fill-primary/20" />
        <h1 className="text-4xl font-extrabold tracking-tight">Watchlist</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[250px] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-full mt-2" />
            </div>
          ))}
        </div>
      )}

      {!loading && watchlist.length === 0 && !error && (
        <div className="text-center py-24 bg-card/30 rounded-2xl border border-dashed border-border mt-8">
          <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold text-muted-foreground tracking-tight mb-2">Your watchlist is empty</h2>
          <p className="text-muted-foreground/60 max-w-sm mx-auto mb-6">
            Keep track of movies and shows you want to watch. They'll show up here.
          </p>
          <Button onClick={() => navigate('/movies')}>Find Something to Watch</Button>
        </div>
      )}

      {!loading && watchlist.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {watchlist.map((item, index) => (
            <div key={`${item._id || item.id}-${index}`} className="flex flex-col relative group">
              <MovieCard 
                {...item}
                title={item.title || item.name}
              />
              <Button 
                variant="outline" 
                size="sm"
                className="w-full mt-3 font-semibold shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  removeEntry(item);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
