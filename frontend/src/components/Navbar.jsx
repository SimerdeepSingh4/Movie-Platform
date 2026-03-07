import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Film, Search, User, LogOut } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { useAuth } from '../auth/hooks/useAuth';
import logo from "../assets/favicon/favicon.svg"

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { handleLogout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition">
          <img src={logo} className="h-30 w-30 mt-7" />
          <span className="font-bold text-xl tracking-tight uppercase -ml-8">CineBase</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">Home</Link>
          <Link to="/movies" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">Movies</Link>
          <Link to="/tv" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">TV Shows</Link>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4">
          <ModeToggle />
          <Button variant="ghost" size="icon" asChild>
            <Link to="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-destructive hover:bg-destructive/10 border-destructive/20 hidden sm:flex">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive hover:bg-destructive/10 sm:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
