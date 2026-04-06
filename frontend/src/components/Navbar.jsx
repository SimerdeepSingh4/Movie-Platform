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
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
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
        <div className="flex items-center gap-5">
          
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

          {/* User Section (Desktop) */}
          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 px-2 rounded-full border border-border/50 flex items-center gap-2 hover:bg-muted/30">
                    <Avatar className="h-7 w-7 border border-border/50">
                      <AvatarImage src={user?.photoUrl} alt={user?.username} />
                      <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-black">
                        {user?.username?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-black uppercase tracking-widest hidden xl:inline-block pr-1">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl" align="end" forceMount>
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
                  <DropdownMenuGroup>
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
                        <Link to="/admin" className="cursor-pointer w-full flex items-center gap-3 p-2.5 rounded-xl text-emerald-500 hover:bg-emerald-500/10 font-bold text-sm">
                          <ShieldAlert className="h-4 w-4" />
                          Admin Console
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-2 opacity-30" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 p-2.5 rounded-xl text-destructive hover:bg-destructive/10 font-bold text-sm cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="rounded-full font-black uppercase tracking-widest px-6 shadow-lg shadow-primary/20">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Trigger (Sheet) */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border/50 glass-effect">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] border-l border-border/50 bg-background/95 backdrop-blur-3xl p-0">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 border-b border-border/20">
                    <SheetTitle className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <img src={logo} className="h-5 w-5" alt="Logo" />
                      </div>
                      <span className="font-[japan] font-black text-xl uppercase tracking-tighter">CineBase</span>
                    </SheetTitle>
                    <SheetDescription className="text-left text-[10px] uppercase font-black tracking-widest opacity-40">
                      Navigation Menu
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Main Nav */}
                    <div className="space-y-1">
                      {navLinks.map((link) => (
                        <Link 
                          key={link.path} 
                          to={link.path} 
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-lg ${
                            isActive(link.path) 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          <link.icon className="h-6 w-6" />
                          {link.name}
                        </Link>
                      ))}
                    </div>

                    {/* Profile Section (Mobile) */}
                    {user ? (
                      <div className="space-y-4 pt-4 border-t border-border/20">
                        <div className="px-4 flex items-center gap-3">
                           <Avatar className="h-10 w-10 border border-border/30">
                             <AvatarImage src={user?.photoUrl} alt={user?.username} />
                             <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                           </Avatar>
                           <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-widest leading-none">{user.username}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{user.email}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {profileLinks.map((link) => (
                            <Link 
                              key={link.path} 
                              to={link.path} 
                              className="flex items-center gap-4 p-4 rounded-2xl text-muted-foreground hover:bg-muted/50 transition-all font-bold"
                            >
                              <link.icon className="h-5 w-5 opacity-60" />
                              {link.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <Button asChild className="w-full h-14 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20">
                          <Link to="/login">Sign In</Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  {user && (
                    <div className="p-4 border-t border-border/20">
                      <Button variant="ghost" onClick={handleLogout} className="w-full h-14 rounded-2xl text-destructive hover:bg-destructive/10 font-black text-lg uppercase tracking-widest flex items-center justify-start gap-4">
                        <LogOut className="h-6 w-6" />
                        Log Out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
