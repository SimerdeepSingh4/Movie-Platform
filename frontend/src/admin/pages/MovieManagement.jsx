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
  Monitor
} from 'lucide-react';
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
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    releaseDate: '',
    trailerUrl: '',
    genre: 'Drama',
    category: 'Movie',
    posterUrl: '',
  });

  const categories = ["Movie", "TV", "Anime", "Documentary"];
  const genres = ["Action", "Drama", "Comedy", "Thriller", "Romance", "Sci-Fi"];

  useEffect(() => {
    fetchMovies();
  }, []);

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
                          <div className="text-muted-foreground text-xs line-clamp-1">{movie.description}</div>
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
                            className="cursor-pointer gap-2 text-destructive focus:bg-destructive focus:text-destructive-foreground"
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="posterUrl" className="text-sm font-semibold">Poster Image URL</Label>
                <Input 
                  id="posterUrl" 
                  name="posterUrl" 
                  value={formData.posterUrl} 
                  onChange={handleInputChange} 
                  placeholder="https://example.com/poster.jpg" 
                />
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
