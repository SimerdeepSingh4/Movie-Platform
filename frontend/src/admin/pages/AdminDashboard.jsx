import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, Film } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, adminUsers: 0, totalMovies: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users for user stats
        const userRes = await api.get('/admin/users');
        const users = userRes.data.users || [];
        
        // Fetch movies for movie stats
        const movieRes = await api.get('/movies');
        const movies = movieRes.data.movies || [];
        
        const total = users.length;
        const admins = users.filter(u => u.role === 'admin').length;
        
        setStats({ 
          totalUsers: total, 
          adminUsers: admins, 
          totalMovies: movies.length 
        });
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">Welcome to your admin panel. Here's what's happening today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Users Card */}
        <Card className="shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Registered members on the platform</p>
          </CardContent>
        </Card>

        {/* Admin Staff Card */}
        <Card className="shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admin Staff</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.adminUsers}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Users with elevated permissions</p>
          </CardContent>
        </Card>

        {/* Total Movies Card */}
        <Card className="shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Movies Added</CardTitle>
            <Film className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{stats.totalMovies}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Premium movies in your database</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
