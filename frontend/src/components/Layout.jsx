import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Loader2 } from 'lucide-react';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pt-16">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      <footer className="py-6 border-t mt-auto text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} CINEBASE. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
