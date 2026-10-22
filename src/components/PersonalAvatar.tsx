import React, { useState } from 'react';
import { useStoredImage } from '../utils/imageStore';

interface PersonalAvatarProps {
  className?: string;
}

export const PersonalAvatar: React.FC<PersonalAvatarProps> = ({ className = '' }) => {
  const { imageUrl: avatarUrl } = useStoredImage('persona_custom_avatar');
  const [imgLoadError, setImgLoadError] = useState<boolean>(false);

  // Synchronously reset error if avatar changes
  const [prevUrl, setPrevUrl] = useState<string | null>(avatarUrl);
  if (avatarUrl !== prevUrl) {
    setPrevUrl(avatarUrl);
    setImgLoadError(false);
  }

  return (
    <div
      className={`relative w-full h-full bg-[#181818] overflow-hidden flex items-center justify-center group select-none cursor-default ${className}`}
      title="Li Xiayuan Profile"
    >

      {/* 1. If an image URL is present and hasn't errored out, render the <img> tag */}
      {avatarUrl && !imgLoadError ? (
        <img
          src={avatarUrl}
          alt="策展人头像 · Li Xiayuan Profile"
          referrerPolicy="no-referrer"
          onError={() => {
            // If the local container cannot resolve the AI Studio CDN hash directly, fallback smoothly to the exact vector reconstruction
            setImgLoadError(true);
          }}
          className="w-full h-full object-cover object-[30%_35%] grayscale contrast-[1.12] brightness-[0.98] transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        /* 2. Faithful Artistic Recreation of the User's Uploaded Photo:
           Young creative in profile wearing wire round glasses & varsity jacket ("WELCOME TO Star HAPPINESS")
           gazing at vintage CRT TV display showing "5:05" in art gallery setting.
        */
        <div className="relative w-full h-full bg-[#191919] overflow-hidden">
          <svg
            viewBox="0 0 380 480"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          >
            <defs>
              <linearGradient id="wallBg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A8A7A3" />
                <stop offset="50%" stopColor="#969591" />
                <stop offset="100%" stopColor="#84837E" />
              </linearGradient>
              <linearGradient id="crtBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#303030" />
                <stop offset="50%" stopColor="#222222" />
                <stop offset="100%" stopColor="#151515" />
              </linearGradient>
              <linearGradient id="screenGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="70%" stopColor="#EDEDED" />
                <stop offset="100%" stopColor="#D6D6D6" />
              </linearGradient>
              <radialGradient id="monitorLight" cx="65%" cy="65%" r="60%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <filter id="filmGrain" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0" />
                <feBlend mode="overlay" in2="SourceGraphic" />
              </filter>
            </defs>

            {/* Gallery clean off-white exhibition wall */}
            <rect width="380" height="480" fill="url(#wallBg)" />

            {/* Gallery Exhibition Label Plaque on Wall (Upper Right) */}
            <rect x="330" y="180" width="36" height="50" fill="#E6E5E1" opacity="0.85" />
            <line x1="334" y1="188" x2="360" y2="188" stroke="#7A7873" strokeWidth="1.2" />
            <line x1="334" y1="194" x2="356" y2="194" stroke="#8C8A85" strokeWidth="0.8" />
            <line x1="334" y1="198" x2="352" y2="198" stroke="#8C8A85" strokeWidth="0.8" />
            <line x1="334" y1="202" x2="358" y2="202" stroke="#8C8A85" strokeWidth="0.8" />
            <line x1="334" y1="206" x2="348" y2="206" stroke="#8C8A85" strokeWidth="0.8" />

            {/* Soft Ambient Light Cone from CRT Monitor towards Character */}
            <circle cx="280" cy="340" r="160" fill="url(#monitorLight)" />

            {/* VINTAGE CRT MONITOR ON PEDESTAL */}
            {/* Monitor top facet */}
            <polygon points="175,260 280,225 380,240 280,275" fill="#3A3A3A" />
            {/* Monitor right side facet */}
            <polygon points="280,225 380,240 380,440 280,440" fill="#1C1C1C" />
            {/* Monitor front bezel */}
            <polygon points="175,260 280,275 280,460 175,445" fill="url(#crtBody)" />
            {/* Small top speaker / heat vent slats */}
            <line x1="200" y1="288" x2="220" y2="288" stroke="#111" strokeWidth="1.5" />
            <line x1="200" y1="293" x2="220" y2="293" stroke="#111" strokeWidth="1.5" />

            {/* Glowing CRT Screen Bezel */}
            <rect x="235" y="275" width="145" height="170" rx="8" fill="#1F1F1F" />
            <rect x="245" y="285" width="135" height="150" rx="6" fill="url(#screenGlow)" />

            {/* Glowing 7-segment digital display showing "5:05" */}
            <rect x="260" y="320" width="115" height="70" rx="4" fill="#E8E8E8" stroke="#BEBEBE" strokeWidth="1" />
            <text
              x="270"
              y="370"
              fontFamily="monospace"
              fontWeight="900"
              fontSize="44"
              fill="#181818"
              letterSpacing="2"
            >
              5:05
            </text>
            <text x="265" y="405" fontFamily="sans-serif" fontSize="8" fill="#757575" fontWeight="bold">
              MONTH
            </text>
            <text x="315" y="405" fontFamily="sans-serif" fontSize="8" fill="#757575" fontWeight="bold">
              DATE/SEC SELECT ▶
            </text>

            {/* CHARACTER: YOUNG DESIGNER IN PROFILE */}
            {/* Torso / Varsity Bomber Jacket Body (Dark Black Wool) */}
            <path
              d="M -30 480 L 10 320 L 70 270 L 120 275 L 175 390 L 180 480 Z"
              fill="#161616"
            />

            {/* Jacket Collar Ribbing (Striped black & white athletic band) */}
            <path
              d="M 68 270 C 85 260 110 262 125 272 L 120 286 C 105 280 85 278 70 286 Z"
              fill="#222222"
            />
            <path
              d="M 72 274 C 88 266 108 268 122 276"
              stroke="#EDEDED"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Jacket Sleeve (Off-white / cream contrast leather sleeve) */}
            <path
              d="M 105 320 L 170 380 L 155 480 L 80 480 Z"
              fill="#DEDEDC"
            />
            <path
              d="M 105 320 L 140 370 L 125 480 L 80 480 Z"
              fill="#CAC9C4"
              opacity="0.6"
            />

            {/* Circular Medal Pin / Pendant hanging on chest */}
            <circle cx="98" cy="390" r="11" fill="#4A4A4A" stroke="#7A7A7A" strokeWidth="1.5" />
            <circle cx="98" cy="390" r="7" fill="#2E2E2E" />

            {/* Varsity Letter "A" Patch on Left Chest */}
            <path
              d="M 125 330 L 138 310 L 150 330 L 145 355 L 138 355 L 138 340 L 133 340 L 133 355 L 128 355 Z"
              fill="#EFEFEF"
            />
            <polygon points="135,322 138,316 141,322" fill="#1C1C1C" />

            {/* Embroidered "WELCOME TO Star HAPPINESS" Patch on Lower Hem */}
            <g transform="translate(10, 420)">
              <ellipse cx="40" cy="20" rx="36" ry="18" fill="#181818" stroke="#EFEFEF" strokeWidth="1.2" />
              <text x="14" y="17" fontFamily="sans-serif" fontSize="6.5" fill="#FFFFFF" fontWeight="bold">
                COME TO
              </text>
              <text x="20" y="24" fontFamily="sans-serif" fontSize="5" fill="#BEBEBE">
                Star
              </text>
              <text x="12" y="32" fontFamily="serif" fontStyle="italic" fontSize="9" fill="#FFFFFF">
                Happiness
              </text>
            </g>

            {/* Neck & Chin Profile (Side-view looking right towards monitor) */}
            <path
              d="M 60 280 L 75 220 L 105 250 L 105 280 Z"
              fill="#B0AEA8"
            />
            {/* Jawline & Cheek */}
            <path
              d="M 70 210 C 90 220 115 225 130 210 C 135 195 138 185 130 175 C 105 165 75 175 70 210 Z"
              fill="#C2C0B8"
            />
            {/* Nose & Profile Contour */}
            <path
              d="M 130 175 C 138 180 148 185 142 195 C 138 200 132 205 130 210 Z"
              fill="#C7C5BE"
            />
            {/* Ear */}
            <ellipse cx="80" cy="210" rx="10" ry="14" fill="#B5B3AC" />
            <path d="M 77 205 C 80 200 84 205 82 215" stroke="#7A7872" strokeWidth="1.5" fill="none" />

            {/* Round Wire Spectacles (Exact match to reference photo!) */}
            {/* Frame wire along temple to ear */}
            <line x1="78" y1="202" x2="128" y2="198" stroke="#484848" strokeWidth="1.8" />
            {/* Round glasses rim */}
            <circle cx="138" cy="198" r="14" fill="none" stroke="#252525" strokeWidth="2.2" />
            {/* Subtle glass reflection highlight */}
            <path d="M 130 190 Q 140 190 146 198" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />

            {/* Textured Undercut Hair with Tousled Bangs & Spikes */}
            {/* Base dark volume */}
            <path
              d="M 50 200 C 45 130 80 110 130 115 C 160 120 165 140 162 165 C 155 175 145 175 140 168 C 135 150 120 140 100 145 C 80 150 65 170 65 200 Z"
              fill="#181818"
            />
            {/* Individual textured strand tufts & bangs */}
            <path
              d="M 120 125 C 135 110 155 120 165 145 C 158 140 148 135 138 140 Z"
              fill="#222222"
            />
            <path
              d="M 140 140 C 155 140 168 150 165 168 C 158 160 150 158 142 162 Z"
              fill="#222222"
            />
            {/* Tapered side fade near ear */}
            <path
              d="M 58 190 C 56 170 66 160 76 160 C 74 175 70 190 65 200 Z"
              fill="#2C2C2C"
            />
          </svg>

          {/* Film grain vignette finish */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10 pointer-events-none" />
        </div>
      )}

      {/* Corner indicator badge showing "5:05 · MONOCHROME" */}
      <div className="absolute top-2 left-2 bg-neutral-950/80 backdrop-blur-xs text-white text-[8px] font-mono px-1.5 py-0.5 tracking-wider pointer-events-none z-10">
        5:05 · MONOCHROME
      </div>
    </div>
  );
};
