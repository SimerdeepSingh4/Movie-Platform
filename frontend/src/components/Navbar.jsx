import React from 'react';
import { Link } from 'react-router-dom';
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
import { Film, Search, User, LogOut, ShieldAlert, Bookmark } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { useAuth } from '../auth/hooks/useAuth';
import logo from "../../public/favicon.svg"

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { handleLogout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition">
          <img src={logo} className="h-30 w-30 mt-7" />
          <span className="font-bold text-xl tracking-widest uppercase -ml-8 font-[japan]">CineBase</span>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full border border-border">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal border-b pb-2 mb-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites" className="cursor-pointer w-full flex items-center">
                      <Film className="mr-2 h-4 w-4" />
                      <span>My Favorites</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/watchlist" className="cursor-pointer w-full flex items-center">
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span>Watchlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/history" className="cursor-pointer w-full flex items-center">
                      <Search className="mr-2 h-4 w-4" />
                      <span>Watch History</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer w-full flex items-center text-emerald-500 font-medium">
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
