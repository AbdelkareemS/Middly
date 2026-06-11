import React from 'react';
import { Link } from 'react-router-dom';

export const AccessDenied: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-kinetic-bg font-kinetic text-kinetic-fg">
      <div className="border-2 border-kinetic-border p-12 max-w-2xl text-center relative overflow-hidden bg-kinetic-bg">
        
        {/* Background glitch/number */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-bold text-kinetic-muted/20 select-none pointer-events-none">
          403
        </div>

        <div className="relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-kinetic-accent leading-none mb-4">DENIED</h1>
          <p className="text-xl font-bold tracking-widest text-kinetic-muted-fg mb-12">
            INVALID OR EXPIRED TOKEN.
          </p>
          <Link to="/" className="inline-block kinetic-btn px-10 py-5 text-2xl">
            RETURN HOME →
          </Link>
        </div>
      </div>
    </div>
  );
};
