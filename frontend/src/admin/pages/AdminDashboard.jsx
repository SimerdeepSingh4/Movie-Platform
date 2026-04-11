import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, Film, TrendingUp, Activity, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, adminUsers: 0, totalMovies: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userRes = await api.get('/admin/users');
        const users = userRes.data.users || [];
        
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
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Platform members",
      icon: Users,
      color: "text-primary",
      glow: "shadow-primary/20",
      accent: "bg-primary/10"
    },
    {
      title: "Administrators",
      value: stats.adminUsers,
      description: "System moderators",
      icon: ShieldCheck,
      color: "text-emerald-500",
      glow: "shadow-emerald-500/10",
      accent: "bg-emerald-500/10"
    },
    {
      title: "Total Content",
      value: stats.totalMovies,
      description: "Curated titles",
      icon: Film,
      color: "text-primary",
      glow: "shadow-primary/20",
      accent: "bg-primary/10"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="relative">
        <h2 className="text-2xl font-black tracking-tighter uppercase text-foreground leading-none">
          Admin <span className="text-primary italic font-serif lowercase">Dashboard</span>
        </h2>
        <p className="text-muted-foreground mt-2 text-sm font-medium tracking-tight opacity-60">
          Overview of platform activity and content scale.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, idx) => (
          <Card 
            key={idx} 
            className="glass-effect relative overflow-hidden group hover:border-primary/50 transition-all duration-500 hover:-translate-y-1 shadow-xl"
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${card.accent} blur-3xl group-hover:bg-primary/20 transition-colors pointer-events-none`} />
            
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-primary transition-colors">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-xl border border-white/5 ${card.accent} ${card.color} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-24 rounded-lg bg-white/5" />
                  <Skeleton className="h-4 w-32 rounded bg-white/5" />
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-5xl font-black tracking-tightest text-glow flex items-baseline gap-2">
                    {card.value}
                    <TrendingUp className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
                    <Activity className="h-3 w-3" />
                    {card.description}
                  </p>
                </div>
              )}
            </CardContent>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
          </Card>
        ))}
      </div>

      <div className="glass-effect p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden group shadow-2xl">
        <Sparkles className="absolute -right-4 -top-4 h-24 w-24 text-primary/5 group-hover:text-primary/10 transition-colors rotate-12" />
        <div className="max-w-xl space-y-2">
          <h3 className="text-lg font-bold tracking-tight">Platform Performance</h3>
          <p className="text-muted-foreground/80 leading-relaxed font-medium text-sm">
            CineBase services are operating within normal parameters. Administrative audit logs are active to ensure content integrity and platform security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


