import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  ExternalLink,
  Clapperboard,
  Calendar,
  Tag,
  Monitor,
  Users,
  X,
  Sparkles,
  Info,
  Tv,
  Globe,
  Clock,
  Layout,
  Layers,
  Heart,
  RefreshCcw
} from 'lucide-react';
import axios from 'axios';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [movieToDelete, setMovieToDelete] = useState(null);
  
  const [actorSearchQuery, setActorSearchQuery] = useState('');
  const [actorSearchResults, setActorSearchResults] = useState([]);
  const [isSearchingActors, setIsSearchingActors] = useState(false);
  const [newProviderName, setNewProviderName] = useState('');

  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    releaseDate: '',
    trailerUrl: '',
    genre: 'Drama',
    category: "Movie",
    posterUrl: "",
    backdropUrl: "",
    directedBy: "",
    country: "",
    language: "",
    ageRating: "",
    runtime: "",
    status: "",
    network: "",
    type: "",
    totalEpisodes: "",
    totalSeasons: "",
    cast: [],
    watchProviders: []
  });

  const categories = ["Movie", "TV", "Anime", "Documentary"];
  const genres = ["Action", "Drama", "Comedy", "Thriller", "Romance", "Sci-Fi", "Animation", "Adventure", "Family", "Fantasy", "Horror", "Mystery", "War", "Western"];
  const MOVIE_RATINGS = ["NR", "U", "UA", "A", "G", "PG", "PG-13", "R", "NC-17"];
  const TV_RATINGS = ["NR", "U", "UA", "A", "TV-Y", "TV-Y7", "TV-G", "TV-PG", "TV-14", "TV-MA"];
  const TV_STATUS = ["Returning Series", "Ended", "Canceled", "Pilot", "In Production"];
  const TV_TYPES = ["Scripted", "Reality", "Documentary", "News", "Talk", "Miniseries"];

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (!actorSearchQuery.trim()) {
      setActorSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingActors(true);
      try {
        const response = await axios.get(
          `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${actorSearchQuery}`
        );
        setActorSearchResults(response.data.results.slice(0, 5));
      } catch (error) {
        console.error("Actor search failed:", error);
      } finally {
        setIsSearchingActors(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [actorSearchQuery, TMDB_API_KEY]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/movies');
      setMovies(res.data.movies || []);
    } catch (err) {
      toast.error("Failed to sync movie database.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addActorToCast = (actor) => {
    setFormData(prev => {
      if (prev.cast.some(c => c.id === actor.id)) {
        toast.error("Actor already in cast list.");
        return prev;
      }
      return {
        ...prev,
        cast: [...prev.cast, { id: actor.id, name: actor.name, profile_path: actor.profile_path }]
      };
    });
    setActorSearchQuery('');
    setActorSearchResults([]);
    toast.success(`${actor.name} added to cast`);
  };

  const removeActorFromCast = (actorId) => {
    setFormData(prev => ({
      ...prev,
      cast: prev.cast.filter(c => c.id !== actorId)
    }));
  };

  const addManualProvider = () => {
    if (!newProviderName.trim()) return;
    setFormData(prev => {
      if (prev.watchProviders.some(p => p.name.toLowerCase() === newProviderName.toLowerCase())) {
        toast.error("Resource already exists.");
        return prev;
      }
      return {
        ...prev,
        watchProviders: [...prev.watchProviders, { id: Date.now(), name: newProviderName.trim(), logo_path: null }]
      };
    });
    setNewProviderName('');
    toast.success(`Platform ${newProviderName} added`);
  };

  const removeNetworkFromProviders = (networkId) => {
    setFormData(prev => ({
      ...prev,
      watchProviders: prev.watchProviders.filter(p => p.id !== networkId)
    }));
  };

  const openAddDialog = () => {
    setCurrentMovie(null);
    setFormData({
      title: '',
      description: '',
      releaseDate: '',
      trailerUrl: '',
      genre: 'Drama',
      category: 'Movie',
      posterUrl: '',
      backdropUrl: '',
      directedBy: "",
      country: "",
      language: "",
      ageRating: "",
      runtime: "",
      status: "",
      network: "",
      type: "",
      totalEpisodes: "",
      totalSeasons: "",
      cast: [],
      watchProviders: []
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (movie) => {
    setCurrentMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
      trailerUrl: movie.trailerUrl || '',
      genre: movie.genre || 'Drama',
      category: movie.category || 'Movie',
      posterUrl: movie.posterUrl || '',
      backdropUrl: movie.backdropUrl || '',
      directedBy: movie.directedBy || "",
      country: movie.country || "",
      language: movie.language || "",
      ageRating: movie.ageRating || "",
      runtime: movie.runtime || "",
      status: movie.status || "",
      network: movie.network || "",
      type: movie.type || "",
      totalEpisodes: movie.totalEpisodes || "",
      totalSeasons: movie.totalSeasons || "",
      cast: movie.cast || [],
      watchProviders: movie.watchProviders || []
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentMovie) {
        await api.patch(`/movies/${currentMovie._id}`, formData);
        toast.success("Content updated successfully.");
      } else {
        await api.post('/movies', formData);
        toast.success("New content added successfully.");
      }
      setIsDialogOpen(false);
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving content.");
    }
  };

  const handleDelete = async () => {
    if (!movieToDelete) return;
    try {
      await api.delete(`/movies/${movieToDelete._id}`);
      toast.success("Content deleted successfully.");
      setIsDeleteDialogOpen(false);
      fetchMovies();
    } catch (err) {
      toast.error("Error deleting content.");
    }
  };

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="relative">
          <h2 className="text-2xl font-black tracking-tighter uppercase text-foreground leading-none">
            Movie <span className="text-primary italic font-serif lowercase">Management</span>
          </h2>
          <p className="text-muted-foreground mt-2 text-sm font-medium tracking-tight opacity-60">
            Maintain the cinematic archives and metadata.
          </p>
        </div>
        <Button 
          onClick={openAddDialog} 
          className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 gap-3 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Content
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 group">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all" />
          <Input 
            placeholder="Search by title, genre, or category..." 
            className="h-12 pl-12 bg-surface-container-low border-border/50 focus:border-primary/50 text-sm rounded-xl transition-all shadow-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-border/40 bg-card/30 shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#0c0c0c]/50 text-muted-foreground uppercase text-[0.65rem] font-black tracking-[0.25em] border-b border-border/50">
              <tr>
                <th className="px-8 py-6">Content</th>
                <th className="px-6 py-6 text-center">Type</th>
                <th className="px-6 py-6 text-center">Genre</th>
                <th className="px-6 py-6 text-center">Release</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="flex items-center gap-6"><Skeleton className="h-24 w-16 rounded-xl bg-white/5" /><div className="space-y-3 flex-1"><Skeleton className="h-4 w-1/2 bg-white/5" /><Skeleton className="h-3 w-full bg-white/5" /></div></div></td>
                    <td className="px-6 py-6"><Skeleton className="h-6 w-20 mx-auto bg-white/5" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-6 w-24 mx-auto bg-white/5" /></td>
                    <td className="px-6 py-6"><Skeleton className="h-6 w-28 mx-auto bg-white/5" /></td>
                    <td className="px-8 py-6 text-right"><Skeleton className="h-10 w-10 ml-auto rounded-xl bg-white/5" /></td>
                  </tr>
                ))
              ) : filteredMovies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-6 opacity-30">
                      <Clapperboard className="h-16 w-16 text-primary" />
                      <div className="space-y-2">
                        <p className="text-xl font-black uppercase tracking-[0.2em]">No Content Found</p>
                        <p className="text-sm font-medium">Try adjusting your search query.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMovies.map((movie) => (
                  <tr key={movie._id} className="hover:bg-primary/[0.02] transition-all group/row">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-24 w-16 shrink-0 bg-white/5 rounded-xl overflow-hidden shadow-xl relative group-hover/row:scale-105 transition-transform duration-500 border border-white/5">
                          {movie.posterUrl ? (
                            <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
                              <Film className="h-5 w-5 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-md">
                          <div className="font-bold text-lg text-foreground group-hover/row:text-primary transition-colors tracking-tight line-clamp-1">{movie.title}</div>
                          <div className="text-muted-foreground/60 text-xs font-normal mt-1 line-clamp-2 leading-relaxed tracking-tight italic">
                            {movie.description}
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            {movie.cast && movie.cast.length > 0 && (
                              <div className="flex -space-x-1.5">
                                {movie.cast.slice(0, 3).map((c, i) => (
                                  <div key={i} className="h-5 w-5 rounded-full border border-background overflow-hidden bg-white/10">
                                    {c.profile_path ? <img src={`https://image.tmdb.org/t/p/w200${c.profile_path}`} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-primary/20" />}
                                  </div>
                                ))}
                                {movie.cast.length > 3 && <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[7px] font-black border border-background">+{movie.cast.length - 3}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <Badge variant="outline" className="rounded-lg border-border/50 bg-background/50 px-3 py-1 font-black uppercase text-[0.6rem] tracking-widest text-primary/70">
                        {movie.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="text-muted-foreground/80 font-bold flex items-center justify-center gap-2 text-[0.7rem] uppercase tracking-widest leading-none">
                        <Tag className="h-3 w-3 text-primary opacity-50" /> {movie.genre}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="text-muted-foreground/60 font-medium text-xs tracking-tighter tabular-nums">
                         {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary border border-transparent hover:border-border/50 transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] bg-surface-container-high border-border/50 p-2 rounded-2xl shadow-3xl animate-in zoom-in-95">
                          <DropdownMenuLabel className="px-3 py-2 text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border/30 mx-1" />
                          <DropdownMenuItem onClick={() => openEditDialog(movie)} className="px-3 py-2.5 text-xs cursor-pointer flex items-center gap-3 font-bold rounded-xl focus:bg-primary/10 transition-colors">
                            <Edit className="h-3.5 w-3.5 text-primary" /> Edit Movie
                          </DropdownMenuItem>
                          {movie.trailerUrl && (
                             <DropdownMenuItem onClick={() => window.open(movie.trailerUrl, '_blank')} className="px-3 py-2.5 text-xs cursor-pointer flex items-center gap-3 font-bold rounded-xl focus:bg-primary/10 transition-colors">
                               <ExternalLink className="h-3.5 w-3.5 text-primary" /> Preview
                             </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-border/30 mx-1" />
                          <DropdownMenuItem 
                            onClick={() => {
                              setMovieToDelete(movie);
                              setIsDeleteDialogOpen(true);
                            }} 
                            className="px-3 py-2.5 text-xs cursor-pointer flex items-center gap-3 font-bold rounded-xl text-destructive focus:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto bg-surface-container-low border-border/50 p-0 rounded-[2.5rem] shadow-4xl scrollbar-hide animate-in zoom-in-95 duration-500">
          <div className="sticky top-0 z-10 bg-surface-container-low border-b border-border/30 p-8 px-10 flex items-center justify-between">
            <div className="space-y-1">
               <DialogTitle className="text-2xl font-black uppercase tracking-tightest leading-none">
                 {currentMovie ? 'Edit' : 'Add New'} <span className="text-primary italic">Content</span>
               </DialogTitle>
               <DialogDescription className="text-muted-foreground font-medium text-sm tracking-tight opacity-70">
                 {currentMovie ? `Updating details for: ${currentMovie.title}` : 'Fill in the information to add a new title to the library.'}
               </DialogDescription>
            </div>
            <button onClick={() => setIsDialogOpen(false)} className="h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
               <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-10 pt-8 space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Info className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Primary Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2.5 md:col-span-2">
                  <Label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</Label>
                  <Input 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    placeholder="Enter movie or show title" 
                    className="h-12 bg-[#0a0a0a] border-border/50 rounded-xl focus:border-primary/50 text-base font-bold tracking-tight shadow-inner"
                    required
                  />
                </div>

                <div className="space-y-2.5 md:col-span-2">
                  <Label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground ml-1">Brief Description</Label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="flex min-h-[120px] w-full rounded-xl border border-border/50 bg-[#0a0a0a] px-4 py-3 text-[15px] font-medium tracking-tight focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30 leading-relaxed shadow-inner"
                    placeholder="Short summary of the story..."
                    required
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-xl border border-border/50 bg-[#0a0a0a] px-4 text-sm font-bold tracking-tight focus:ring-1 focus:ring-primary/50 appearance-none transition-all cursor-pointer shadow-inner"
                  >
                    {categories.map(cat => <option key={cat} value={cat} className="bg-[#0f0f0f]">{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground ml-1">Genre</Label>
                  <select 
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-xl border border-border/50 bg-[#0a0a0a] px-4 text-sm font-bold tracking-tight focus:ring-1 focus:ring-primary/50 appearance-none transition-all cursor-pointer shadow-inner"
                  >
                    {genres.map(g => <option key={g} value={g} className="bg-[#0f0f0f]">{g}</option>)}
                  </select>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground ml-1">Release Date</Label>
                  <Input 
                    type="date" 
                    name="releaseDate" 
                    value={formData.releaseDate} 
                    onChange={handleInputChange} 
                    className="h-12 bg-[#0a0a0a] border-border/50 rounded-xl focus:border-primary/50 [color-scheme:dark] shadow-inner"
                    required
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground ml-1">Trailer URL</Label>
                  <Input 
                    name="trailerUrl" 
                    value={formData.trailerUrl} 
                    onChange={handleInputChange} 
                    placeholder="https://youtube.com/..." 
                    className="h-12 bg-[#0a0a0a] border-border/50 rounded-xl focus:border-primary/50 shadow-inner"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Media & Assets</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">Poster Image</Label>
                  <div className="flex flex-col gap-3 p-4 bg-muted/10 rounded-2xl border border-border/30 border-dashed">
                     <div className="h-32 w-24 rounded-lg bg-[#0a0a0a] overflow-hidden border border-border/50 shadow-lg mx-auto">
                       {formData.posterUrl ? <img src={formData.posterUrl} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-muted-foreground/20"><Film className="h-6 w-6" /></div>}
                     </div>
                     <Input 
                        name="posterUrl" 
                        value={formData.posterUrl} 
                        onChange={handleInputChange} 
                        placeholder="Image URL" 
                        className="h-10 bg-[#0a0a0a] border-border/50 rounded-lg text-xs shadow-inner"
                      />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">Backdrop Image</Label>
                  <div className="flex flex-col gap-3 p-4 bg-muted/10 rounded-2xl border border-border/30 border-dashed">
                     <div className="h-24 w-full rounded-lg bg-[#0a0a0a] overflow-hidden border border-border/50 shadow-lg flex items-center justify-center">
                       {formData.backdropUrl ? <img src={formData.backdropUrl} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-muted-foreground/20"><Tv className="h-6 w-6" /></div>}
                     </div>
                     <Input 
                        name="backdropUrl" 
                        value={formData.backdropUrl} 
                        onChange={handleInputChange} 
                        placeholder="Image URL" 
                        className="h-10 bg-[#0a0a0a] border-border/50 rounded-lg text-xs shadow-inner"
                      />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Technical Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[0.6rem] font-black uppercase tracking-widest text-muted-foreground ml-1">Director</Label>
                    <Input name="directedBy" value={formData.directedBy} onChange={handleInputChange} placeholder="Director Name" className="h-11 bg-[#0a0a0a] border-border/50 rounded-lg text-sm shadow-inner" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[0.6rem] font-black uppercase tracking-widest text-muted-foreground ml-1">Country</Label>
                    <Input name="country" value={formData.country} onChange={handleInputChange} placeholder="e.g. USA" className="h-11 bg-[#0a0a0a] border-border/50 rounded-lg text-sm shadow-inner" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[0.6rem] font-black uppercase tracking-widest text-muted-foreground ml-1">Language</Label>
                    <Input name="language" value={formData.language} onChange={handleInputChange} placeholder="e.g. English" className="h-11 bg-[#0a0a0a] border-border/50 rounded-lg text-sm shadow-inner" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[0.6rem] font-black uppercase tracking-widest text-muted-foreground ml-1">Age Rating</Label>
                    <select name="ageRating" value={formData.ageRating} onChange={handleInputChange} className="w-full h-11 rounded-lg border border-border/50 bg-[#0a0a0a] px-4 text-xs font-bold tracking-tight shadow-inner">
                      <option value="" className="bg-[#0f0f0f]">Select Rating</option>
                      {(formData.category === 'TV' ? TV_RATINGS : MOVIE_RATINGS).map(r => <option key={r} value={r} className="bg-[#0f0f0f]">{r}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[0.6rem] font-black uppercase tracking-widest text-muted-foreground ml-1">Runtime (min)</Label>
                    <Input type="number" name="runtime" value={formData.runtime} onChange={handleInputChange} className="h-11 bg-[#0a0a0a] border-border/50 rounded-lg text-sm shadow-inner" />
                 </div>
              </div>

              {formData.category === 'TV' && (
                <div className="p-6 rounded-2xl border border-primary/20 bg-primary/[0.03] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
                  <div className="space-y-2">
                    <Label className="text-[0.55rem] font-black uppercase tracking-widest text-primary/70 ml-1">Show Status</Label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full h-10 rounded-lg border border-border/50 bg-[#0a0a0a] px-3 text-[10px] font-black tracking-widest uppercase shadow-inner">
                      <option value="" className="bg-[#0f0f0f]">Status</option>
                      {TV_STATUS.map(s => <option key={s} value={s} className="bg-[#0f0f0f]">{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[0.55rem] font-black uppercase tracking-widest text-primary/70 ml-1">Network</Label>
                    <Input name="network" value={formData.network} onChange={handleInputChange} placeholder="e.g. HBO" className="h-10 bg-[#0a0a0a] border-border/50 rounded-lg text-xs font-bold shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[0.55rem] font-black uppercase tracking-widest text-primary/70 ml-1">Show Type</Label>
                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full h-10 rounded-lg border border-border/50 bg-[#0a0a0a] px-3 text-[10px] font-black tracking-widest uppercase shadow-inner">
                      {TV_TYPES.map(t => <option key={t} value={t} className="bg-[#0f0f0f]">{t}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <div className="flex items-center gap-3">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Cast & Crew</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground ml-1">Search Actors</Label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
                    <Input 
                      placeholder="Find talent..." 
                      className="h-11 pl-10 bg-[#0a0a0a] border-border/50 rounded-lg shadow-inner text-xs"
                      value={actorSearchQuery}
                      onChange={(e) => setActorSearchQuery(e.target.value)}
                    />
                    
                    {(isSearchingActors || actorSearchResults.length > 0) && (
                      <div className="absolute z-50 w-full mt-2 bg-surface-container-high p-2 rounded-xl border border-border/50 shadow-2xl">
                        {isSearchingActors ? (
                           <div className="p-4 text-center text-[10px] font-black uppercase tracking-widest animate-pulse">Searching...</div>
                        ) : (
                          actorSearchResults.map(actor => (
                            <div 
                              key={actor.id} 
                              onClick={() => addActorToCast(actor)}
                              className="flex items-center gap-3 p-2 hover:bg-primary/10 cursor-pointer rounded-lg group mb-1 last:mb-0"
                            >
                              <div className="h-8 w-8 shrink-0 rounded bg-white/5 overflow-hidden">
                                {actor.profile_path ? <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} className="h-full w-full object-cover" /> : null}
                              </div>
                              <span className="text-xs font-bold truncate">{actor.name}</span>
                              <Plus className="h-3 w-3 ml-auto text-primary opacity-0 group-hover:opacity-100" />
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-3 block">Selected Cast</Label>
                  <div className="flex flex-wrap gap-2.5 p-5 bg-muted/5 rounded-2xl border border-border/30 border-dashed min-h-[100px]">
                    {formData.cast.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest m-auto">No actors linked</p>
                    ) : (
                      formData.cast.map(actor => (
                        <div key={actor.id} className="flex items-center gap-2 bg-background border border-border/50 rounded-lg pl-1.5 pr-2.5 py-1.5 group/pill">
                          <div className="h-6 w-6 rounded-md overflow-hidden bg-muted">
                             {actor.profile_path ? <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} className="h-full w-full object-cover" /> : null}
                          </div>
                          <span className="text-[10px] font-bold truncate max-w-[100px]">{actor.name}</span>
                          <button type="button" onClick={() => removeActorFromCast(actor.id)} className="ml-1 text-muted-foreground hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <div className="flex items-center gap-3">
                  <Monitor className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Streaming Platforms</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground ml-1">Add Platform</Label>
                    <div className="flex gap-2 p-1 bg-[#0a0a0a] rounded-lg border border-border/50 shadow-inner">
                      <Input 
                        placeholder="e.g. Netflix" 
                        className="h-9 flex-1 bg-transparent border-none text-[11px] font-bold focus-visible:ring-0"
                        value={newProviderName}
                        onChange={(e) => setNewProviderName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addManualProvider(); } }}
                      />
                      <Button type="button" onClick={addManualProvider} size="sm" className="h-9 px-3 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest">
                        Add
                      </Button>
                    </div>
                 </div>
                 
                 <div className="md:col-span-2">
                   <Label className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-3 block">Linked Platforms</Label>
                   <div className="flex flex-wrap gap-2.5 p-5 bg-muted/5 rounded-2xl border border-border/30 border-dashed min-h-[90px]">
                    {formData.watchProviders.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest m-auto">No platforms linked</p>
                    ) : (
                      formData.watchProviders.map(p => (
                        <div key={p.id} className="group relative flex items-center gap-2 bg-background border border-border/50 pl-1.5 pr-2.5 py-1.5 rounded-lg">
                          <div className="h-7 w-7 rounded bg-white flex items-center justify-center p-0.5">
                            {p.logo_path ? <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} className="h-full w-full object-contain" /> : <Monitor className="h-3 w-3 text-primary" />}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest">{p.name}</span>
                          <button onClick={(e) => { e.preventDefault(); removeNetworkFromProviders(p.id); }} className="ml-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    )}
                   </div>
                 </div>
              </div>
            </section>

            <div className="sticky bottom-0 p-8 pt-6 -mx-10 bg-surface-container-low border-t border-border/30 flex items-center justify-end gap-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-muted/30">
                Cancel
              </Button>
              <Button type="submit" className="h-12 px-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">
                {currentMovie ? 'Update Content' : 'Add to Library'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-surface-container-high border-border/50 p-10 rounded-[2.5rem] shadow-4xl text-center">
          <DialogHeader className="space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto">
              <Trash2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-black uppercase tracking-tightest leading-none text-destructive">
                Delete <span className="text-white italic">Content</span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium text-sm tracking-tight leading-relaxed">
                Are you sure you want to delete <strong className="text-foreground font-black italic">"{movieToDelete?.title}"</strong>? This action cannot be undone.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-4 mt-8">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]">
              Keep Content
            </Button>
            <Button onClick={handleDelete} className="h-12 px-8 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-black uppercase tracking-widest text-[10px]">
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MovieManagement;
