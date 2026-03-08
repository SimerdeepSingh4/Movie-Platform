import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Trash2, Heart } from 'lucide-react';
import MovieCard from '../../home/components/MovieCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const Favorites = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

        const fetchFavorites = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/user/favorites');
        const favData = res.data.favorites || [];

        const hydratedFavs = await Promise.all(
          favData.map(async (fav) => {
            if (fav.source === 'internal' || fav.source === 'custom' && fav._id_custom) {
              const movie = fav._id_custom;
              return {
                ...movie,
                mediaType: fav.mediaType,
                isInternal: true
              };
            } else {
              try {
                const tmdbRes = await axios.get(
                  `${BASE_URL}/${fav.mediaType}/${fav.tmdbId}?api_key=${TMDB_API_KEY}`
                );
                return {
                  ...tmdbRes.data,
                  mediaType: fav.mediaType,
                  isInternal: false
                };
              } catch (err) {
                console.error(`Failed to fetch TMDB data for ${fav.tmdbId}`, err);
                return null;
              }
            }
          })
        );
        
        setFavorites(hydratedFavs.filter(f => f !== null));
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
        setError("Failed to load your favorites. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, navigate]);

  const removeFavorite = async (item) => {
    try {
      const idToRemove = item._id || item.id;
      await api.delete(`/user/favorites/${item.mediaType || 'movie'}/${idToRemove}`);
      setFavorites(prev => prev.filter(f => (f._id || f.id) !== idToRemove));
      toast.success("Removed from favorites");
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      toast.error("Failed to remove from favorites.");
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-8 w-8 text-rose-500 fill-rose-500/20" />
        <h1 className="text-4xl font-extrabold tracking-tight">My Favorites</h1>
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

      {!loading && favorites.length === 0 && !error && (
        <div className="text-center py-24 bg-card/30 rounded-2xl border border-dashed border-border mt-8">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold text-muted-foreground tracking-tight mb-2">No favorites yet</h2>
          <p className="text-muted-foreground/60 max-w-sm mx-auto mb-6">
            When you add movies or TV shows to your favorites, they'll show up here.
          </p>
          <Button onClick={() => navigate('/movies')}>Explore Movies</Button>
        </div>
      )}

      {!loading && favorites.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {favorites.map((fav, index) => (
            <div key={`${fav._id || fav.id}-${index}`} className="flex flex-col relative group">
              <MovieCard 
                {...fav}
                title={fav.title || fav.name} 
              />
              <Button 
                variant="destructive" 
                size="sm"
                className="w-full mt-3 font-semibold shadow-sm hover:shadow-md transition-all opacity-90 group-hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  removeFavorite(fav);
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

export default Favorites;
