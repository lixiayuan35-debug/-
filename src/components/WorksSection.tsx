import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import { PROJECTS_DATA } from '../data/portfolioData';
import { ArtworkVisual } from './ArtworkVisual';
import { getStoredImage, getProjectDisplayImage } from '../utils/imageStore';
import { ArrowUpRight, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';

interface WorksSectionProps {
  onSelectProject: (project: Project) => void;
}

export const WorksSection: React.FC<WorksSectionProps> = ({ onSelectProject }) => {
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [imagesVersion, setImagesVersion] = useState<number>(0);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  // Listen for image updates across the app to force reactive re-render
  useEffect(() => {
    const handleImageUpdate = () => setImagesVersion((v) => v + 1);
    window.addEventListener('portfolio_custom_images_updated', handleImageUpdate);
    return () => window.removeEventListener('portfolio_custom_images_updated', handleImageUpdate);
  }, []);

  const total = PROJECTS_DATA.length;
  const angleStep = 42; // degrees between items
  const dragDistanceRef = useRef<number>(0);

  // Wheel & Touch swipe handling: non-passive listener prevents outer page from scrolling
  useEffect(() => {
    const container = carouselContainerRef.current;
    if (!container) return;

    // 1. Non-passive wheel listener: guarantees outer page will NOT scroll
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 1) return;

      const angleDelta = delta > 0 ? -10 : 10;
      setRotationAngle((prev) => {
        const nextAngle = prev + angleDelta;
        const normalized = ((-nextAngle / angleStep) % total + total) % total;
        setActiveIndex(Math.round(normalized) % total);
        return nextAngle;
      });
    };

    // 2. Touch listeners: prevents outer page vertical/horizontal scrolling on swipe
    let touchStartY = 0;
    let touchStartX = 0;
    let isTouching = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isTouching = true;
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        dragDistanceRef.current = 0;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouching || e.touches.length !== 1) return;
      // Prevent outside page scroll
      e.preventDefault();
      e.stopPropagation();

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = currentY - touchStartY;
      const diffX = currentX - touchStartX;
      const diff = Math.abs(diffY) > Math.abs(diffX) ? diffY : diffX;

      dragDistanceRef.current += Math.abs(diff);

      if (Math.abs(diff) > 2) {
        const step = diff * 0.45;
        setRotationAngle((prev) => {
          const nextAngle = prev + step;
          const normalized = ((-nextAngle / angleStep) % total + total) % total;
          setActiveIndex(Math.round(normalized) % total);
          return nextAngle;
        });
        touchStartY = currentY;
        touchStartX = currentX;
      }
    };

    const onTouchEnd = () => {
      isTouching = false;
    };

    // 3. Pointer drag support (mouse slide/drag)
    let isDragging = false;
    let dragStartY = 0;
    let dragStartX = 0;

    const onPointerDown = (e: PointerEvent) => {
      // Don't drag if clicking buttons
      const target = e.target as HTMLElement;
      if (target.closest('button')) return;
      isDragging = true;
      dragStartY = e.clientY;
      dragStartX = e.clientX;
      dragDistanceRef.current = 0;
      try {
        container.setPointerCapture?.(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      e.stopPropagation();

      const diffY = e.clientY - dragStartY;
      const diffX = e.clientX - dragStartX;
      const diff = Math.abs(diffY) > Math.abs(diffX) ? diffY : diffX;

      dragDistanceRef.current += Math.abs(diff);

      if (Math.abs(diff) > 1.5) {
        const step = diff * 0.45;
        setRotationAngle((prev) => {
          const nextAngle = prev + step;
          const normalized = ((-nextAngle / angleStep) % total + total) % total;
          setActiveIndex(Math.round(normalized) % total);
          return nextAngle;
        });
        dragStartY = e.clientY;
        dragStartX = e.clientX;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        try {
          container.releasePointerCapture?.(e.pointerId);
        } catch {}
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
    };
  }, [total, angleStep]);

  // Rotate to specific project
  const rotateToIndex = (index: number) => {
    setActiveIndex(index);
    setRotationAngle(-index * angleStep);
  };

  const nextProject = () => {
    const next = (activeIndex + 1) % total;
    rotateToIndex(next);
  };

  const prevProject = () => {
    const prev = (activeIndex - 1 + total) % total;
    rotateToIndex(prev);
  };

  const activeProject = PROJECTS_DATA[activeIndex] || PROJECTS_DATA[0];

  // Carousel geometry constants
  // Semi-circle orbit parameters
  const radius = 290; // px
  const centerX = 40;  // px offset to give a dramatic half-circle arc entering from left
  const centerY = 330; // px center height

  return (
    <section
      id="works"
      className="relative w-full min-h-screen py-24 px-6 bg-[#F5F4F0] border-t border-neutral-300/70 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 mb-12 border-b border-black/10">
          <div>
            <div className="text-[11px] font-mono tracking-[0.25em] text-neutral-500 uppercase mb-2">
              [ 03 / WORKS DIRECTORY · CIRCULAR CAROUSEL ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif-display font-normal tracking-tight text-neutral-900">
              作品目录 · 摩天轮圆周长卷
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
            <span>滚轮旋转 / DRAG WHEEL</span>
            <span>·</span>
            <span>{String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Split Layout: Left Circular Carousel (Ferris Wheel), Right Text & Intro with Gradient Scrim */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[660px]">
          {/* Left Column: Semi-Circular Carousel Showcase Area */}
          <div
            ref={carouselContainerRef}
            className="lg:col-span-7 relative h-[640px] sm:h-[680px] w-full overflow-hidden border border-neutral-300/80 bg-[#EFECE6]/50 select-none shadow-inner touch-none overscroll-contain cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
            title="在此区域滑动或滚动鼠标滚轮以旋转作品摩天轮（外层页面不会滚动）"
          >
            {/* Background Circular Orbit Guide Rails */}
            <div
              className="absolute rounded-full border border-dashed border-neutral-300/80 pointer-events-none"
              style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                left: `${centerX - radius}px`,
                top: `${centerY - radius}px`,
              }}
            />
            <div
              className="absolute rounded-full border border-neutral-200 pointer-events-none"
              style={{
                width: `${radius * 2 + 80}px`,
                height: `${radius * 2 + 80}px`,
                left: `${centerX - (radius + 40)}px`,
                top: `${centerY - (radius + 40)}px`,
              }}
            />

            {/* Orbit Center Hub Marker */}
            <div
              className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-neutral-700 bg-white pointer-events-none z-10"
              style={{
                left: `${centerX}px`,
                top: `${centerY}px`,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 m-auto mt-0.5" />
            </div>

            {/* Carousel Interactive Controls (Top Right of container) */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1.5 border border-neutral-300 shadow-sm text-xs font-mono">
              <button
                onClick={prevProject}
                className="p-1 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
                title="上一件作品"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-neutral-800">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              <button
                onClick={nextProject}
                className="p-1 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
                title="下一件作品"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => rotateToIndex(0)}
                className="p-1 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer ml-1 text-neutral-500"
                title="重置位置"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hint overlay on bottom left */}
            <div className="absolute bottom-4 left-4 z-20 text-[10px] font-mono tracking-widest text-neutral-500 flex items-center gap-2 bg-[#F5F4F0]/80 px-2 py-1 border border-neutral-200 pointer-events-none select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 animate-pulse" />
              <span>滑动 / 滚轮旋转 · 页面锁定 (ORBIT WHEEL)</span>
            </div>

            {/* Cards Orbiting on the Circle */}
            {PROJECTS_DATA.map((project, idx) => {
              // Calculate angular position in radians
              // We position cards around the semi-circle facing right
              const angleDeg = rotationAngle + idx * angleStep - 20;
              const angleRad = (angleDeg * Math.PI) / 180;

              // Orbit Position (x, y)
              const cardX = centerX + radius * Math.cos(angleRad);
              const cardY = centerY + radius * Math.sin(angleRad);

              // Calculate distance to active focal view (angle ~ 0)
              const diffAngle = Math.abs(((angleDeg % 360) + 360) % 360);
              const normalizedDiff = diffAngle > 180 ? 360 - diffAngle : diffAngle;
              const isCurrent = idx === activeIndex;

              // Scale & opacity based on angle distance
              const scale = Math.max(0.72, 1 - normalizedDiff * 0.003);
              const opacity = Math.max(0.25, 1 - normalizedDiff * 0.009);

              return (
                <div
                  key={project.id}
                  onClick={() => {
                    if (dragDistanceRef.current > 8) return;
                    rotateToIndex(idx);
                    onSelectProject(project);
                  }}
                  className="absolute cursor-pointer transition-all duration-500 ease-out z-20 group"
                  style={{
                    // Position along circle
                    left: `${cardX}px`,
                    top: `${cardY}px`,
                    // CRITICAL REQUIREMENT: Card ALWAYS remains upright facing forward without self-rotation!
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    opacity: opacity,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* The Work Card Thumbnail */}
                    <div
                      className={`relative w-28 h-36 sm:w-36 sm:h-44 bg-white overflow-hidden transition-all duration-300 shadow-md ${
                        isCurrent
                          ? 'ring-2 ring-neutral-900 shadow-xl'
                          : 'ring-1 ring-black/10 group-hover:ring-neutral-700'
                      }`}
                    >
                      {/* Visual Artwork Inside Card */}
                      <div className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500">
                        <ArtworkVisual
                          key={`carousel-visual-${project.id}-${imagesVersion}`}
                          type={project.coverVisual}
                          imageUrl={getProjectDisplayImage(
                            project.id,
                            (project.staggeredCards || []).map((c) => c.id)
                          )}
                          clearBaseVisual={true}
                        />
                      </div>

                      {/* Sequence Badge */}
                      <div className="absolute top-1.5 left-1.5 bg-neutral-950 text-white text-[9px] font-mono px-1 py-0.2 z-10">
                        0{idx + 1}
                      </div>

                      {/* Quick Inspect Hover Icon */}
                      <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-mono tracking-widest text-white px-2 py-1 bg-black/60">
                          PREVIEW
                        </span>
                      </div>
                    </div>

                    {/* Connecting Line and Name on the RIGHT of the card */}
                    <div className="flex items-center gap-2">
                      {/* Connecting Hairline */}
                      <div
                        className={`h-px transition-all duration-300 ${
                          isCurrent
                            ? 'w-8 sm:w-12 bg-neutral-950'
                            : 'w-4 sm:w-6 bg-neutral-300 group-hover:w-8 group-hover:bg-neutral-700'
                        }`}
                      />

                      {/* Project Name and Details on the Right */}
                      <div className="whitespace-nowrap">
                        <p
                          className={`font-serif-display font-medium leading-none transition-colors duration-200 ${
                            isCurrent
                              ? 'text-base sm:text-lg text-neutral-950'
                              : 'text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-900'
                          }`}
                        >
                          {project.title}
                        </p>
                        <p className="text-[10px] font-mono tracking-wider text-neutral-400 mt-1 uppercase">
                          {project.year} · {project.discipline.split('·')[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Works Text Introduction with Gradient Background Scrim */}
          <div className="lg:col-span-5 relative p-6 sm:p-10 rounded-none overflow-hidden">
            {/* Gradient Background Scrim for Optimal Legibility */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/85 to-[#F5F4F0]/80 backdrop-blur-md border border-neutral-200 shadow-sm -z-10" />

            {/* Content for Currently Focused Project */}
            <div className="space-y-6">
              {/* Top Index & Year */}
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <span className="text-xs font-mono tracking-[0.2em] text-neutral-500 uppercase">
                  PROJECT {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
                <span className="text-xs font-mono font-medium text-neutral-900">
                  {activeProject.year}
                </span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="text-3xl sm:text-4xl font-serif-display font-normal text-neutral-950 tracking-tight leading-tight">
                  {activeProject.title}
                </h3>
                <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase mt-1">
                  {activeProject.englishTitle}
                </p>
                {activeProject.tagline &&
                  activeProject.id !== 'pavilion-o' &&
                  activeProject.id !== 'monolith' && (
                    <p className="text-xs font-serif-display italic text-neutral-700 mt-3 leading-relaxed">
                      "{activeProject.tagline}"
                    </p>
                  )}
              </div>

              {/* Visual Preview Snapshot with Natural Aspect Ratio */}
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-56 bg-neutral-200 border border-neutral-300 overflow-hidden shadow-xs">
                <ArtworkVisual
                  key={`preview-visual-${activeProject.id}-${imagesVersion}`}
                  type={activeProject.coverVisual}
                  imageUrl={getProjectDisplayImage(
                    activeProject.id,
                    (activeProject.staggeredCards || []).map((c) => c.id)
                  )}
                  className="w-full h-full object-cover"
                  clearBaseVisual={true}
                />
              </div>

              {/* Chinese Introduction & Design Concept */}
              {(activeProject.chineseIntro || activeProject.designConcept) &&
                activeProject.id !== 'pavilion-o' &&
                activeProject.id !== 'monolith' && (
                  <div className="space-y-3 text-xs sm:text-sm text-neutral-700 font-sans-body leading-relaxed border-t border-black/5 pt-4">
                    {activeProject.chineseIntro && <p>{activeProject.chineseIntro}</p>}
                    {activeProject.designConcept && (
                      <p className="text-xs text-neutral-500 leading-normal">
                        <span className="font-semibold text-neutral-800">概念秩序：</span>
                        {activeProject.designConcept}
                      </p>
                    )}
                  </div>
                )}

              {/* Key Specs */}
              <div className="grid grid-cols-2 gap-3 border-t border-black/5 pt-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">创作主体 CREATIVE ENTITY</span>
                  <span className="text-neutral-800 font-medium">{activeProject.client}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">专业领域 DISCIPLINE</span>
                  <span className="text-neutral-800 font-medium">{activeProject.discipline}</span>
                </div>
              </div>

              {/* Primary Call-to-Action: Open Detail View */}
              <div className="pt-2">
                <button
                  onClick={() => onSelectProject(activeProject)}
                  className="w-full group flex items-center justify-between px-5 py-3.5 bg-neutral-950 text-white hover:bg-neutral-800 transition-all duration-300 font-mono text-xs uppercase tracking-widest cursor-pointer shadow-md active:scale-[0.99]"
                >
                  <span>查看作品详细档案 · VIEW DETAILS</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
