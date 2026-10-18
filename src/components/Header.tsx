import React from 'react';
import { Sparkles, QrCode } from 'lucide-react';

interface HeaderProps {
  onReplayOpening: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenQrModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReplayOpening,
  activeSection,
  onNavigate,
  onOpenQrModal,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#F5F4F0]/85 backdrop-blur-md border-b border-neutral-300/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Brand title, single line text element wordmark */}
        <button
          onClick={() => onNavigate('cover')}
          className="text-sm tracking-[0.25em] font-sans-body font-semibold uppercase text-neutral-900 hover:text-neutral-600 transition-colors whitespace-nowrap cursor-pointer"
        >
          PER-SONA©
        </button>

        {/* Zone 2: 4 nav links, single line text with subtle hover underlines */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest uppercase text-neutral-600">
          <button
            onClick={() => onNavigate('cover')}
            className={`transition-colors hover:text-neutral-950 pb-0.5 border-b cursor-pointer ${
              activeSection === 'cover' ? 'border-neutral-950 text-neutral-950 font-medium' : 'border-transparent'
            }`}
          >
            Cover / 封面
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className={`transition-colors hover:text-neutral-950 pb-0.5 border-b cursor-pointer ${
              activeSection === 'profile' ? 'border-neutral-950 text-neutral-950 font-medium' : 'border-transparent'
            }`}
          >
            Profile / 个人
          </button>
          <button
            onClick={() => onNavigate('works')}
            className={`transition-colors hover:text-neutral-950 pb-0.5 border-b cursor-pointer ${
              activeSection === 'works' ? 'border-neutral-950 text-neutral-950 font-medium' : 'border-transparent'
            }`}
          >
            Works / 目录
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReplayOpening}
            title="重新体验开幕仪式"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-wider text-neutral-700 bg-neutral-200/60 hover:bg-neutral-900 hover:text-white transition-all duration-300 rounded-none whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>开幕重演</span>
          </button>

          <a
            href="#contact-qr"
            role="button"
            onClick={(e) => {
              e.preventDefault();
              onOpenQrModal?.();
            }}
            title="点击查看微信与抖音二维码"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase text-white bg-neutral-900 hover:bg-neutral-800 transition-colors whitespace-nowrap cursor-pointer shadow-sm active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>联络·二维码</span>
          </a>
        </div>
      </div>
    </header>
  );
};
