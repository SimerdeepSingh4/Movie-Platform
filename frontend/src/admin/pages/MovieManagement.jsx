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
  X
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
  DialogTrigger,
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
  const [currentMovie, setCurrentMovie] = useState(null); // For editing
  const [movieToDelete, setMovieToDelete] = useState(null);
  
  // Cast search state
  const [actorSearchQuery, setActorSearchQuery] = useState('');
  const [actorSearchResults, setActorSearchResults] = useState([]);
  const [isSearchingActors, setIsSearchingActors] = useState(false);
  
  // Network/Provider input state
  const [newProviderName, setNewProviderName] = useState('');
  const [activeNetworkField, setActiveNetworkField] = useState('providers'); // 'providers' or 'primaryNetwork'

  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  
  // Form State
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
  
  // Enums for Data Integrity
  const MOVIE_RATINGS = ["NR", "U", "UA", "A", "G", "PG", "PG-13", "R", "NC-17"];
  const TV_RATINGS = ["NR", "U", "UA", "A", "TV-Y", "TV-Y7", "TV-G", "TV-PG", "TV-14", "TV-MA"];
  const TV_STATUS = ["Returning Series", "Ended", "Canceled", "Pilot", "In Production"];
  const TV_TYPES = ["Scripted", "Reality", "Documentary", "News", "Talk", "Miniseries"];

  useEffect(() => {
    fetchMovies();
  }, []);

  // Debounced actor search
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
        console.error("Error searching actors:", error);
      } finally {
        setIsSearchingActors(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [actorSearchQuery, TMDB_API_KEY]);

  // Search for networks/providers moved to manual input to avoid TMDB API overhead/errors

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/movies');
      setMovies(res.data.movies || []);
    } catch (err) {
      toast.error("Failed to load movies");
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
        toast.error("Actor already added");
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
        toast.error("Provider already added");
        return prev;
      }
      return {
        ...prev,
        watchProviders: [...prev.watchProviders, { id: Date.now(), name: newProviderName.trim(), logo_path: null }]
      };
    });
    setNewProviderName('');
    toast.success(`${newProviderName} added`);
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
        // Update
        await api.patch(`/movies/${currentMovie._id}`, formData);
        toast.success("Movie updated successfully");
      } else {
        // Create
        await api.post('/movies', formData);
        toast.success("Movie added successfully");
      }
      setIsDialogOpen(false);
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save movie");
    }
  };

  const handleDelete = async () => {
    if (!movieToDelete) return;
    try {
      await api.delete(`/movies/${movieToDelete._id}`);
      toast.success("Movie deleted successfully");
      setIsDeleteDialogOpen(false);
      fetchMovies();
    } catch (err) {
      toast.error("Failed to delete movie");
    }
  };

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Content Management</h2>
          <p className="text-muted-foreground mt-1">Manage movies and shows in your custom database.</p>
        </div>
        <Button onClick={openAddDialog} className="shrink-0 gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Add New Entry
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title or genre..." 
            className="pl-10 bg-background/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Content</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Genre</th>
                <th className="px-6 py-4 font-semibold">Release Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-12 w-64 rounded" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded" /></td>
                    <td className="px-6 py-4 flex justify-end"><Skeleton className="h-8 w-8 rounded-full" /></td>
                  </tr>
                ))
              ) : filteredMovies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    No content found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMovies.map((movie) => (
                  <tr key={movie._id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-10 shrink-0 bg-muted rounded overflow-hidden shadow-sm">
                          {movie.posterUrl ? (
                            <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Film className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-[300px]">
                          <div className="font-bold text-foreground truncate">{movie.title}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="text-muted-foreground text-xs line-clamp-1 flex-1">{movie.description}</div>
                            {movie.backdropUrl && <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4 bg-primary/10 text-primary border-none">Backdrop</Badge>}
                            {movie.cast && movie.cast.length > 0 && <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4 bg-blue-500/10 text-blue-500 border-none">{movie.cast.length} Cast</Badge>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="font-medium">
                        {movie.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <Tag className="h-3 w-3" /> {movie.genre}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                         {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Manage</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(movie)} className="cursor-pointer gap-2">
                            <Edit className="h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          {movie.trailerUrl && (
                             <DropdownMenuItem onClick={() => window.open(movie.trailerUrl, '_blank')} className="cursor-pointer gap-2">
                               <ExternalLink className="h-4 w-4" /> View Trailer
                             </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setMovieToDelete(movie);
                              setIsDeleteDialogOpen(true);
                            }} 
                            className="cursor-pointer gap-2 text-destructive focus:bg-destructive"
                          >
                            <Trash2 className="h-4 w-4" /> Delete Content
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              {currentMovie ? <Edit className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              {currentMovie ? 'Edit Content' : 'Add New Content'}
            </DialogTitle>
            <DialogDescription>
              {currentMovie ? 'Update the details for this entry.' : 'Fill out the form below to add a new movie or show to the database.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title" className="text-sm font-semibold">Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="Inception" 
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <textarea 
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter detailed plot summary..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold">Category</Label>
                <select 
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre" className="text-sm font-semibold">Genre</Label>
                <select 
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseDate" className="text-sm font-semibold">Release Date</Label>
                <Input 
                  type="date" 
                  id="releaseDate" 
                  name="releaseDate" 
                  value={formData.releaseDate} 
                  onChange={handleInputChange} 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trailerUrl" className="text-sm font-semibold">Trailer URL (YouTube)</Label>
                <Input 
                  id="trailerUrl" 
                  name="trailerUrl" 
                  value={formData.trailerUrl} 
                  onChange={handleInputChange} 
                  placeholder="https://youtube.com/watch?v=..." 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="posterUrl" className="text-sm font-semibold">Poster Image URL</Label>
                <Input 
                  id="posterUrl" 
                  name="posterUrl" 
                  value={formData.posterUrl} 
                  onChange={handleInputChange} 
                  placeholder="https://example.com/poster.jpg" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backdropUrl" className="text-sm font-semibold">Backdrop Image URL (Horizontal)</Label>
                <Input 
                  id="backdropUrl" 
                  name="backdropUrl" 
                  value={formData.backdropUrl} 
                  onChange={handleInputChange} 
                  placeholder="https://example.com/backdrop.jpg" 
                />
              </div>

              {/* Expanded Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:col-span-2 pt-6 mt-4 border-t border-white/10">
                <div className="space-y-2">
                  <Label htmlFor="directedBy" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Directed By / Creator</Label>
                  <Input
                    id="directedBy"
                    name="directedBy"
                    value={formData.directedBy}
                    onChange={handleInputChange}
                    placeholder="e.g. Christopher Nolan"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g. United States"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original Language</Label>
                  <Input
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    placeholder="e.g. English"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageRating" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Age Rating (Certification)</Label>
                  <select
                    id="ageRating"
                    name="ageRating"
                    value={formData.ageRating}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select Rating</option>
                    {(formData.category === 'TV' ? TV_RATINGS : MOVIE_RATINGS).map(rating => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="runtime" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {formData.category === 'TV' ? 'Avg. Episode Runtime (min)' : 'Runtime (min)'}
                  </Label>
                  <Input
                    id="runtime"
                    name="runtime"
                    type="number"
                    value={formData.runtime}
                    onChange={handleInputChange}
                    placeholder="e.g. 120"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              {/* Conditional TV Show Section */}
              {formData.category === 'TV' && (
                <div className="md:col-span-2 pt-6 mt-4 border-t border-primary/20 bg-primary/5 p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Series-Specific Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select Status</option>
                        {TV_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="network" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Network</Label>
                      <Input
                        id="network"
                        name="network"
                        value={formData.network}
                        onChange={handleInputChange}
                        placeholder="e.g. Netflix, HBO, Nippon TV"
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Show Type</Label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select Type</option>
                        {TV_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalEpisodes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Episodes</Label>
                      <Input
                        id="totalEpisodes"
                        name="totalEpisodes"
                        type="number"
                        value={formData.totalEpisodes}
                        onChange={handleInputChange}
                        placeholder="e.g. 24"
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalSeasons" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Number of Seasons</Label>
                      <Input
                        id="totalSeasons"
                        name="totalSeasons"
                        type="number"
                        value={formData.totalSeasons}
                        onChange={handleInputChange}
                        placeholder="e.g. 2"
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cast Management */}
              <div className="space-y-4 md:col-span-2 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Star Cast
                  </Label>
                  <span className="text-xs text-muted-foreground">{formData.cast.length} actors attached</span>
                </div>
                
                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search famous actors from TMDB..." 
                    className="pl-10"
                    value={actorSearchQuery}
                    onChange={(e) => setActorSearchQuery(e.target.value)}
                  />
                  
                  {/* Search Results Dropdown */}
                  {(isSearchingActors || actorSearchResults.length > 0) && (
                    <div className="absolute z-50 w-full mt-1 bg-card border border-border shadow-xl rounded-lg overflow-hidden max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                      {isSearchingActors ? (
                         <div className="p-4 text-center text-sm text-muted-foreground">Searching TMDB...</div>
                      ) : (
                        actorSearchResults.map(actor => (
                          <div 
                            key={actor.id} 
                            onClick={() => addActorToCast(actor)}
                            className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50 last:border-0"
                          >
                            <div className="h-10 w-10 shrink-0 bg-muted rounded-full overflow-hidden">
                              {actor.profile_path ? (
                                <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} className="h-full w-full object-cover" alt="" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center"><Users className="h-4 w-4 opacity-30" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate">{actor.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{actor.known_for_department}</p>
                            </div>
                            <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100" />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Cast List */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.cast.length === 0 ? (
                    <div className="w-full py-6 border-2 border-dashed border-border/50 rounded-lg text-center">
                       <p className="text-xs text-muted-foreground">No actors attached yet. Search and add above.</p>
                    </div>
                  ) : (
                    formData.cast.map(actor => (
                      <div key={actor.id} className="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-full pl-1 pr-2 py-1 group hover:border-primary/30 transition-colors animate-in zoom-in-95 duration-200">
                        <div className="h-6 w-6 rounded-full overflow-hidden bg-muted">
                           {actor.profile_path ? (
                              <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} className="h-full w-full object-cover" alt="" />
                           ) : (
                              <Users className="h-3 w-3 m-1.5 opacity-30" />
                           )}
                        </div>
                        <span className="text-xs font-medium">{actor.name}</span>
                        <button 
                          type="button"
                          onClick={() => removeActorFromCast(actor.id)}
                          className="p-0.5 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Where to Watch Management */}
              <div className="space-y-4 md:col-span-2 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-primary" /> Where to Watch / Streaming Sources
                  </Label>
                  <span className="text-xs text-muted-foreground">{formData.watchProviders.length} sources added</span>
                </div>
                
                {/* Simple Entry Box */}
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter provider name (e.g. Netflix, Prime)..." 
                    className="flex-1"
                    value={newProviderName}
                    onChange={(e) => setNewProviderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addManualProvider();
                      }
                    }}
                  />
                  <Button type="button" onClick={addManualProvider} className="px-4 shrink-0">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>

                {/* Selected Providers Pill Area */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.watchProviders.length === 0 ? (
                    <div className="w-full py-6 text-center border-2 border-dashed border-border rounded-xl">
                      <p className="text-xs text-muted-foreground">No streaming sources added yet</p>
                    </div>
                  ) : (
                    formData.watchProviders.map(p => (
                      <div key={p.id} className="group relative flex items-center gap-2 bg-white/5 border border-white/10 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors">
                        <div className="h-6 w-6 rounded-md overflow-hidden bg-white/10 flex items-center justify-center">
                          {p.logo_path ? (
                            <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} className="h-full w-full object-contain p-0.5" alt="" />
                          ) : (
                            <span className="text-[10px] font-bold">{p.name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="text-xs font-medium">{p.name}</span>
                        <button 
                          onClick={(e) => { e.preventDefault(); removeNetworkFromProviders(p.id); }}
                          className="ml-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="px-8">{currentMovie ? 'Save Changes' : 'Create Entry'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Delete Content?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold text-foreground">"{movieToDelete?.title}"</span>? This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>No, Keep It</Button>
            <Button variant="destructive" onClick={handleDelete}>Yes, Delete Irreversibly</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MovieManagement;
