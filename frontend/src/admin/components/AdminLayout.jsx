import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Film, 
  Home, 
  Search, 
  Tv, 
  User, 
  Menu, 
  ShieldCheck, 
  ChevronRight,
  Clapperboard,
  Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from '../../../public/favicon.svg';

const AdminUserAction = ({ navItems, handleLogout, isActive }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 pl-6 ml-4 border-l border-border/50 group outline-none focus:ring-0">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors leading-tight">
              {user.username}
            </span>
            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter leading-tight opacity-40">
              Admin Tier
            </span>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-lg overflow-hidden relative">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.username} className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4" />
            )}
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ChevronRight className="h-3 w-3 text-white rotate-90" />
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl shadow-3xl animate-in zoom-in-95 mt-2">
        <DropdownMenuLabel className="font-normal p-4 border-b border-border/30 mb-2">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary overflow-hidden">
               {user.photoUrl ? (
                 <img src={user.photoUrl} alt={user.username} className="h-full w-full object-cover" />
               ) : (
                 <User className="h-5 w-5" />
               )}
             </div>
             <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-black uppercase tracking-tighter">{user.username}</p>
              <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[140px]">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuLabel className="px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          Management Console
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-border/30 mx-1" />
        
        {/* Navigation Links - Visible on all, but especially important for mobile */}
        <div className="space-y-1 my-1">
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <DropdownMenuItem key={item.path} asChild>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all font-bold text-xs ${
                    active 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator className="bg-border/30 mx-1" />

        <DropdownMenuItem asChild>
          <Link to="/" className="flex items-center gap-4 px-3 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-primary transition-all font-bold text-xs">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/30 mx-1" />

        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center gap-4 px-3 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all font-bold text-xs cursor-pointer focus:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AdminLayout = () => {
  const { handleLogout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/users', icon: Users, label: 'Users', exact: false },
    { path: '/admin/movies', icon: Film, label: 'Content', exact: false },
  ];

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path) && (path !== '/admin' || location.pathname === '/admin');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 selection:text-white">
      {/* Primary Top Header - Unified with Client Portal */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-8 md:gap-12">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={logo} className="h-25 w-25 transition-transform group-hover:rotate-12" alt="Logo" />
              <span className="font-bold text-xl tracking-widest uppercase font-[japan] text-primary">CineBase</span>
              <div className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ml-1 border border-primary/20">Admin</div>
            </Link>

            {/* Desktop Navigation Toolbelt */}
            <div className="hidden lg:flex items-center gap-2 px-1 py-1 rounded-2xl bg-muted/20 border border-border/30">
              {navItems.map((item) => {
                const active = isActive(item.path, item.exact);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-4">
               <Button variant="ghost" size="icon" asChild className="h-10 w-10 border border-border/50 rounded-xl hover:text-primary hover:bg-primary/5 transition-all">
                  <Link to="/search" title="Search"><Search className="h-5 w-5" /></Link>
               </Button>
            </div>
            
            <AdminUserAction navItems={navItems} handleLogout={handleLogout} isActive={isActive} />
          </div>
        </div>
      </nav>

      {/* Main Content Scrollable Area */}
      <main className="flex-1 pt-32 lg:pt-36">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
           <Outlet />
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="py-8 border-t border-border/30 mt-auto text-center">
         <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
            <ShieldCheck className="h-3 w-3 text-emerald-500/50" />
            CineBase Administrative Console &copy; {new Date().getFullYear()}
         </div>
      </footer>
    </div>
  );
};

export default AdminLayout;



