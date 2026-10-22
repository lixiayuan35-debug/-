import React, { useState, useEffect } from 'react';
import { ArtworkVisual } from './ArtworkVisual';
import { getStoredImage } from '../utils/imageStore';
import { ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imagesVersion, setImagesVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setImagesVersion((v) => v + 1);
    window.addEventListener('portfolio_custom_images_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_custom_images_updated', handleUpdate);
  }, []);

  return (
    <section
      id="cover"
      className="relative min-h-screen w-full flex flex-col justify-between items-center px-6 pt-24 pb-12 select-none overflow-hidden bg-[#F5F4F0]"
    >
      {/* Top minimal brand signature (as in reference image) */}
      <div className="w-full flex justify-center text-xs tracking-[0.3em] font-sans-body uppercase text-neutral-800 font-medium pt-2">
        PER-SONA©
      </div>

      {/* Main typographic and visual lockup — exact match to reference image */}
      <div className="relative my-auto w-full max-w-5xl flex flex-col items-center justify-center py-6">
        {/* Inset Central Architectural Image (Enzo Berti — The Cubo 1998) */}
        {/* Placed behind/interlocked with Studio & PERSONA typography */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative z-10 w-[240px] sm:w-[300px] md:w-[340px] aspect-[3/4] cursor-pointer"
        >
          {/* Inner container with grayscale-to-color transition and scale */}
          <div
            className={`w-full h-full shadow-2xl overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isHovered
                ? 'grayscale-0 scale-[1.04] shadow-neutral-900/25 ring-1 ring-black/20'
                : 'grayscale contrast-[1.08] brightness-[0.98] scale-100 ring-1 ring-black/10'
            }`}
          >
            <ArtworkVisual
              key={`hero-art-${imagesVersion}`}
              type="chair"
              imageUrl={getStoredImage('hero-cover')}
              isHovered={isHovered}
            />
          </div>
        </div>

        {/* Oversized Typographic Text Layer */}
        {/* "Studio" positioned upper, "PERSONA" positioned lower */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-20">
          {/* Top word: "Studio" in italic serif display */}
          <h1
            className="font-serif-display italic font-normal text-[4.8rem] sm:text-[7.5rem] md:text-[11.5rem] lg:text-[13.5rem] leading-[0.78] tracking-[-0.03em] text-[#111111] -translate-y-12 sm:-translate-y-16 md:-translate-y-24 drop-shadow-sm transition-transform duration-700"
            style={{
              transform: isHovered
                ? 'translateY(-5rem) scale(1.01)'
                : 'translateY(-4.5rem) scale(1)',
            }}
          >
            Studio
          </h1>

          {/* Bottom word: "PERSONA" in clean geometric uppercase sans-serif */}
          <h2
            className="font-sans-body font-bold text-[4rem] sm:text-[6.8rem] md:text-[10.5rem] lg:text-[12rem] leading-[0.82] tracking-[0.06em] text-[#0A0A0A] translate-y-6 sm:translate-y-8 md:translate-y-14 transition-transform duration-700"
            style={{
              transform: isHovered
                ? 'translateY(2.8rem) scale(1.01)'
                : 'translateY(2.2rem) scale(1)',
            }}
          >
            PERSONA
          </h2>
        </div>
      </div>

      {/* Bottom bar & Dynamic guidance: 90-degree rotated breathing bar */}
      <div className="w-full max-w-6xl flex justify-between items-end relative z-30 pt-4">
        {/* Left minimal metadata */}
        <div className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-neutral-500 uppercase">
          <p>PERSONAL WORKS SHOWCASE</p>
          <p className="text-neutral-400">2025-2026</p>
        </div>

        {/* Dynamic guidance: 90-degree rotated bar with breathing animation */}
        <button
          onClick={onExploreClick}
          className="group flex flex-col items-center gap-4 cursor-pointer focus:outline-none"
          title="向下探索个人页"
        >
          {/* Rotated text and breathing line indicator */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-[0.3em] font-mono uppercase text-neutral-600 group-hover:text-neutral-950 transition-colors">
              向下探索 EXPLORE
            </span>
            <div className="w-5 h-5 rounded-full border border-neutral-400 flex items-center justify-center group-hover:border-neutral-900 transition-colors">
              <ArrowDown className="w-3 h-3 text-neutral-700 group-hover:text-neutral-900 transition-transform group-hover:translate-y-0.5" />
            </div>
          </div>

          {/* 90-degree vertical guidance indicator bar with breathing pulse animation */}
          <div className="relative w-px h-16 bg-neutral-300 overflow-hidden">
            <div className="w-full h-8 bg-neutral-950 animate-breathing rounded-full" />
          </div>
        </button>
      </div>
    </section>
  );
};
