import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useInView } from 'react-intersection-observer';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search as SearchIcon, Film, Tv, User as UserIcon, Users } from 'lucide-react';
import MovieCard from '../../home/components/MovieCard';
import api from '@/lib/api';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const initialTab = searchParams.get('type') || 'movie';
  
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Intersection Observer for Infinite Scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "400px", // Trigger when 400px out of view from bottom
  });

  // Debounce search query
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query !== initialQuery) {
        setSearchParams(query ? { q: query, type: activeTab } : { type: activeTab });
        // Reset when query changes
        setResults([]);
        setPage(1);
        setTotalPages(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, setSearchParams, initialQuery, activeTab]);

  // Fetch results function
  const fetchResults = useCallback(async (searchQuery, pageNum, type) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';

      if (type === 'user') {
        try {
          const res = await api.get(`/user/search?query=${searchQuery}`);
          setResults(res.data.users || []);
          setTotalPages(1);
          setLoading(false);
          return;
        } catch (err) {
          console.error("User search error:", err);
          throw err;
        }
      }

      if (type === 'movie') {
        endpoint = searchQuery.trim() 
          ? `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${pageNum}&include_adult=false`
          : `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${pageNum}`;
      } else if (type === 'tv') {
        endpoint = searchQuery.trim()
          ? `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${pageNum}&include_adult=false`
          : `${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${pageNum}`;
      } else if (type === 'person') {
        endpoint = searchQuery.trim()
          ? `${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${pageNum}&include_adult=false`
          : `${BASE_URL}/person/popular?api_key=${TMDB_API_KEY}&page=${pageNum}`;
      }

      const res = await axios.get(endpoint);
      
      if (pageNum === 1) {
        setResults(res.data.results);
      } else {
        setResults(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newItems = res.data.results.filter(m => !existingIds.has(m.id));
          return [...prev, ...newItems];
        });
      }
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error("Search fetch error:", err);
      setError("Failed to fetch results.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on query or tab change
  useEffect(() => {
    setResults([]);
    setPage(1);
    fetchResults(initialQuery, 1, activeTab);
  }, [initialQuery, activeTab, fetchResults]);

  // Handle infinite scroll trigger
  useEffect(() => {
    if (inView && !loading && page < totalPages && activeTab !== 'user') {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchResults(initialQuery, nextPage, activeTab);
    }
  }, [inView, loading, page, totalPages, initialQuery, activeTab, fetchResults]);

  const categories = [
    { id: 'movie', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Shows', icon: Tv },
    { id: 'person', label: 'Cast & Crew', icon: Users },
    { id: 'user', label: 'Users', icon: UserIcon },
  ];

  return (
    <div className="container mx-auto px-4 pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Global Search
        </h1>
        
        <div className="relative group mb-8">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            type="text" 
            placeholder={`Search for ${categories.find(c => c.id === activeTab)?.label.toLowerCase()}...`} 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-14 h-16 text-xl bg-card border-border/50 focus-visible:ring-primary shadow-2xl rounded-2xl"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                activeTab === cat.id
                  ? 'bg-primary border-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-card/50 border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {!initialQuery && !loading && results.length > 0 && (
        <h2 className="text-2xl font-bold tracking-tight mb-8 text-muted-foreground/80 flex items-center gap-2">
          {activeTab === 'user' ? 'Platform Members' : `Popular in ${categories.find(c => c.id === activeTab)?.label}`}
        </h2>
      )}

      {initialQuery && !loading && results.length > 0 && (
        <h2 className="text-2xl font-bold tracking-tight mb-8 text-muted-foreground/80">
          Results for "{initialQuery}"
        </h2>
      )}

      {error && (
        <div className="text-center text-destructive mb-8 bg-destructive/10 py-4 rounded-xl border border-destructive/20">{error}</div>
      )}

      {loading && page === 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[250px] w-full rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && initialQuery && (
        <div className="text-center text-muted-foreground py-32">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-xl">No {categories.find(c => c.id === activeTab)?.label.toLowerCase()} found for "{initialQuery}".</p>
          <p className="text-sm mt-2">Try another search term or category.</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.map((item, index) => {
              if (activeTab === 'movie' || activeTab === 'tv') {
                return (
                  <MovieCard 
                    key={`${item.id}-${index}`}
                    id={item.id} 
                    title={item.title || item.name} 
                    poster_path={item.poster_path} 
                    rating={item.vote_average}
                    mediaType={activeTab}
                  />
                );
              } else if (activeTab === 'person') {
                return (
                  <div 
                    key={`${item.id}-${index}`} 
                    className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all hover:shadow-xl cursor-pointer"
                    onClick={() => navigate(`/person/${item.id}`)}
                  >
                    <div className="aspect-[2/3] overflow-hidden">
                      <img 
                        src={item.profile_path ? `https://image.tmdb.org/t/p/w500${item.profile_path}` : 'https://ik.imagekit.io/dhyh95euj/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 bg-gradient-to-t from-background to-transparent">
                      <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{item.known_for_department}</p>
                    </div>
                  </div>
                );
              } else if (activeTab === 'user') {
                return (
                  <div 
                    key={`${item._id}-${index}`} 
                    className="group relative bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/50 transition-all hover:shadow-xl text-center cursor-pointer"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-primary mb-4">
                      <img 
                        src={item.photoUrl} 
                        alt={item.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{item.username}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Platform Member</p>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Infinite Scroll Trigger */}
          {activeTab !== 'user' && (
            <div 
              ref={loadMoreRef} 
              className="w-full flex justify-center py-12 mt-8"
            >
              {loading && page > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="h-[250px] w-full rounded-2xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!loading && page >= totalPages && results.length > 0 && (
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="h-px w-12 bg-border" />
                  <p className="text-sm font-medium">No more results</p>
                  <div className="h-px w-12 bg-border" />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
