import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sparkles, Library, Filter, ArrowRight, Languages as LanguagesIcon, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from '../../home/components/MovieCard';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { setMoviesState, updateMoviesList, saveScrollPosition } from '@/store/exploreSlice';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const LANGUAGES = [
  { label: 'Hindi', code: 'hi' },
  { label: 'Tamil', code: 'ta' },
  { label: 'Telugu', code: 'te' },
  { label: 'Kannada', code: 'kn' },
  { label: 'Malayalam', code: 'ml' },
  { label: 'Bengali', code: 'bn' },
  { label: 'Marathi', code: 'mr' },
  { label: 'Punjabi', code: 'pa' },
  { label: 'Gujarati', code: 'gu' },
  { label: 'English', code: 'en' },
  { label: 'Spanish', code: 'es' },
  { label: 'French', code: 'fr' },
  { label: 'Korean', code: 'ko' },
  { label: 'Japanese', code: 'ja' },
];

const Movies = () => {
  const dispatch = useDispatch();
  const { list: movies, page, totalPages, genre: selectedGenre, lang: selectedLanguage, scrollPos, hasLoaded } = useSelector(state => state.explore.movies);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [genres, setGenres] = useState([]);
  const hasRestoredScroll = useRef(false);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "400px",
  });

  // Fetch Genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
        setGenres(res.data.genres || []);
      } catch (err) {}
    };
    fetchGenres();
  }, []);

  // Save scroll position on unmount
  useEffect(() => {
    return () => {
      dispatch(saveScrollPosition({ type: 'movie', position: window.scrollY }));
    };
  }, [dispatch]);

  // Restore scroll position after data is loaded
  useEffect(() => {
    if (movies.length > 0 && !hasRestoredScroll.current && scrollPos > 0) {
      window.scrollTo(0, scrollPos);
      hasRestoredScroll.current = true;
    }
  }, [movies, scrollPos]);

  const fetchMovies = useCallback(async (pageNum, genreId, langCode) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&page=${pageNum}&sort_by=popularity.desc`;
      if (genreId) {
        endpoint += `&with_genres=${genreId}`;
      }
      if (langCode) {
        endpoint += `&with_original_language=${langCode}`;
      }
      const res = await axios.get(endpoint);

      dispatch(updateMoviesList({
        list: res.data.results,
        page: pageNum,
        totalPages: res.data.total_pages
      }));

    } catch (err) {
      setError("Failed to fetch movies.");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Handle Genre/Language changes
  const handleGenreChange = (genreId) => {
    dispatch(setMoviesState({ genre: genreId, page: 1, list: [], hasLoaded: false }));
  };

  const handleLangChange = (langCode) => {
    dispatch(setMoviesState({ lang: langCode, page: 1, list: [], hasLoaded: false }));
  };

  useEffect(() => {
    if (!hasLoaded) {
      fetchMovies(1, selectedGenre, selectedLanguage);
    }
  }, [selectedGenre, selectedLanguage, fetchMovies, hasLoaded]);

  useEffect(() => {
    if (inView && !loading && page < totalPages && hasLoaded) {
      fetchMovies(page + 1, selectedGenre, selectedLanguage);
    }
  }, [inView, loading, page, totalPages, fetchMovies, selectedGenre, selectedLanguage, hasLoaded]);

  return (
    <div className="flex min-h-screen bg-background text-foreground pt-5">
      {/* Sidebar Navigation - Desktop only */}
      <aside className="hidden lg:flex flex-col w-72 sidebar-tonal border-r border-white/5 p-8 gap-8 overflow-y-auto scrollbar-hide">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Library className="w-4 h-4" />
            The Archive
          </div>
          <h2 className="text-3xl font-black tracking-tightest leading-none mb-6">
            Curated<br/>Discovery
          </h2>
        </div>

        {/* Language Selection Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-foreground/40 text-[10px] font-bold uppercase tracking-widest px-1">
            <LanguagesIcon className="w-3 h-3" /> Language
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-xs font-bold rounded-xl h-11 px-4"
              >
                <span className="truncate">
                  {selectedLanguage ? LANGUAGES.find(l => l.code === selectedLanguage)?.label : "All Languages"}
                </span>
                <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(18rem-4rem)] bg-zinc-950 border-white/10 p-2 rounded-2xl" align="start">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-foreground/40 font-black px-3 py-2">
                Region Centric
              </DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => handleLangChange(null)}
                className="rounded-lg mb-1 focus:bg-primary focus:text-primary-foreground font-bold text-sm"
              >
                All Languages {selectedLanguage === null && <Check className="w-3 h-3 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5 mx-2 my-2" />
              <div className="grid grid-cols-1 gap-1">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code} 
                    onClick={() => handleLangChange(lang.code)}
                    className="rounded-lg focus:bg-primary focus:text-primary-foreground font-bold text-sm flex items-center justify-between"
                  >
                    {lang.label}
                    {selectedLanguage === lang.code && <Check className="w-3 h-3 ml-2" />}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-foreground/40 text-[10px] font-bold uppercase tracking-widest mb-4 mt-6">
            <Filter className="w-3 h-3" /> Categories
          </div>
          <button
            onClick={() => handleGenreChange(null)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              selectedGenre === null 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' 
                : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
            }`}
          >
            All Collections
          </button>
          <div className="h-4" />
          {genres.map(genre => (
            <button
              key={genre.id}
              onClick={() => handleGenreChange(genre.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                selectedGenre === genre.id 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' 
                  : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 px-4 md:px-12 py-12 max-w-[1600px] mx-auto overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden mb-12 space-y-8">
          <h1 className="text-4xl font-black tracking-tightest">THE ARCHIVE</h1>
          
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Language</span>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex items-center gap-2 pb-2">
                  <Button 
                    variant={selectedLanguage === null ? "default" : "outline"} 
                    onClick={() => handleLangChange(null)}
                    className="rounded-full px-6 font-bold text-xs h-9"
                  >
                    All
                  </Button>
                  {LANGUAGES.map(lang => (
                    <Button 
                      key={lang.code}
                      variant={selectedLanguage === lang.code ? "default" : "outline"}
                      onClick={() => handleLangChange(lang.code)}
                      className="rounded-full px-6 font-bold text-xs h-9"
                    >
                      {lang.label}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="h-1" />
              </ScrollArea>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Categories</span>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex items-center gap-2 pb-4">
                  <Button 
                    variant={selectedGenre === null ? "default" : "outline"} 
                    onClick={() => handleGenreChange(null)}
                    className="rounded-full px-6 font-bold text-xs h-9"
                  >
                    All
                  </Button>
                  {genres.map(g => (
                    <Button 
                      key={g.id}
                      variant={selectedGenre === g.id ? "default" : "outline"}
                      onClick={() => handleGenreChange(g.id)}
                      className="rounded-full px-6 font-bold text-xs h-9"
                    >
                      {g.name}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="h-1" />
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Dynamic Layout Components */}
        <div className="space-y-20">
          {/* Grid Section */}
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {movies.map((movie, index) => {
                // Feature variant every few items
                const isWide = index % 14 === 7;
                
                return (
                  <React.Fragment key={`${movie.id}-${index}`}>
                    <div className={cn(isWide ? "col-span-2" : "col-span-1")}>
                      <MovieCard 
                        {...movie}
                        variant={isWide ? "wide" : "standard"}
                        className="w-full"
                      />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Pagination / Load More */}
            <div
              ref={loadMoreRef}
              className="w-full flex justify-center py-24"
            >
              {loading ? (
                <div className="flex items-center gap-3 text-primary/40 font-black tracking-widest text-[10px] uppercase">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>Scanning the Archive...</span>
                </div>
              ) : (
                <div className="h-px w-20 bg-white/10" />
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Movies;
