import React from 'react';
import { ArrowUp, Mail, Phone } from 'lucide-react';

interface FooterProps {
  onBackToTop: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onBackToTop }) => {
  return (
    <footer className="w-full bg-[#141414] text-[#EDEDED] py-20 px-6 sm:px-12 select-none border-t border-neutral-800">
      <div className="max-w-7xl mx-auto flex flex-col justify-between space-y-16">
        {/* Top Split */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-12 border-b border-neutral-800">
          <div>
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-neutral-400 block mb-2">
              STUDIO PER-SONA · EXHIBITION CATALOGUE
            </span>
            <h2 className="text-4xl sm:text-6xl font-serif-display font-light tracking-tight text-white">
              在物质的静止中，倾听空间的呼吸。
            </h2>
          </div>

          <button
            onClick={onBackToTop}
            className="group flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>回到顶部 BACK TO TOP</span>
            <div className="w-6 h-6 rounded-full border border-neutral-600 flex items-center justify-center group-hover:border-white transition-colors">
              <ArrowUp className="w-3 h-3 transition-transform group-hover:-translate-y-0.5" />
            </div>
          </button>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs sm:text-sm font-mono text-neutral-400">
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            <a
              href="mailto:lixy716@163.com"
              className="group flex items-center gap-3 text-neutral-300 hover:text-white transition-colors"
            >
              <div className="w-7 h-7 rounded-full border border-neutral-700 flex items-center justify-center group-hover:border-neutral-400 transition-colors bg-neutral-900/60">
                <Mail className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 uppercase tracking-wider text-xs">Email：</span>
                <span className="text-neutral-200 group-hover:text-white underline underline-offset-4 decoration-neutral-700 group-hover:decoration-neutral-300">
                  lixy716@163.com
                </span>
              </div>
            </a>

            <a
              href="tel:13068767831"
              className="group flex items-center gap-3 text-neutral-300 hover:text-white transition-colors"
            >
              <div className="w-7 h-7 rounded-full border border-neutral-700 flex items-center justify-center group-hover:border-neutral-400 transition-colors bg-neutral-900/60">
                <Phone className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 uppercase tracking-wider text-xs">Number：</span>
                <span className="text-neutral-200 group-hover:text-white underline underline-offset-4 decoration-neutral-700 group-hover:decoration-neutral-300">
                  13068767831
                </span>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-4 text-neutral-500 text-xs tracking-wider">
            <span>LI XIAYUAN · ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
