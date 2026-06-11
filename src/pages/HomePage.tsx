import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col font-kinetic bg-kinetic-bg text-kinetic-fg overflow-x-hidden">
      <Navbar />

      {/* 2. Brutalist Hero Section */}
      <section className="flex-1 flex flex-col justify-center px-6 md:px-12 py-20 relative border-b-2 border-kinetic-border">
        
        {/* Massive background number */}
        <div className="absolute top-0 right-0 text-[clamp(10rem,30vw,30rem)] font-bold text-kinetic-muted leading-[0.7] select-none pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4">
          01
        </div>

        <div className="z-10 w-full">
          <h1 className="text-[clamp(4rem,10vw,12rem)] font-bold tracking-tighter leading-[0.85] mb-12 max-w-[90vw]">
            <span className="text-kinetic-accent">MIDDLY</span><br/>
            SHARE <br/>
            DELIVERABLES<br/>
            SECURELY<span className="text-kinetic-accent">.</span>
          </h1>
          
          <Link 
            to="/signup" 
            className="inline-flex items-center text-xl md:text-3xl border-2 border-kinetic-border py-6 px-12 font-bold uppercase tracking-tighter bg-kinetic-bg hover:bg-kinetic-accent hover:border-kinetic-accent hover:text-kinetic-bg transition-colors group"
          >
            START AS FREELANCER 
            <span className="ml-4 transform group-hover:translate-x-2 transition-transform">→</span>
          </Link>
        </div>
      </section>

      {/* 3. Functional Blueprint Section */}
      <section className="border-b-2 border-kinetic-border">
        {/* Section Header */}
        <div className="px-6 md:px-12 py-8 border-b-2 border-kinetic-border bg-kinetic-muted/20">
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-tighter leading-none">
            FUNCTIONAL_BLUEPRINT
          </h2>
        </div>
        
        {/* Brutalist Grid (No gaps, borders act as dividers) */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          
          {/* Step 1 */}
          <div className="kinetic-card border-x-0 border-t-0 md:border-r-2 md:border-b-0 min-h-[300px] flex flex-col justify-end group hover:bg-kinetic-muted/20 transition-colors">
            <div className="absolute top-4 right-4 text-kinetic-muted group-hover:text-kinetic-accent transition-colors">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            </div>
            <div className="text-[8rem] font-bold text-kinetic-muted leading-[0.8] absolute top-12 left-2 -z-10 select-none group-hover:text-kinetic-border transition-colors">
              01
            </div>
            <h3 className="text-3xl font-bold tracking-tighter mb-4">UPLOAD TO S3</h3>
            <p className="text-kinetic-muted-fg font-medium tracking-tight text-lg">
              Freelancer securely uploads the final deliverable via a presigned AWS URL.
            </p>
          </div>

          {/* Step 2 */}
          <div className="kinetic-card border-x-0 border-t-0 md:border-r-2 md:border-b-0 min-h-[300px] flex flex-col justify-end group hover:bg-kinetic-muted/20 transition-colors">
            <div className="absolute top-4 right-4 text-kinetic-muted group-hover:text-kinetic-accent transition-colors">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <div className="text-[8rem] font-bold text-kinetic-muted leading-[0.8] absolute top-12 left-2 -z-10 select-none group-hover:text-kinetic-border transition-colors">
              02
            </div>
            <h3 className="text-3xl font-bold tracking-tighter mb-4">GUEST PREVIEW</h3>
            <p className="text-kinetic-muted-fg font-medium tracking-tight text-lg">
              Client previews the watermarked file, pays P2P, and uploads the receipt.
            </p>
          </div>

          {/* Step 3 */}
          <div className="kinetic-card border-0 min-h-[300px] flex flex-col justify-end group hover:bg-kinetic-accent transition-colors">
            <div className="absolute top-4 right-4 text-kinetic-muted group-hover:text-kinetic-bg transition-colors">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div className="text-[8rem] font-bold text-kinetic-muted leading-[0.8] absolute top-12 left-2 -z-10 select-none group-hover:text-kinetic-bg/20 transition-colors">
              03
            </div>
            <h3 className="text-3xl font-bold tracking-tighter mb-4 group-hover:text-kinetic-bg transition-colors">INSTANT UNLOCK</h3>
            <p className="text-kinetic-muted-fg font-medium tracking-tight text-lg group-hover:text-kinetic-bg/80 transition-colors">
              Freelancer approves the receipt, and the client instantly downloads the original.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Massive Footer Marquee */}
      <footer className="py-20 marquee-container text-kinetic-muted text-[clamp(4rem,10vw,8rem)] font-bold tracking-tighter leading-none select-none">
        <div className="marquee-content">
          NO REGISTRATION REQUIRED // NO REGISTRATION REQUIRED // NO REGISTRATION REQUIRED // NO REGISTRATION REQUIRED // 
        </div>
      </footer>
    </div>
  );
};
