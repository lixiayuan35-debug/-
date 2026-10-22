import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toRootRelativePath } from '../utils/pathUtils';
import { isLocalUploadedImage } from '../utils/imageStore';

interface ArtworkVisualProps {
  type: string;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  isHovered?: boolean;
  clearBaseVisual?: boolean;
  fitMode?: 'cover' | 'contain';
}

export const ArtworkVisual: React.FC<ArtworkVisualProps> = ({
  type,
  imageUrl,
  alt = '作品展示',
  className = '',
  isHovered = false,
  clearBaseVisual = false,
  fitMode = 'cover',
}) => {
  const rawImage =
    imageUrl ||
    (type &&
    (type.startsWith('http://') ||
      type.startsWith('https://') ||
      type.startsWith('/') ||
      type.startsWith('./') ||
      type.includes('/works/'))
      ? type
      : null);

  const isLocal = isLocalUploadedImage(rawImage) || (rawImage && rawImage.startsWith('blob:'));
  const displayImage = isLocal ? null : (toRootRelativePath(rawImage) || rawImage);

  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  const [prevImage, setPrevImage] = useState<string | null>(displayImage);

  // Synchronously reset error state whenever displayImage switches
  if (displayImage !== prevImage) {
    setPrevImage(displayImage);
    setLoadFailed(false);
  }

  // 1. If an image is provided and hasn't failed to load
  if (displayImage && !loadFailed) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-neutral-900 select-none flex items-center justify-center ${className}`}>
        <img
          key={displayImage.slice(0, 48)}
          src={displayImage}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => {
            console.warn('Image load error occurred for source');
            // If it's a data URL, avoid premature error flash unless truly corrupt
            if (displayImage && displayImage.startsWith('data:image/') && displayImage.length > 100) {
              // Valid data URL, do not permanently break
              return;
            }
            setLoadFailed(true);
          }}
          className={`w-full h-full ${
            fitMode === 'contain' ? 'object-contain p-1' : 'object-cover'
          } transition-transform duration-700 ease-out ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
        />
      </div>
    );
  }

  // 2. If image failed to load, display clear recovery placeholder instead of broken image
  if (loadFailed) {
    return (
      <div className={`relative w-full h-full bg-[#EAE8E2] border border-dashed border-neutral-300 flex flex-col items-center justify-center p-3 text-center select-none ${className}`}>
        <AlertCircle className="w-6 h-6 text-neutral-400 stroke-[1.5] mb-1" />
        <span className="text-[11px] font-mono text-neutral-700 font-medium">图片读取异常</span>
        <span className="text-[9px] font-mono text-neutral-400 mt-0.5">点击右上角重新上传照片</span>
      </div>
    );
  }

  // 3. If base visual illustration is cleared (e.g. in Works Section directory)
  if (clearBaseVisual || type === 'clean-placeholder') {
    return (
      <div className={`relative w-full h-full bg-[#ECE9E2] border border-neutral-300/80 flex flex-col items-center justify-center p-3 text-center select-none overflow-hidden group ${className}`}>
        {/* Subtle grid texture & architectural corner crosshairs */}
        <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
        <span className="absolute top-1.5 left-1.5 text-[9px] font-mono text-neutral-400">+</span>
        <span className="absolute top-1.5 right-1.5 text-[9px] font-mono text-neutral-400">+</span>
        <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono text-neutral-400">+</span>
        <span className="absolute bottom-1.5 right-1.5 text-[9px] font-mono text-neutral-400">+</span>

        <div className="relative z-10 flex flex-col items-center gap-1.5 text-neutral-500">
          <div className="w-8 h-8 rounded-full bg-white/90 border border-neutral-300 shadow-xs flex items-center justify-center text-neutral-700 transition-transform group-hover:scale-110">
            <Camera className="w-3.5 h-3.5 stroke-[1.5]" />
          </div>
          <span className="text-[10px] font-mono tracking-wider text-neutral-800 font-medium">
            作品影像收录中
          </span>
          <span className="text-[9px] font-mono text-neutral-400 tracking-tight">
            ARCHIVE · EXHIBITION
          </span>
        </div>
      </div>
    );
  }

  switch (type) {
    case 'bamboo-pavilion':
      // Architectural rendering matching uploaded image: Bamboo forest, calm stream with rain ripples, and curving timber pavilion
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#1B231D] flex items-center justify-center select-none ${className}`}>
          {/* Base atmospheric background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#273528] via-[#1E2720] to-[#121914]" />

          <svg
            viewBox="0 0 600 400"
            className="w-full h-full transition-transform duration-700 ease-out preserve-3d"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="skyMisty" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DFE6DC" />
                <stop offset="35%" stopColor="#C4CFBE" />
                <stop offset="70%" stopColor="#7E8F7A" />
                <stop offset="100%" stopColor="#3C4839" />
              </linearGradient>

              <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#253227" />
                <stop offset="50%" stopColor="#1B241D" />
                <stop offset="100%" stopColor="#111712" />
              </linearGradient>

              <linearGradient id="roofSilver" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E2E7EA" />
                <stop offset="30%" stopColor="#CAD2D6" />
                <stop offset="70%" stopColor="#8C979E" />
                <stop offset="100%" stopColor="#4A5258" />
              </linearGradient>

              <linearGradient id="timberWarm" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#C48D57" />
                <stop offset="50%" stopColor="#A8723E" />
                <stop offset="100%" stopColor="#7E4E24" />
              </linearGradient>

              <linearGradient id="timberLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E6B47C" />
                <stop offset="100%" stopColor="#A26C38" />
              </linearGradient>

              <linearGradient id="sunbeam" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255, 255, 235, 0.35)" />
                <stop offset="40%" stopColor="rgba(255, 255, 240, 0.15)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </linearGradient>

              <linearGradient id="bambooGreen" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6C8D58" />
                <stop offset="50%" stopColor="#4C6C38" />
                <stop offset="100%" stopColor="#2D4620" />
              </linearGradient>
            </defs>

            {/* Sky & Distant Mountain */}
            <rect width="600" height="400" fill="url(#skyMisty)" />
            <path d="M 0 160 Q 150 120 320 140 Q 420 110 600 130 L 600 200 L 0 200 Z" fill="#697765" opacity="0.45" />

            {/* Bamboo Forest (Left Side) */}
            <g id="bamboo-grove">
              {/* Back Layer Stalks (Thinner, Muted) */}
              {[15, 38, 55, 78, 102, 125, 148, 172, 195, 218].map((x, i) => (
                <rect key={`bg-${i}`} x={x} y="0" width="3.5" height="300" fill="#3D5333" opacity="0.55" />
              ))}
              {/* Mid Layer Stalks */}
              {[25, 65, 88, 115, 135, 160, 185, 205].map((x, i) => (
                <g key={`mg-${i}`}>
                  <rect x={x} y="0" width="5.5" height="320" fill="url(#bambooGreen)" />
                  {/* Nodes */}
                  <line x1={x - 1} y1="60" x2={x + 6.5} y2="60" stroke="#8EA979" strokeWidth="1" />
                  <line x1={x - 1} y1="120" x2={x + 6.5} y2="120" stroke="#8EA979" strokeWidth="1" />
                  <line x1={x - 1} y1="180" x2={x + 6.5} y2="180" stroke="#8EA979" strokeWidth="1" />
                  <line x1={x - 1} y1="240" x2={x + 6.5} y2="240" stroke="#8EA979" strokeWidth="1" />
                </g>
              ))}
              {/* Front Foreground Stalks (Bold, Detailed) */}
              {[8, 48, 92, 142, 180].map((x, i) => (
                <g key={`fg-${i}`}>
                  <rect x={x} y="0" width="8" height="350" fill="url(#bambooGreen)" filter="drop-shadow(2px 0 4px rgba(0,0,0,0.4))" />
                  {/* Highlight sheen */}
                  <line x1={x + 2} y1="0" x2={x + 2} y2="350" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                  {/* Bamboo nodes */}
                  <rect x={x - 1} y="50" width="10" height="2" fill="#88A572" />
                  <rect x={x - 1} y="110" width="10" height="2" fill="#88A572" />
                  <rect x={x - 1} y="175" width="10" height="2" fill="#88A572" />
                  <rect x={x - 1} y="245" width="10" height="2" fill="#88A572" />
                  <rect x={x - 1} y="315" width="10" height="2" fill="#88A572" />
                </g>
              ))}

              {/* Bamboo Foliage clusters */}
              {[
                { cx: 30, cy: 40, r: 40 },
                { cx: 80, cy: 30, r: 45 },
                { cx: 130, cy: 50, r: 50 },
                { cx: 170, cy: 35, r: 42 },
                { cx: 60, cy: 90, r: 35 },
                { cx: 120, cy: 110, r: 40 },
                { cx: 180, cy: 95, r: 38 },
                { cx: 40, cy: 160, r: 30 },
                { cx: 100, cy: 180, r: 35 },
              ].map((c, i) => (
                <circle key={`leaf-${i}`} cx={c.cx} cy={c.cy} r={c.r} fill="#354E2B" opacity="0.75" />
              ))}
            </g>

            {/* Volumetric Sunbeams / Tyndall Light Effect */}
            <polygon points="400,0 480,0 240,400 120,400" fill="url(#sunbeam)" />
            <polygon points="450,0 520,0 340,400 250,400" fill="url(#sunbeam)" opacity="0.7" />
            <polygon points="360,0 420,0 180,400 90,400" fill="url(#sunbeam)" opacity="0.6" />

            {/* River Stream & Reflecting Water Basin (Bottom & Center) */}
            <path
              d="M 0 240 Q 180 230 320 235 Q 400 240 600 280 L 600 400 L 0 400 Z"
              fill="url(#waterGrad)"
            />

            {/* Soft Reflection of Pavilion in Water */}
            <path
              d="M 360 250 L 600 300 L 600 380 L 360 330 Z"
              fill="rgba(196, 141, 87, 0.12)"
              filter="blur(4px)"
            />
            <path
              d="M 370 245 L 600 280 L 600 320 L 370 260 Z"
              fill="rgba(226, 231, 234, 0.2)"
              filter="blur(2px)"
            />

            {/* Concentric Raindrop Water Ripples (Gentle Rain) */}
            {[
              { cx: 160, cy: 300, rx: 28, ry: 7 },
              { cx: 160, cy: 300, rx: 14, ry: 3.5 },
              { cx: 270, cy: 330, rx: 35, ry: 9 },
              { cx: 270, cy: 330, rx: 18, ry: 4.5 },
              { cx: 90, cy: 340, rx: 22, ry: 6 },
              { cx: 420, cy: 360, rx: 40, ry: 10 },
              { cx: 420, cy: 360, rx: 20, ry: 5 },
              { cx: 220, cy: 260, rx: 18, ry: 5 },
              { cx: 340, cy: 290, rx: 25, ry: 6.5 },
            ].map((r, i) => (
              <ellipse
                key={`ripple-${i}`}
                cx={r.cx}
                cy={r.cy}
                rx={r.rx}
                ry={r.ry}
                fill="none"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1"
              />
            ))}

            {/* Mossy River Bank Stones / Rocks along shoreline */}
            <path d="M 90 270 Q 130 250 160 275 Q 140 300 100 295 Z" fill="#2D2A26" />
            <path d="M 95 268 Q 120 252 145 270 Z" fill="#556E3B" opacity="0.8" />
            <path d="M 175 255 Q 210 240 230 265 Q 210 280 180 275 Z" fill="#242220" />
            <path d="M 180 254 Q 200 242 220 260 Z" fill="#4B6334" opacity="0.75" />
            <path d="M 40 290 Q 75 275 95 305 Q 65 330 35 315 Z" fill="#1F1E1C" />

            {/* Contemporary Curved Timber Pavilion (Right Side) */}
            <g id="timber-pavilion">
              {/* Internal Deck & Lit Pathway Floor */}
              <polygon
                points="360,240 600,240 600,280 370,255"
                fill="#F4EDE2"
                opacity="0.85"
              />
              <polygon
                points="370,245 600,248 600,265 375,255"
                fill="#FFFDF7"
                opacity="0.9"
              />

              {/* Timber Roof Rafters & Truss System (Warm Wood Beams) */}
              {[380, 400, 422, 444, 468, 492, 516, 540, 565, 590].map((x, i) => {
                const topY = 70 + (i * 3.5);
                const bottomY = 160 + (i * 2);
                return (
                  <g key={`truss-${i}`}>
                    {/* Slanted roof joist */}
                    <line
                      x1={x}
                      y1={topY}
                      x2={x + 40}
                      y2={bottomY}
                      stroke="url(#timberWarm)"
                      strokeWidth="5"
                    />
                    {/* Horizontal tie connector */}
                    <line
                      x1={x - 10}
                      y1={bottomY - 15}
                      x2={x + 35}
                      y2={bottomY - 15}
                      stroke="#875326"
                      strokeWidth="3"
                    />
                  </g>
                );
              })}

              {/* Slender Vertical Colonnade Posts (Pine/Cedar Columns) */}
              {[
                { x: 362, topY: 120, botY: 242 },
                { x: 382, topY: 110, botY: 245 },
                { x: 405, topY: 102, botY: 248 },
                { x: 435, topY: 96, botY: 252 },
                { x: 472, topY: 90, botY: 258 },
                { x: 512, topY: 88, botY: 265 },
                { x: 555, topY: 88, botY: 272 },
                { x: 592, topY: 90, botY: 278 },
              ].map((post, i) => (
                <g key={`col-${i}`}>
                  {/* Vertical Post */}
                  <rect
                    x={post.x}
                    y={post.topY}
                    width="6"
                    height={post.botY - post.topY}
                    fill="url(#timberLight)"
                    filter="drop-shadow(1px 2px 3px rgba(0,0,0,0.3))"
                  />
                  {/* Subtle column base joint */}
                  <rect
                    x={post.x - 1}
                    y={post.botY - 3}
                    width="8"
                    height="3"
                    fill="#1A1A1A"
                  />
                </g>
              ))}

              {/* Sweeping Curved Silver Roof Canopy */}
              <path
                d="M 355 125 Q 460 70 600 45 L 600 70 Q 460 95 365 135 Z"
                fill="url(#roofSilver)"
                filter="drop-shadow(0 8px 16px rgba(0,0,0,0.45))"
              />
              {/* Highlight Ridge along Top Edge of Canopy */}
              <path
                d="M 355 125 Q 460 70 600 45"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                fill="none"
                opacity="0.85"
              />
            </g>

            {/* Fine Gentle Falling Rain Streaks */}
            {[
              { x1: 50, y1: 20, x2: 30, y2: 60 },
              { x1: 120, y1: 80, x2: 100, y2: 120 },
              { x1: 220, y1: 40, x2: 200, y2: 80 },
              { x1: 310, y1: 110, x2: 290, y2: 150 },
              { x1: 400, y1: 30, x2: 380, y2: 70 },
              { x1: 180, y1: 220, x2: 160, y2: 260 },
              { x1: 280, y1: 280, x2: 260, y2: 320 },
              { x1: 480, y1: 250, x2: 460, y2: 290 },
            ].map((drop, i) => (
              <line
                key={`rain-${i}`}
                x1={drop.x1}
                y1={drop.y1}
                x2={drop.x2}
                y2={drop.y2}
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="0.8"
              />
            ))}
          </svg>

          {/* Museum-style architectural badge watermark */}
          <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-0.5 tracking-widest border border-white/10">
            咫境方圆 · 农耕文化体验园
          </div>
          <div className="absolute bottom-3 right-3 text-[9px] tracking-[0.2em] text-white/70 font-mono drop-shadow">
            BIFT GRADUATION PROJECT · 2025
          </div>
        </div>
      );

    case 'chair':
      // The Cubo chair by Enzo Berti in 1998 — matching reference photo
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#EAE8E3] flex items-center justify-center select-none ${className}`}>
          {/* Subtle architectural wall gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#EDEDEA] via-[#E5E3DE] to-[#DAD7D0]" />

          {/* Perspective grid floor */}
          <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-[#CFCBC2] to-transparent opacity-60" />
          <div className="absolute bottom-0 w-full h-px bg-black/15" />

          {/* Minimalist modern chair composition (Enzo Berti "The Cubo") */}
          <svg
            viewBox="0 0 400 480"
            className="w-full h-full max-w-[90%] max-h-[92%] transition-transform duration-700 ease-out drop-shadow-2xl"
          >
            <defs>
              <linearGradient id="metalLeg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1E1E1E" />
                <stop offset="50%" stopColor="#2A2A2A" />
                <stop offset="100%" stopColor="#141414" />
              </linearGradient>
              <linearGradient id="leatherSeat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F7F6F2" />
                <stop offset="40%" stopColor="#ECEAE3" />
                <stop offset="100%" stopColor="#DDD9D0" />
              </linearGradient>
              <linearGradient id="leatherBack" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FDFDFC" />
                <stop offset="70%" stopColor="#EDEAE2" />
                <stop offset="100%" stopColor="#D9D5CC" />
              </linearGradient>
              <linearGradient id="shadowCast" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(0,0,0,0.35)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </linearGradient>
              <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="16" stdDeviation="12" floodOpacity="0.18" />
              </filter>
            </defs>

            {/* Ground shadow */}
            <path
              d="M 90 410 L 350 410 L 320 440 L 110 440 Z"
              fill="url(#shadowCast)"
              opacity="0.65"
            />

            {/* Back vertical structural post (Black steel) */}
            <rect x="180" y="110" width="10" height="300" fill="url(#metalLeg)" />

            {/* Left structural side panel / armrest (Distinctive Cubo geometry) */}
            <path
              d="M 125 180 L 190 180 L 190 410 L 178 410 L 178 260 L 125 260 Z"
              fill="#181818"
            />
            {/* Smooth bevel transition */}
            <path
              d="M 178 180 C 178 180 184 210 188 230 L 190 230 L 190 180 Z"
              fill="#2E2E2E"
            />

            {/* Sculptural white leather curved seat cushion */}
            <path
              d="M 190 230 C 230 230 270 240 330 250 L 330 330 C 270 330 230 320 190 320 Z"
              fill="url(#leatherSeat)"
              filter="url(#softGlow)"
            />

            {/* Seat top cushion curve */}
            <path
              d="M 190 230 C 235 228 285 238 330 250 L 325 262 C 280 250 235 240 190 242 Z"
              fill="#FFFFFE"
            />

            {/* Upright backrest cushion (Cylindrical curved ergonomic back) */}
            <path
              d="M 190 150 C 240 150 280 160 320 180 L 320 250 C 280 230 240 220 190 220 Z"
              fill="url(#leatherBack)"
            />

            {/* Front right leg (Thin architectural black bar) */}
            <rect x="325" y="250" width="8" height="160" fill="url(#metalLeg)" />
            {/* Front horizontal tie bar */}
            <rect x="180" y="320" width="150" height="8" fill="#151515" />

            {/* Back leg */}
            <rect x="184" y="325" width="8" height="85" fill="url(#metalLeg)" />

            {/* Iconic vertical architectural cut-line (as in reference image) */}
            <line x1="189" y1="90" x2="189" y2="425" stroke="#121212" strokeWidth="2.5" />

            {/* Subtle aesthetic coordinate marks */}
            <circle cx="189" cy="230" r="2.5" fill="#FFFFFF" />
          </svg>

          {/* Minimalist museum catalog text watermark */}
          <div className="absolute top-4 left-4 text-[9px] tracking-[0.25em] text-neutral-400 font-mono">
            ARCHIVE NO. 98-IT
          </div>
          <div className="absolute bottom-4 right-4 text-[9px] tracking-[0.2em] text-neutral-400 font-mono">
            SCALE 1:1
          </div>
        </div>
      );

    case 'pavilion':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#D8D7D3] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#E2E1DD] via-[#D2D0CB] to-[#BDBBB4]" />
          <svg viewBox="0 0 400 300" className="w-full h-full max-w-[95%]">
            <defs>
              <radialGradient id="oculumLight" cx="50%" cy="30%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Concrete walls and cantilevers */}
            <path d="M 40 40 L 360 40 L 360 260 L 40 260 Z" fill="#C5C3BC" />
            <polygon points="40,40 200,10 360,40 200,70" fill="#E8E7E3" />
            <polygon points="40,40 200,70 200,260 40,260" fill="#B3B1A9" />
            <polygon points="200,70 360,40 360,260 200,260" fill="#8C8A83" />
            {/* Zenith Circular Oculum */}
            <ellipse cx="200" cy="70" rx="45" ry="18" fill="#FFFFFF" />
            {/* Projected Cone of Light */}
            <polygon points="155,70 245,70 310,240 90,240" fill="url(#oculumLight)" />
            {/* Reflective Basalt Pool */}
            <ellipse cx="200" cy="235" rx="90" ry="22" fill="#1C1D1E" />
            <ellipse cx="200" cy="235" rx="84" ry="19" fill="#2E3032" opacity="0.8" />
            {/* Architecture hairline marks */}
            <line x1="200" y1="70" x2="200" y2="260" stroke="#000" strokeWidth="0.7" opacity="0.4" />
          </svg>
          <div className="absolute top-4 left-4 text-[9px] tracking-[0.2em] text-neutral-500 font-mono">
            SECTION A-A · 4.8M OCULUM
          </div>
        </div>
      );

    case 'luminaire':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#1D1C1A] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#141311] via-[#1D1B18] to-[#262420]" />
          <svg viewBox="0 0 400 300" className="w-full h-full max-w-[90%]">
            <defs>
              <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFDEAC" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#D99B52" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1A1815" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="glassBody" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="25%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="85%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.45)" />
              </linearGradient>
            </defs>
            {/* Glowing Orb Aura */}
            <circle cx="200" cy="140" r="110" fill="url(#auraGlow)" />
            {/* Pedestal */}
            <rect x="180" y="220" width="40" height="60" rx="3" fill="#3D3A35" />
            <rect x="140" y="270" width="120" height="8" rx="2" fill="#5A554E" />
            {/* Frosted Glass Cylindrical Shell */}
            <rect x="160" y="60" width="80" height="160" rx="40" fill="url(#glassBody)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
            {/* Luminous Inner Core */}
            <rect x="194" y="90" width="12" height="100" rx="6" fill="#FFF4DE" filter="drop-shadow(0 0 12px #FFCA80)" />
          </svg>
          <div className="absolute bottom-4 left-4 text-[9px] tracking-[0.2em] text-neutral-400 font-mono">
            3000K LUMINESCENCE · CRI 98
          </div>
        </div>
      );

    case 'book':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#ECE8DF] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#F5F2EB] to-[#DDD7CA]" />
          <svg viewBox="0 0 400 300" className="w-full h-full max-w-[90%] drop-shadow-xl">
            {/* Monograph open spread */}
            <polygon points="50,220 195,240 195,50 50,40" fill="#F8F6F0" stroke="#D3CCC0" strokeWidth="1" />
            <polygon points="195,240 350,215 350,38 195,50" fill="#EFECE3" stroke="#D3CCC0" strokeWidth="1" />
            {/* Center Book Spine Stitching */}
            <line x1="195" y1="50" x2="195" y2="240" stroke="#4A4742" strokeWidth="2" strokeDasharray="3 4" />
            {/* Debossed typography & minimalist grid on page */}
            <line x1="80" y1="80" x2="160" y2="80" stroke="#7A766F" strokeWidth="2" />
            <rect x="80" y="100" width="90" height="90" fill="#E6E0D2" />
            <line x1="80" y1="205" x2="120" y2="205" stroke="#9A958C" strokeWidth="1.5" />
            <line x1="230" y1="80" x2="310" y2="80" stroke="#9A958C" strokeWidth="1" strokeDasharray="2 3" />
            <rect x="230" y="100" width="85" height="4" fill="#6A665E" />
            <rect x="230" y="112" width="70" height="4" fill="#6A665E" />
            <rect x="230" y="124" width="80" height="4" fill="#6A665E" />
            <rect x="230" y="136" width="60" height="4" fill="#6A665E" />
          </svg>
          <div className="absolute top-4 right-4 text-[9px] tracking-[0.2em] text-neutral-400 font-mono">
            SWISS BINDING · 240×320MM
          </div>
        </div>
      );

    case 'monolith':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#181818] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#222222] via-[#161616] to-[#0D0D0D]" />
          <svg viewBox="0 0 400 300" className="w-full h-full max-w-[85%]">
            {/* Monolithic cast iron pillar */}
            <polygon points="140,260 260,260 270,30 130,30" fill="#2E2E2E" />
            {/* Chiseled side facet */}
            <polygon points="260,260 280,250 290,20 270,30" fill="#1C1C1C" />
            {/* Acoustic Slit 432Hz */}
            <line x1="200" y1="50" x2="200" y2="240" stroke="#000000" strokeWidth="3" />
            <line x1="201" y1="50" x2="201" y2="240" stroke="#484848" strokeWidth="0.8" />
            {/* Floor cast shadow */}
            <polygon points="120,260 360,285 240,260" fill="rgba(0,0,0,0.7)" />
          </svg>
          <div className="absolute bottom-4 left-4 text-[9px] tracking-[0.2em] text-neutral-500 font-mono">
            432 HZ RESONATOR · 3200 KG
          </div>
        </div>
      );

    case 'tactile':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#E7E4DC] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#D6D2C7] to-[#F1EEE7]" />
          <svg viewBox="0 0 400 300" className="w-full h-full max-w-[85%]">
            <defs>
              <linearGradient id="silverVessel" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FAF8F5" />
                <stop offset="50%" stopColor="#D9D5CC" />
                <stop offset="100%" stopColor="#BFB9AC" />
              </linearGradient>
            </defs>
            {/* Ebony wooden plinth */}
            <rect x="80" y="240" width="240" height="14" rx="2" fill="#1C1B19" />
            {/* Hand-hammered teapot form */}
            <ellipse cx="200" cy="180" rx="60" ry="45" fill="url(#silverVessel)" stroke="#A0998B" strokeWidth="1" />
            {/* Spout */}
            <path d="M 145 170 C 120 160 110 145 105 130 C 112 135 125 150 145 160 Z" fill="#D2CDC0" />
            {/* Ebony wooden handle */}
            <path d="M 245 150 C 275 140 285 190 250 205" fill="none" stroke="#1D1A17" strokeWidth="7" strokeLinecap="round" />
            {/* Lid */}
            <ellipse cx="200" cy="140" rx="30" ry="8" fill="#F0EDE6" />
            <circle cx="200" cy="132" r="5" fill="#1D1A17" />
          </svg>
          <div className="absolute top-4 left-4 text-[9px] tracking-[0.2em] text-neutral-400 font-mono">
            925 STERLING SILVER · 100K DIMPLES
          </div>
        </div>
      );

    case 'blueprint':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#1E2024] flex items-center justify-center p-6 ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0f_1px,transparent_1px)] [background-size:16px_16px]" />
          <svg viewBox="0 0 300 300" className="w-full h-full">
            <rect x="50" y="50" width="200" height="200" fill="none" stroke="#60A5FA" strokeWidth="1.2" strokeDasharray="4 4" />
            <circle cx="150" cy="150" r="80" fill="none" stroke="#93C5FD" strokeWidth="1.5" />
            <line x1="50" y1="150" x2="250" y2="150" stroke="#3B82F6" strokeWidth="0.8" />
            <line x1="150" y1="50" x2="150" y2="250" stroke="#3B82F6" strokeWidth="0.8" />
            <text x="60" y="70" fill="#93C5FD" fontSize="8" fontFamily="monospace">R=720.00MM</text>
            <text x="60" y="85" fill="#93C5FD" fontSize="8" fontFamily="monospace">TOLERANCE ±0.05</text>
          </svg>
        </div>
      );

    case 'material':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#2D2A26] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(#47433c_1px,transparent_1px)] [background-size:8px_8px]" />
          <div className="w-3/4 h-3/4 rounded-full border border-white/20 bg-gradient-to-tr from-[#1B1917] via-[#44403C] to-[#78716C] shadow-2xl flex items-center justify-center">
            <span className="text-[10px] tracking-[0.3em] font-mono text-stone-300">MACRO GRAIN</span>
          </div>
        </div>
      );

    case 'light':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#111111] flex items-center justify-center ${className}`}>
          <div className="w-full h-full bg-gradient-to-tr from-amber-500/20 via-neutral-900 to-transparent flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-r from-amber-200/40 via-orange-100/10 to-transparent blur-2xl" />
            <div className="w-px h-32 bg-gradient-to-b from-transparent via-amber-100 to-transparent" />
          </div>
        </div>
      );

    case 'detail':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#E2DFD8] flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 200 200" className="w-3/4 h-3/4">
            <rect x="30" y="80" width="140" height="2" fill="#1C1917" />
            <rect x="30" y="90" width="140" height="2" fill="#1C1917" />
            <text x="70" y="87" fill="#78716C" fontSize="6" fontFamily="monospace">GAP: 0.80MM</text>
            <polygon points="98,82 102,82 100,85" fill="#1C1917" />
            <polygon points="98,88 102,88 100,85" fill="#1C1917" />
          </svg>
        </div>
      );

    case 'installation':
      return (
        <div className={`relative w-full h-full overflow-hidden bg-[#ECE9E2] flex items-center justify-center ${className}`}>
          <div className="w-4/5 h-4/5 border border-black/15 bg-white/80 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between text-[8px] font-mono text-neutral-400">
              <span>GALLERY SPACE #02</span>
              <span>8.0M HEIGHT</span>
            </div>
            <div className="flex justify-around items-end h-24">
              <div className="w-6 h-12 bg-neutral-900" />
              <div className="w-6 h-12 bg-neutral-900" />
              <div className="w-6 h-12 bg-neutral-900" />
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className={`relative w-full h-full bg-[#E5E3DE] flex items-center justify-center ${className}`}>
          <span className="text-xs font-mono tracking-widest text-neutral-500">PER-SONA EXHIBIT</span>
        </div>
      );
  }
};
