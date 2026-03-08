import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <footer className="py-6 border-t mt-auto text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} CINEBASE. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
