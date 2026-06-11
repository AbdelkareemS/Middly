import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col w-full border-b-2 border-kinetic-border">
      {/* Main Nav */}
      <nav className="w-full bg-kinetic-bg py-4 px-6 md:px-12 flex items-center justify-between z-50">
        <Link to="/" className="text-3xl font-bold tracking-tighter text-kinetic-fg hover:text-kinetic-accent transition-colors leading-none">
          MIDDLY<span className="text-kinetic-accent">.</span>
        </Link>
        
        <div>
          {currentUser ? (
            <Link 
              to="/dashboard" 
              className="kinetic-btn inline-block py-3 px-6 text-sm"
            >
              GO TO DASHBOARD
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="kinetic-btn inline-block py-3 px-6 text-sm"
            >
              FREELANCER LOGIN
            </Link>
          )}
        </div>
      </nav>

      {/* Persistent Kinetic Marquee */}
      <div className="w-full bg-kinetic-muted border-t-2 border-kinetic-border py-1 marquee-container text-kinetic-accent text-xs font-bold tracking-widest">
        <div className="marquee-content">
          SECURE P2P DELIVERABLES // ZERO COMMISSIONS // INSTANT UNLOCK // SECURE P2P DELIVERABLES // ZERO COMMISSIONS // INSTANT UNLOCK // SECURE P2P DELIVERABLES // ZERO COMMISSIONS // INSTANT UNLOCK // SECURE P2P DELIVERABLES // ZERO COMMISSIONS // INSTANT UNLOCK //
        </div>
      </div>
    </div>
  );
};
