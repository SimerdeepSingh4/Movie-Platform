import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Clock, History as HistoryIcon, Play } from 'lucide-react';
import MovieCard from '../../home/components/MovieCard';
import { Skeleton } from '@/components/ui/skeleton';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const History = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch history records from backend
        const res = await api.get('/user/history');
        const historyData = res.data.history || [];

        // 2. Hydrate each history item with TMDB data
        const hydratedHistory = await Promise.all(
          historyData.map(async (item) => {
            try {
              const tmdbRes = await axios.get(
                `${BASE_URL}/${item.mediaType}/${item.tmdbId}?api_key=${TMDB_API_KEY}`
              );
              return {
                ...tmdbRes.data,
                mediaType: item.mediaType,
                action: item.action, // e.g., 'watchedTrailer', 'opened'
                watchedAt: new Date(item.createdAt).toLocaleDateString()
              };
            } catch (err) {
              console.error(`Failed to fetch TMDB data for ${item.tmdbId}`, err);
              return null;
            }
          })
        );
        
        setHistory(hydratedHistory.filter(h => h !== null));
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError("Failed to load your watch history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="h-8 w-8 text-blue-500" />
        <h1 className="text-4xl font-extrabold tracking-tight">Watch History</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-12">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[250px] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
          ))}
        </div>
      )}

      {!loading && history.length === 0 && !error && (
        <div className="text-center py-24 bg-card/30 rounded-2xl border border-dashed border-border mt-8">
          <HistoryIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-2xl font-bold text-muted-foreground tracking-tight mb-2">No history found</h2>
          <p className="text-muted-foreground/60 max-w-sm mx-auto mb-6">
            Watch trailers or open movie details to build your history!
          </p>
          <Button onClick={() => navigate('/movies')}>Explore Now</Button>
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {history.map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex flex-col">
              <MovieCard 
                id={item.id} 
                title={item.title || item.name} 
                poster_path={item.poster_path} 
                rating={item.vote_average}
                mediaType={item.mediaType}
              />
              <div className="mt-2 pl-1 bg-background/50 rounded flex items-center gap-2 text-xs font-medium text-muted-foreground">
                {item.action === 'watchedTrailer' ? (
                  <><Play className="h-3 w-3 text-primary" /> Watched Trailer</>
                ) : (
                  <><HistoryIcon className="h-3 w-3" /> Opened Details</>
                )}
                <span className="opacity-50">· {item.watchedAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
