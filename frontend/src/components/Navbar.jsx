import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Film, 
  Search, 
  User, 
  LogOut, 
  ShieldAlert, 
  Bookmark, 
  UserCircle, 
  Menu, 
  X, 
  Home, 
  Tv, 
  Clapperboard,
  History 
} from 'lucide-react';
import { useAuth } from '../auth/hooks/useAuth';
import logo from "../../public/favicon.svg"

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { handleLogout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Movies', path: '/movies', icon: Clapperboard },
    { name: 'TV Shows', path: '/tv', icon: Tv },
  ];

  const profileLinks = [
    { name: 'My Profile', path: '/profile', icon: UserCircle },
    { name: 'My Favorites', path: '/favorites', icon: Film },
    { name: 'Watchlist', path: '/watchlist', icon: Bookmark },
    { name: 'Watch History', path: '/history', icon: History },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-3 ${
      isScrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-lg translate-y-0' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
        
        {/* Left Side: Logo & Desktop Links */}
        <div className="flex items-center gap-50">
          <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition">
            <img src={logo} className="h-30 w-30 mt-7" />
            <span className="font-bold text-xl tracking-widest uppercase -ml-8 font-[japan]">CineBase</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`px-4 py-2 rounded-xl text-sm font-bold tracking-tight transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.path) 
                    ? 'bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <link.icon className={`h-4 w-4 ${isActive(link.path) ? 'opacity-100' : 'opacity-40'}`} />
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-4">
          
          {/* Search Action */}
          <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-full border border-border/50 hover:border-primary/30 p-0 overflow-hidden glass-effect group">
            <Link to="/search">
              <Avatar className="h-full w-full">
                <AvatarFallback className="bg-transparent group-hover:bg-primary/5 transition-colors">
                  <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </AvatarFallback>
              </Avatar>
            </Link>
          </Button>

          {/* Unified Navigation & User Action Section */}
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 px-2 rounded-full border border-border/50 flex items-center gap-2 hover:bg-muted/30 outline-none focus:ring-0">
                    <Avatar className="h-7 w-7 border border-border/50">
                      <AvatarImage src={user?.photoUrl} alt={user?.username} />
                      <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-black uppercase">
                        {user?.username?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-black uppercase tracking-widest hidden lg:inline-block pr-1">{user.username}</span>

                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent className="w-64 p-2 rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl animate-in zoom-in-95" align="end">
                  <DropdownMenuLabel className="font-normal p-4 border-b border-border/30 mb-2">
                    <div className="flex items-center gap-3">
                       <Avatar className="h-10 w-10 border border-border/30">
                         <AvatarImage src={user?.photoUrl} alt={user?.username} />
                         <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                       </Avatar>
                       <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-black uppercase tracking-tighter">{user.username}</p>
                        <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[140px]">{user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  
                  {/* Mobile-Only Navigation Group */}
                  <DropdownMenuGroup className="lg:hidden">
                    <DropdownMenuLabel className="px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                      Navigation
                    </DropdownMenuLabel>
                    {navLinks.map((link) => (
                      <DropdownMenuItem key={link.path} asChild className="p-0 mb-1">
                        <Link to={link.path} className={`cursor-pointer w-full flex items-center gap-3 p-2.5 rounded-xl transition-all font-bold text-sm ${
                          isActive(link.path) ? 'bg-primary/10 text-primary' : 'hover:bg-muted/30'
                        }`}>
                          <link.icon className="h-4 w-4" />
                          {link.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="my-2 opacity-30" />
                  </DropdownMenuGroup>

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-[0.2em] text-muted-foreground/60 lg:hidden">
                      User Account
                    </DropdownMenuLabel>
                    {profileLinks.map((link) => (
                      <DropdownMenuItem key={link.path} asChild className="p-0 mb-1 last:mb-0">
                        <Link to={link.path} className="cursor-pointer w-full flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-primary/10 hover:text-primary font-bold text-sm">
                          <link.icon className="h-4 w-4 opacity-60" />
                          {link.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    {user.role === 'admin' && (
                      <DropdownMenuItem asChild className="p-0 mt-1">
                        <Link to="/admin" className="cursor-pointer w-full flex items-center gap-3 p-2.5 rounded-xl text-emerald-500 hover:bg-emerald-500/10 font-bold text-sm border border-emerald-500/10 bg-emerald-500/5">
                          <ShieldAlert className="h-4 w-4" />
                          Admin Console
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator className="my-2 opacity-30" />
                  
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 p-2.5 rounded-xl text-destructive hover:bg-destructive/10 font-bold text-sm cursor-pointer focus:bg-destructive/10">
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button size="sm" variant="ghost" className="rounded-full font-black uppercase tracking-widest px-6 hover:bg-muted/30 lg:hidden" asChild>
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-10 w-10 border border-border/50 glass-effect">
                         <Menu className="h-5 w-5" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl glass-effect">
                        {navLinks.map((link) => (
                          <DropdownMenuItem key={link.path} asChild>
                            <Link to={link.path} className="flex items-center gap-3 p-2.5 font-bold text-sm">
                              <link.icon className="h-4 w-4" /> {link.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem asChild>
                           <Link to="/login" className="flex items-center gap-3 p-2.5 font-bold text-sm text-primary">
                             <User className="h-4 w-4" /> Sign In
                           </Link>
                        </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                </Button>
                <Button asChild size="sm" className="hidden lg:flex rounded-full font-black uppercase tracking-widest px-6 shadow-lg shadow-primary/20">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
