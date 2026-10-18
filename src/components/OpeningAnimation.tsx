import React, { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface OpeningAnimationProps {
  onComplete: () => void;
  isOpen: boolean;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({
  onComplete,
  isOpen,
}) => {
  const [stage, setStage] = useState<number>(0);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    setStage(1); // Line start growing
    const t1 = setTimeout(() => setStage(2), 700); // Typography reveal
    const t2 = setTimeout(() => setStage(3), 1900); // Ready state
    const t3 = setTimeout(() => {
      handleEnter();
    }, 3600); // Smooth auto-dismiss

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  const handleEnter = () => {
    setIsClosing(true);
    setTimeout(() => {
      onComplete();
      setIsClosing(false);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-8 md:p-16 bg-[#F5F4F0] text-[#121212] transition-opacity duration-700 ease-out select-none ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top editorial markers */}
      <div className="flex justify-between items-start text-[11px] tracking-[0.25em] text-neutral-500 font-mono uppercase">
        <div className={`transition-all duration-700 delay-100 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          LI XIAYUAN · PORTFOLIO
        </div>
        <div className={`transition-all duration-700 delay-200 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          PERSONAL WORKS SHOWCASE · 2025—2026
        </div>
      </div>

      {/* Center ceremony composition */}
      <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center my-auto py-12">
        {/* Minimalist central line growth animation */}
        <div className="relative w-full h-px my-8 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-neutral-900 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: stage >= 1 ? '100%' : '0%',
            }}
          />
          {/* Central crosshair pin */}
          <div
            className={`absolute left-1/2 -top-1 w-2 h-2 -ml-1 rounded-full border border-neutral-900 bg-[#F5F4F0] transition-opacity duration-500 delay-500 ${
              stage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
          />
        </div>

        {/* Elegant typography floating in */}
        <div className="text-center overflow-hidden">
          <p
            className={`text-xs md:text-sm font-sans-body tracking-[0.35em] text-neutral-500 uppercase mb-4 transition-all duration-700 ease-out delay-200 ${
              stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Personal Works Showcase · 个人作品展示
          </p>

          <h1
            className={`text-5xl sm:text-7xl md:text-8xl font-serif-display font-light tracking-tight leading-none text-neutral-950 transition-all duration-800 ease-out delay-300 ${
              stage >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            PER-SONA
          </h1>

          <p
            className={`mt-4 text-xs sm:text-sm font-serif-display italic tracking-[0.15em] text-neutral-600 transition-all duration-700 ease-out delay-500 ${
              stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            在物质的静止中，倾听空间的呼吸 · 李夏远
          </p>
        </div>

        {/* Minimalist dimensional measurement ticks */}
        <div
          className={`flex items-center gap-3 sm:gap-5 mt-8 text-[10px] sm:text-[11px] tracking-[0.25em] font-mono text-neutral-400 uppercase transition-opacity duration-700 delay-700 ${
            stage >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span>DESIGN EXPLORATION</span>
          <span className="text-neutral-300">·</span>
          <span>SELECTED WORKS</span>
          <span className="text-neutral-300">·</span>
          <span>2025—2026</span>
        </div>
      </div>

      {/* Bottom skip/enter action */}
      <div className="flex justify-between items-end border-t border-black/10 pt-6">
        <div className="text-[11px] tracking-[0.2em] text-neutral-400 font-mono">
          [ 01 / PORTFOLIO COMMENCEMENT ]
        </div>

        <button
          onClick={handleEnter}
          className="group flex items-center gap-2 px-5 py-2.5 text-xs font-mono tracking-widest uppercase bg-neutral-900 text-white rounded-none hover:bg-neutral-800 transition-all duration-300 cursor-pointer shadow-sm active:scale-95"
        >
          <span>进入作品集 ENTER PORTFOLIO</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
};
