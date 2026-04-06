import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search as SearchIcon, Film, Tv, User as UserIcon, Users, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from '../../home/components/MovieCard';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { setSearchState, updateSearchList, saveScrollPosition } from '@/store/exploreSlice';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const Search = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { results, page, totalPages, query: initialReduxQuery, type: initialReduxTab, scrollPos, hasLoaded } = useSelector(state => state.explore.search);
  
  const [query, setQuery] = useState(initialReduxQuery);
  const [activeTab, setActiveTab] = useState(initialReduxTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasRestoredScroll = useRef(false);

  // Intersection Observer for Infinite Scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "400px",
  });

  // Handle Tab Switching (Instant)
  const handleTabChange = useCallback((newTab) => {
    setActiveTab(newTab);
    setSearchParams(query ? { q: query, type: newTab } : { type: newTab });
    dispatch(setSearchState({ type: newTab, page: 1, results: [], hasLoaded: false }));
  }, [query, dispatch, setSearchParams]);

  // Debounce search query ONLY
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query !== initialReduxQuery) {
        setSearchParams(query ? { q: query, type: activeTab } : { type: activeTab });
        dispatch(setSearchState({ query, page: 1, results: [], hasLoaded: false }));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeTab, dispatch, initialReduxQuery, setSearchParams]);

  // Sync URL params to Redux on mount and URL change
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    const urlType = searchParams.get('type') || 'movie';
    
    // Only update if URL is different from local state to avoid loops
    if (urlQuery !== query) setQuery(urlQuery);
    if (urlType !== activeTab) setActiveTab(urlType);
    
    if (urlQuery !== initialReduxQuery || urlType !== initialReduxTab) {
      dispatch(setSearchState({ query: urlQuery, type: urlType, page: 1, results: [], hasLoaded: false }));
    }
  }, [searchParams, dispatch, initialReduxQuery, initialReduxTab]); // Removed local query/activeTab from deps to avoid fighting

  // Save scroll position on unmount
  useEffect(() => {
    return () => {
      dispatch(saveScrollPosition({ type: 'search', position: window.scrollY }));
    };
  }, [dispatch]);

  // Restore scroll position
  useEffect(() => {
    if (results.length > 0 && !hasRestoredScroll.current && scrollPos > 0) {
      window.scrollTo(0, scrollPos);
      hasRestoredScroll.current = true;
    }
  }, [results, scrollPos]);

  // Fetch results function
  const fetchResults = useCallback(async (searchQuery, pageNum, type) => {
    setLoading(true);
    setError(null);
    
    // Minimum loading time for smooth transition (only on first page)
    const minDelay = pageNum === 1 ? new Promise(resolve => setTimeout(resolve, 800)) : Promise.resolve();

    try {
      let endpoint = '';

      if (type === 'user') {
        const [res] = await Promise.all([
          api.get(`/user/search?query=${searchQuery}`),
          minDelay
        ]);
        dispatch(updateSearchList({
          list: res.data.users || [],
          page: 1,
          totalPages: 1
        }));
        setLoading(false);
        return;
      }

      const isSearching = searchQuery.trim() !== '';
      if (type === 'movie') {
        endpoint = isSearching
          ? `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${pageNum}&include_adult=false`
          : `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${pageNum}`;
      } else if (type === 'tv') {
        endpoint = isSearching
          ? `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${pageNum}&include_adult=false`
          : `${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${pageNum}`;
      } else if (type === 'person') {
        endpoint = isSearching
          ? `${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${pageNum}&include_adult=false`
          : `${BASE_URL}/person/popular?api_key=${TMDB_API_KEY}&page=${pageNum}`;
      }

      const [res] = await Promise.all([
        axios.get(endpoint),
        minDelay
      ]);

      dispatch(updateSearchList({
        list: res.data.results,
        page: pageNum,
        totalPages: res.data.total_pages
      }));

    } catch (err) {
      setError("Archive retrieval failed.");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Trigger fetch when state requires it
  useEffect(() => {
    if (!hasLoaded) {
      fetchResults(query, 1, activeTab);
    }
  }, [hasLoaded, query, activeTab, fetchResults]);

  // Infinite Scroll Trigger
  useEffect(() => {
    if (inView && !loading && page < totalPages && activeTab !== 'user' && hasLoaded) {
      fetchResults(query, page + 1, activeTab);
    }
  }, [inView, loading, page, totalPages, query, activeTab, fetchResults, hasLoaded]);

  const categories = [
    { id: 'movie', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Shows', icon: Tv },
    { id: 'person', label: 'Cast & Crew', icon: Users },
    { id: 'user', label: 'Members', icon: UserIcon },
  ];

  return (
    <div className="container mx-auto px-4 pt-24 pb-32 min-h-screen">
      <div className="max-w-4xl mx-auto mb-16 space-y-12">

        <div className="relative group max-w-2xl mx-auto">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder={`Identify ${categories.find(c => c.id === activeTab)?.label.toLowerCase()}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-16 h-16 text-xl bg-surface-container border-white/5 focus-visible:ring-primary shadow-2xl rounded-2xl font-bold"
          />
        </div>

        {/* Category Tabs with Motion Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1 bg-surface-container-low rounded-2xl w-fit mx-auto border border-white/5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleTabChange(cat.id)}
              className={cn(
                "relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === cat.id 
                  ? "text-primary-foreground bg-primary shadow-lg shadow-primary/20" 
                  : "text-foreground/40 hover:text-foreground"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div 
          key={`${activeTab}-${query}`}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={{
            initial: { opacity: 0, x: 20 },
            animate: { 
              opacity: 1, 
              x: 0,
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
                duration: 0.4,
                ease: "easeOut"
              }
            },
            exit: { 
              opacity: 0, 
              x: -20,
              transition: { duration: 0.2 }
            }
          }}
          className="min-h-[600px]"
        >
          {loading && page === 1 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {[...Array(12)].map((_, i) => (
                <motion.div 
                  key={i} 
                  variants={{
                    initial: { opacity: 0, scale: 0.95 },
                    animate: { opacity: 1, scale: 1 }
                  }}
                  className="space-y-4"
                >
                  <Skeleton className="aspect-[2/3] w-full rounded-2xl bg-surface-container" />
                  <Skeleton className="h-4 w-3/4 bg-surface-container" />
                </motion.div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {results.map((item, index) => {
                let cardContent = null;
                const isWide = (activeTab === 'movie' || activeTab === 'tv') && index % 14 === 7;
                
                const itemVariants = {
                  initial: { opacity: 0, y: 20, scale: 0.95 },
                  animate: { opacity: 1, y: 0, scale: 1 }
                };

                if (activeTab === 'movie' || activeTab === 'tv') {
                  cardContent = (
                    <MovieCard 
                      {...item}
                      mediaType={activeTab}
                      variant={isWide ? "wide" : "standard"}
                      className="w-full"
                    />
                  );
                } else if (activeTab === 'person') {
                  cardContent = (
                    <div
                      onClick={() => navigate(`/person/${item.id}`)}
                      className="group relative bg-surface-container-low rounded-3xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all cursor-pointer h-full"
                    >
                      <div className="aspect-[2/3] overflow-hidden">
                        <img
                          src={item.profile_path ? `https://image.tmdb.org/t/p/w500${item.profile_path}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoWcWg0E8pSjBNi0TtiZsqu8uD2PAr_K11DA&s'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-4 bg-background/50 backdrop-blur-sm">
                        <h3 className="font-black text-xs tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
                        <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest mt-1">{item.known_for_department}</p>
                      </div>
                      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-xl">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                } else if (activeTab === 'user') {
                  cardContent = (
                    <div className="group relative bg-surface-container-low rounded-3xl p-6 border border-white/5 hover:border-primary/30 transition-all text-center cursor-pointer overflow-hidden h-full">
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white/5 mb-4 group-hover:border-primary/20 transition-all">
                        <img
                          src={item.photoUrl}
                          alt={item.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-black text-sm tracking-tight group-hover:text-primary transition-colors">{item.username}</h3>
                      <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Archive Member</p>
                    </div>
                  );
                }

                return (
                  <motion.div 
                    key={`${activeTab}-${item.id || item._id}-${index}`} 
                    variants={itemVariants}
                    className={cn(
                      "h-full",
                      isWide ? "col-span-2" : "col-span-1"
                    )}
                  >
                    {cardContent}
                  </motion.div>
                );
              })}
            </div>
          ) : !loading && hasLoaded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-40"
            >
              <p className="text-sm font-black tracking-widest text-foreground/20 uppercase">No Archive Signals Found</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Infinite Scroll Trigger */}
      {activeTab !== 'user' && results.length > 0 && (
        <div
          ref={loadMoreRef}
          className="w-full flex justify-center py-24"
        >
          {loading ? (
            <Skeleton className="h-px w-32 bg-primary/20 animate-pulse" />
          ) : (
            <div className="h-px w-20 bg-white/10" />
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
