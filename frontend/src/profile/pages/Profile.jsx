import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '@/lib/api';
import { setUser } from '../../store/authSlice';
import { 
  User, 
  Settings, 
  Heart, 
  Bookmark, 
  History as HistoryIcon, 
  Camera, 
  ShieldCheck, 
  Mail, 
  Edit3,
  LogOut,
  Calendar,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import MovieCard from '../../home/components/MovieCard';
import { Skeleton } from '@/components/ui/skeleton';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    photoUrl: user?.photoUrl || ''
  });
  
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState({
    favs: false,
    watch: false,
    hist: false,
    update: false
  });

  // Fetch categorized data
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(prev => ({ ...prev, favs: true, watch: true, hist: true }));
      try {
        const [favsRes, watchRes, histRes] = await Promise.all([
          api.get('/user/favorites'),
          api.get('/user/watchlist'),
          api.get('/user/history?limit=10')
        ]);

        const hydrate = async (items) => {
          return await Promise.all(
            items.map(async (item) => {
              if (item.source === 'tmdb' || !item.source) {
                try {
                  const res = await axios.get(`${BASE_URL}/${item.mediaType}/${item.tmdbId}?api_key=${TMDB_API_KEY}`);
                  return { ...res.data, mediaType: item.mediaType };
                } catch { return null; }
              }
              return { ...item._id_custom, mediaType: item.mediaType, isInternal: true };
            })
          ).then(res => res.filter(i => i !== null));
        };

        setFavorites(await hydrate(favsRes.data.favorites || []));
        setWatchlist(await hydrate(watchRes.data.watchlist || []));
        setHistory(await hydrate(histRes.data.history || []));
        
      } catch (err) {
        console.error("Data Fetch Error:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(prev => ({ ...prev, favs: false, watch: false, hist: false }));
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, update: true }));
    try {
      const res = await api.put('/user/profile', formData);
      dispatch(setUser(res.data.user));
      toast.success("Profile updated seamlessly");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Profile Premium Header */}
      <div className="relative group mb-12 rounded-3xl overflow-hidden bg-muted/20 border border-border/50 p-8 md:p-12">
        {/* Subtle backdrop glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="relative">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-2xl ring-1 ring-border">
              <AvatarImage src={user.photoUrl} alt={user.username} className="object-cover" />
              <AvatarFallback className="text-4xl font-black bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-1 right-1">
              <Button 
                size="icon" 
                variant="secondary" 
                className="h-10 w-10 rounded-full shadow-lg border border-border hover:scale-110 transition-transform"
                onClick={() => setActiveTab('settings')}
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                {user.username}
              </h1>
              {user.role === 'admin' && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Privileged
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground font-medium">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 opacity-50" />
                {user.email}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 opacity-50" />
                Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="rounded-xl font-bold gap-2 md:mb-2 hover:bg-primary/5 transition-all"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 className="h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-muted/10 p-1.5 rounded-2xl border border-border/50 sticky top-20 z-40 backdrop-blur-md">
          <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-2">
            <TabsTrigger 
              value="overview" 
              className="px-6 py-2.5 rounded-xl text-sm font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Layers className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="px-6 py-2.5 rounded-xl text-sm font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Heart className="h-4 w-4" /> Favorites
            </TabsTrigger>
            <TabsTrigger 
              value="watchlist" 
              className="px-6 py-2.5 rounded-xl text-sm font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Bookmark className="h-4 w-4" /> Watchlist
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="px-6 py-2.5 rounded-xl text-sm font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <HistoryIcon className="h-4 w-4" /> History
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="px-6 py-2.5 rounded-xl text-sm font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="relative min-h-[400px]">
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-muted/10 border border-border/50 rounded-2xl p-6 flex flex-col gap-1 ring-1 ring-inset ring-white/5 shadow-sm">
                <span className="text-xs font-black uppercase tracking-widest text-primary/70">Favorites</span>
                <span className="text-4xl font-black">{favorites.length}</span>
                <span className="text-xs font-medium text-muted-foreground">Total items Liked</span>
              </div>
              <div className="bg-muted/10 border border-border/50 rounded-2xl p-6 flex flex-col gap-1 ring-1 ring-inset ring-white/5 shadow-sm">
                <span className="text-xs font-black uppercase tracking-widest text-primary/70">Watchlist</span>
                <span className="text-4xl font-black">{watchlist.length}</span>
                <span className="text-xs font-medium text-muted-foreground">Items saved for later</span>
              </div>
              <div className="bg-muted/10 border border-border/50 rounded-2xl p-6 flex flex-col gap-1 ring-1 ring-inset ring-white/5 shadow-sm">
                <span className="text-xs font-black uppercase tracking-widest text-primary/70">Total Views</span>
                <span className="text-4xl font-black">{history.length}</span>
                <span className="text-xs font-medium text-muted-foreground">Recent watch sessions</span>
              </div>
            </div>

            {history.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black tracking-tight">Recent Activity</h3>
                  <Button variant="link" onClick={() => setActiveTab('history')}>See all</Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                  {history.slice(0, 5).map(item => (
                    <MovieCard key={item.id} {...item} title={item.title || item.name} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="mt-0 animate-in slide-in-from-bottom-4 duration-500">
            {loading.favs ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[250px] w-full rounded-2xl" />)}
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {favorites.map(item => (
                  <MovieCard key={item.id} {...item} title={item.title || item.name} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-muted/5 rounded-3xl border border-dashed border-border/50">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Your heart is empty. Add some favorites!</p>
              </div>
            )}
          </TabsContent>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist" className="mt-0 animate-in slide-in-from-bottom-4 duration-500">
            {loading.watch ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[250px] w-full rounded-2xl" />)}
              </div>
            ) : watchlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {watchlist.map(item => (
                  <MovieCard key={item.id} {...item} title={item.title || item.name} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-muted/5 rounded-3xl border border-dashed border-border/50">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Nothing saved. Start exploring!</p>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-0 animate-in slide-in-from-bottom-4 duration-500">
            {loading.hist ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : history.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {history.map(item => (
                  <MovieCard key={item.id} {...item} title={item.title || item.name} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-muted/5 rounded-3xl border border-dashed border-border/50">
                <HistoryIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">No watch history yet. Time for a movie night?</p>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-0 animate-in zoom-in-95 duration-500">
            <div className="max-w-xl mx-auto bg-muted/10 border border-border/50 rounded-3xl p-8 md:p-10 shadow-2xl">
              <h2 className="text-3xl font-black mb-8 tracking-tight">Account Settings</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest opacity-60">Username</Label>
                  <Input 
                    id="username" 
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="h-12 rounded-xl bg-background border-border/50 focus:ring-primary/20 transition-all font-medium"
                    placeholder="Enter unique username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest opacity-60">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-12 rounded-xl bg-background border-border/50 focus:ring-primary/20 transition-all font-medium"
                    placeholder="name@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photoUrl" className="text-xs font-black uppercase tracking-widest opacity-60">Profile Picture URL</Label>
                  <Input 
                    id="photoUrl" 
                    value={formData.photoUrl} 
                    onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                    className="h-12 rounded-xl bg-background border-border/50 focus:ring-primary/20 transition-all font-medium text-xs font-mono"
                    placeholder="https://image-link.com/avatar.jpg"
                  />
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl font-black text-lg uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    disabled={loading.update}
                  >
                    {loading.update ? 'Saving Changes...' : 'Update Profile'}
                  </Button>
                </div>
              </form>

              <div className="mt-12 pt-8 border-t border-border/30 flex flex-col gap-4">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/30 font-bold gap-3 rounded-xl transition-all">
                  <Edit3 className="h-4 w-4" /> Change Password
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 font-bold gap-3 rounded-xl transition-all">
                  <LogOut className="h-4 w-4" /> Secure Logout
                </Button>
              </div>
            </div>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
};

export default Profile;
