import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Animated Rings */}
        <div className="absolute h-16 w-16 rounded-full border-2 border-primary/20 animate-ping" />
        <div className="absolute h-12 w-12 rounded-full border-2 border-primary/40" />
        
        {/* Central Spinner */}
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      
      {/* Loading Text */}
      <div className="mt-8 flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-foreground/80 tracking-widest uppercase animate-pulse">
          Loading
        </p>
        <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
      </div>
    </div>
  );
};

export default PageLoader;
