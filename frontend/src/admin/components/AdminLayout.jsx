import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Film, Home, Search, Tv, User, Menu } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/hooks/useAuth';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import logo from '../../../public/favicon.svg';

const AdminLayout = () => {
  const { handleLogout } = useAuth();

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/users', icon: Users, label: 'Manage Users', exact: false },
    { path: '/admin/movies', icon: Film, label: 'Manage Content', exact: false },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar - Hidden on mobile, visible on lg screens */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-card shadow-sm flex-col z-20">
        <div className="p-6 pb-2">
          <NavLink to="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition mb-6">
            <img src={logo} className="h-10 w-10 -ml-2" alt="Logo" />
            <span className="font-bold text-lg tracking-wider uppercase font-[japan]">Admin Panel</span>
          </NavLink>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shadow-sm">
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-card border-r border-border">
                <SheetHeader className="p-6 pb-2 text-left">
                  <SheetTitle>
                    <Link to="/" className="flex items-center space-x-2 text-primary">
                      <img src={logo} className="h-8 w-8" alt="Logo" />
                      <span className="font-bold text-lg tracking-wider uppercase font-[japan]">Admin Panel</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="px-4 space-y-2 mt-4">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </NavLink>
                  ))}
                  <div className="border-t border-border pt-4 mt-4">
                    <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Navigation</p>
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Home className="h-5 w-5" /> Home
                    </Link>
                    <Link to="/movies" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Film className="h-5 w-5" /> Movies
                    </Link>
                    <Link to="/tv" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Tv className="h-5 w-5" /> TV Shows
                    </Link>
                  </div>
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <h2 className="text-lg lg:text-xl font-semibold tracking-tight">Admin Controls</h2>
            
            <div className="hidden lg:flex items-center gap-1 border-l border-border pl-8">
              <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
                <Link to="/"><Home className="h-4 w-4" /> Home</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
                <Link to="/movies"><Film className="h-4 w-4" /> Movies</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
                <Link to="/tv"><Tv className="h-4 w-4" /> TV Shows</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
             <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
                <Link to="/search" title="Search"><Search className="h-5 w-5" /></Link>
              </Button>

            <ModeToggle />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 bg-muted/20">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
