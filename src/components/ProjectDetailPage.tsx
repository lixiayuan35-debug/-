import React, { useRef, useState, useEffect } from 'react';
import { Project, StaggeredCard } from '../types';
import { PROJECTS_DATA } from '../data/portfolioData';
import { ArtworkVisual } from './ArtworkVisual';
import { ImageReplaceButton } from './ImageReplaceButton';
import { VideoReplaceButton } from './VideoReplaceButton';
import { VideoBlock } from './VideoBlock';
import { CardRatioModal } from './CardRatioModal';
import { AddCardModal } from './AddCardModal';
import { getStoredImage, setStoredImage, removeStoredImage, getStoredCardRatio, setStoredCardRatio } from '../utils/imageStore';
import { hasStoredVideo, removeStoredVideo } from '../utils/videoStore';
import { getCssAspectRatio, getRatioLabel, parseNumericRatio, getSmartRatioForDimensions } from '../utils/ratioUtils';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Eye, Trash2, Plus, Film, Video, Ratio, Maximize, Minimize, Lock, Unlock } from 'lucide-react';

interface ProjectDetailPageProps {
  project: Project;
  onBack: () => void;
  onSwitchProject: (project: Project) => void;
}

/**
 * Lightweight helper to save card layout & configuration without storing raw base64 dataUrls
 * Keeps the storage under 2KB, 100% immune to QuotaExceededError!
 */
function saveCardsLayout(projectId: string, cardsList: StaggeredCard[]) {
  if (typeof window === 'undefined') return;
  try {
    const slim = cardsList.map((c) => {
      const { imageUrl, ...rest } = c;
      return rest;
    });
    localStorage.setItem(`project_cards_${projectId}`, JSON.stringify(slim));
  } catch (err) {
    console.warn('Failed to save project cards layout:', err);
  }
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  project,
  onBack,
  onSwitchProject,
}) => {
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [mediaVersion, setMediaVersion] = useState<number>(0);
  const [cards, setCards] = useState(project.staggeredCards);
  const [isLocked, setIsLocked] = useState<boolean>(true);

  const [editingRatioCard, setEditingRatioCard] = useState<StaggeredCard | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addModalType, setAddModalType] = useState<'image' | 'video'>('image');

  useEffect(() => {
    try {
      const deletedKey = `project_deleted_cards_${project.id}`;
      const deletedIds = new Set<string>(JSON.parse(localStorage.getItem(deletedKey) || '[]'));
      if (project.id === 'monolith') {
        deletedIds.add('zhixue-2');
      }
      if (project.id === 'lotus-void') {
        deletedIds.add('lotus-1');
        deletedIds.add('lotus-2');
      }

      const saved = localStorage.getItem(`project_cards_${project.id}`);
      if (saved) {
        const parsed: StaggeredCard[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaultMap = new Map((project.staggeredCards || []).map((c) => [c.id, c]));

          // Allow ALL user-preserved cards (both default cards and any custom added cards)
          const filtered = parsed.filter(
            (c) =>
              !deletedIds.has(c.id) &&
              (defaultMap.has(c.id) || c.id.startsWith('custom-') || c.id.includes('-card-') || c.id.includes('-video-'))
          );

          const updatedParsed = filtered.map((c) => {
            const def = defaultMap.get(c.id);

            // Resurrect image from all persistent sources
            const storedImg =
              getStoredImage(`card-${c.id}`) ||
              c.imageUrl ||
              (typeof window !== 'undefined'
                ? localStorage.getItem(`portfolio_img_card-${c.id}`) || localStorage.getItem(`card_img_${c.id}`)
                : null);

            // If stored image found, ensure it is synchronized into memory cache as well
            if (storedImg && typeof window !== 'undefined') {
              try {
                setStoredImage(`card-${c.id}`, storedImg);
              } catch {
                // ignore
              }
            }

            // Restore user-customized ratio & sizing from dedicated per-card ratio store
            const storedRatio = getStoredCardRatio(c.id);
            const safeAspect = storedRatio?.aspectRatio || c.aspectRatio || def?.aspectRatio || 'aspect-[4/3]';
            const safeRatio = storedRatio?.customRatio || c.customRatio || def?.customRatio;
            const safeWidth = storedRatio?.customWidth ?? c.customWidth;
            const safeFitMode = storedRatio?.fitMode || c.fitMode || 'cover';
            const safeYOffset = storedRatio?.yOffsetClass || c.yOffsetClass || def?.yOffsetClass || 'mt-0';

            if (def) {
              return {
                ...def,
                ...c,
                imageUrl: storedImg || c.imageUrl || def.imageUrl,
                mediaType: c.mediaType ?? def.mediaType,
                videoUrl: c.videoUrl ?? def.videoUrl,
                aspectRatio: safeAspect,
                customRatio: safeRatio,
                customWidth: safeWidth,
                yOffsetClass: safeYOffset,
                fitMode: safeFitMode,
              };
            }
            return {
              ...c,
              imageUrl: storedImg || c.imageUrl,
              aspectRatio: safeAspect,
              customRatio: safeRatio,
              customWidth: safeWidth,
              yOffsetClass: safeYOffset,
              fitMode: safeFitMode,
            };
          });

          const existingIds = new Set(updatedParsed.map((c) => c.id));
          const newDefaultCards = (project.staggeredCards || []).filter(
            (c) =>
              !existingIds.has(c.id) &&
              !deletedIds.has(c.id) &&
              c.id !== 'zhixue-2' &&
              c.id !== 'lotus-1' &&
              c.id !== 'lotus-2'
          );
          const merged = [...updatedParsed, ...newDefaultCards];
          setCards(merged);
          saveCardsLayout(project.id, merged);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Default cards fallback with image recovery and ratio recovery
    const hydratedDefaults = (project.staggeredCards || []).map((c) => {
      const storedRatio = getStoredCardRatio(c.id);
      const safeAspect = storedRatio?.aspectRatio || c.aspectRatio || 'aspect-[4/3]';
      const safeRatio = storedRatio?.customRatio || c.customRatio;
      const safeWidth = storedRatio?.customWidth ?? c.customWidth;
      const safeFitMode = storedRatio?.fitMode || c.fitMode || 'cover';
      const safeYOffset = storedRatio?.yOffsetClass || c.yOffsetClass || 'mt-0';

      const storedImg =
        getStoredImage(`card-${c.id}`) ||
        c.imageUrl ||
        (typeof window !== 'undefined'
          ? localStorage.getItem(`portfolio_img_card-${c.id}`) || localStorage.getItem(`card_img_${c.id}`)
          : null);

      return {
        ...c,
        aspectRatio: safeAspect,
        customRatio: safeRatio,
        customWidth: safeWidth,
        fitMode: safeFitMode,
        yOffsetClass: safeYOffset,
        imageUrl: storedImg || c.imageUrl,
      };
    });
    setCards(hydratedDefaults);
    saveCardsLayout(project.id, hydratedDefaults);
  }, [project.id, project.staggeredCards]);

  const handleUpdateCard = (cardId: string, updatedFields: Partial<StaggeredCard>) => {
    // If layout/ratio fields updated, save to card_ratio_${cardId}
    if (
      updatedFields.aspectRatio ||
      updatedFields.customRatio ||
      updatedFields.customWidth !== undefined ||
      updatedFields.fitMode ||
      updatedFields.yOffsetClass
    ) {
      const existing = getStoredCardRatio(cardId) || {};
      setStoredCardRatio(cardId, {
        aspectRatio: updatedFields.aspectRatio ?? existing.aspectRatio,
        customRatio: updatedFields.customRatio ?? existing.customRatio,
        customWidth: updatedFields.customWidth ?? existing.customWidth,
        fitMode: updatedFields.fitMode ?? existing.fitMode,
        yOffsetClass: updatedFields.yOffsetClass ?? existing.yOffsetClass,
      });
    }

    setCards((prev) => {
      const updated = prev.map((c) => {
        if (c.id === cardId) {
          return { ...c, ...updatedFields };
        }
        return c;
      });
      saveCardsLayout(project.id, updated);
      return updated;
    });
  };

  const handleImageUploadedForCard = (
    cardId: string,
    dataUrl: string,
    _naturalWidth?: number,
    _naturalHeight?: number
  ) => {
    // 1. Guaranteed save to multi-tier image store (memory, IndexedDB, localStorage)
    setStoredImage(`card-${cardId}`, dataUrl);

    // 2. Update reactive card state with the new image, strictly preserving existing card ratio
    setCards((prev) => {
      const updated = prev.map((c) => {
        if (c.id === cardId) {
          return { ...c, imageUrl: dataUrl };
        }
        return c;
      });
      saveCardsLayout(project.id, updated);
      return updated;
    });
  };

  const handleToggleFitMode = (cardId: string) => {
    setCards((prev) => {
      const updated = prev.map((c) => {
        if (c.id === cardId) {
          const nextFit = c.fitMode === 'contain' ? 'cover' : 'contain';
          const existing = getStoredCardRatio(cardId) || {};
          setStoredCardRatio(cardId, { ...existing, fitMode: nextFit as 'cover' | 'contain' });
          return { ...c, fitMode: nextFit as 'cover' | 'contain' };
        }
        return c;
      });
      saveCardsLayout(project.id, updated);
      return updated;
    });
  };

  const handleInsertCard = (newCard: StaggeredCard) => {
    setCards((prev) => {
      const updated = [...prev, newCard];
      saveCardsLayout(project.id, updated);
      return updated;
    });
  };

  const handleDeleteCard = (cardId: string) => {
    try {
      const deletedKey = `project_deleted_cards_${project.id}`;
      const prevDeleted: string[] = JSON.parse(localStorage.getItem(deletedKey) || '[]');
      if (!prevDeleted.includes(cardId)) {
        localStorage.setItem(deletedKey, JSON.stringify([...prevDeleted, cardId]));
      }
    } catch {
      // ignore
    }
    setCards((prev) => {
      const updated = prev.filter((c) => c.id !== cardId);
      try {
        localStorage.setItem(`project_cards_${project.id}`, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    removeStoredImage(`card-${cardId}`);
    removeStoredVideo(`card-video-${cardId}`);
  };

  useEffect(() => {
    const handleUpdate = () => setMediaVersion((v) => v + 1);
    window.addEventListener('portfolio_custom_images_updated', handleUpdate);
    window.addEventListener('portfolio_custom_video_updated', handleUpdate);
    return () => {
      window.removeEventListener('portfolio_custom_images_updated', handleUpdate);
      window.removeEventListener('portfolio_custom_video_updated', handleUpdate);
    };
  }, []);

  // Lock body scroll when ProjectDetailPage is open so outer page never scrolls
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Wheel horizontal scrolling: non-passive listener to strictly prevent outer page scrolling
  useEffect(() => {
    const el = horizontalScrollRef.current;
    if (!el) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      el.scrollLeft += delta * 1.5;
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    el.addEventListener('scroll', updateScrollProgress);
    return () => {
      el.removeEventListener('wheel', handleNativeWheel);
      el.removeEventListener('scroll', updateScrollProgress);
    };
  }, []);

  // Track horizontal scroll progress
  const updateScrollProgress = () => {
    if (horizontalScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = horizontalScrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress((scrollLeft / maxScroll) * 100);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
      if (e.key === 'ArrowRight' && horizontalScrollRef.current) {
        horizontalScrollRef.current.scrollBy({ left: 350, behavior: 'smooth' });
      }
      if (e.key === 'ArrowLeft' && horizontalScrollRef.current) {
        horizontalScrollRef.current.scrollBy({ left: -350, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  // Find index of current project to switch next/prev
  const currentIndex = PROJECTS_DATA.findIndex((p) => p.id === project.id);
  const prevProject =
    PROJECTS_DATA[(currentIndex - 1 + PROJECTS_DATA.length) % PROJECTS_DATA.length];
  const nextProject = PROJECTS_DATA[(currentIndex + 1) % PROJECTS_DATA.length];

  const scrollLeftManual = () => {
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollBy({ left: -450, behavior: 'smooth' });
    }
  };

  const scrollRightManual = () => {
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollBy({ left: 450, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F4F0] text-neutral-900 flex flex-col overflow-hidden select-none animate-in fade-in duration-500">
      {/* Top Navigation Bar */}
      <header className="h-16 px-6 sm:px-10 border-b border-black/10 flex items-center justify-between bg-[#F5F4F0]/90 backdrop-blur-md z-30 shrink-0">
        {/* Left Back Button */}
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-800 hover:text-neutral-950 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>返回全部作品 · RETURN TO PORTFOLIO</span>
        </button>

        {/* Center Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono tracking-widest text-neutral-500 uppercase">
          <span>EXHIBIT ARCHIVE</span>
          <span>/</span>
          <span className="text-neutral-900 font-medium">{project.title}</span>
        </div>

        {/* Right Switchers and Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Media & Layout Lock Status Indicator / Toggle */}
          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border transition-all cursor-pointer ${
              isLocked
                ? 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800'
                : 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
            }`}
            title={isLocked ? '当前所有图片视频与排版已全部锁定（点击可解锁编辑）' : '当前处于编辑修改状态（点击可重新锁定）'}
          >
            {isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="tracking-wider">媒体全部锁定</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-amber-600" />
                <span className="tracking-wider">编辑模式</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1 border border-neutral-300 text-xs font-mono">
            <button
              onClick={() => onSwitchProject(prevProject)}
              className="px-2.5 py-1.5 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
              title={`上一个项目: ${prevProject.title}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-neutral-500">
              {String(currentIndex + 1).padStart(2, '0')} / {String(PROJECTS_DATA.length).padStart(2, '0')}
            </span>
            <button
              onClick={() => onSwitchProject(nextProject)}
              className="px-2.5 py-1.5 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
              title={`下一个项目: ${nextProject.title}`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Left Chinese Info Sidebar + Right Horizontal Staggered Gallery */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Sidebar: Chinese Project Introduction and Fundamental Information */}
        <aside className="w-full lg:w-[420px] xl:w-[460px] border-b lg:border-b-0 lg:border-r border-black/10 p-6 sm:p-10 overflow-y-auto shrink-0 bg-[#F5F4F0] z-20 space-y-8">
          {/* Main Title & Kicker */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 uppercase">
              {project.location?.includes(project.year)
                ? project.location
                : `${project.year} · ${project.location}`}
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif-display font-medium text-neutral-950 tracking-tight leading-tight">
              {project.title}
            </h1>
            <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase">
              {project.englishTitle}
            </p>
            {project.tagline &&
              project.id !== 'pavilion-o' &&
              project.id !== 'monolith' && (
                <p className="text-xs sm:text-sm font-serif-display italic text-neutral-700 leading-relaxed pt-2">
                  "{project.tagline}"
                </p>
              )}

          </div>

          {/* Chinese Project Introduction (Omitted for 07 and 08) */}
          {(project.chineseIntro || project.designConcept) &&
            project.id !== 'pavilion-o' &&
            project.id !== 'monolith' && (
              <div className="space-y-4 text-xs sm:text-sm font-sans-body text-neutral-700 leading-relaxed border-t border-black/10 pt-6">
                {project.chineseIntro && (
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block mb-1">
                      项目背景与叙事 · CHINESE OVERVIEW
                    </span>
                    <p>{project.chineseIntro}</p>
                  </div>
                )}
                {project.designConcept && (
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block mb-1">
                      造构理念与材料哲学 · DESIGN CONCEPT
                    </span>
                    <p>{project.designConcept}</p>
                  </div>
                )}
              </div>
            )}

          {/* Fundamental Information (基本信息) */}
          <div className="border-t border-black/10 pt-6 space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block">
              档案基本信息 · ESSENTIAL METADATA
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-white border border-neutral-200">
                <span className="text-[10px] text-neutral-400 block">创作主体</span>
                <span className="text-neutral-800 font-medium">{project.client}</span>
              </div>
              <div className="p-2.5 bg-white border border-neutral-200">
                <span className="text-[10px] text-neutral-400 block">创作年份</span>
                <span className="text-neutral-800 font-medium">{project.year}</span>
              </div>
              <div className="p-2.5 bg-white border border-neutral-200">
                <span className="text-[10px] text-neutral-400 block">专业范畴</span>
                <span className="text-neutral-800 font-medium">{project.discipline}</span>
              </div>
              <div className="p-2.5 bg-white border border-neutral-200">
                <span className="text-[10px] text-neutral-400 block">担当角色</span>
                <span className="text-neutral-800 font-medium">{project.role}</span>
              </div>
            </div>
          </div>

          {/* Interaction Wheel Guide */}
          <div className="border-t border-black/10 pt-6 text-[10px] font-mono text-neutral-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neutral-800 animate-pulse" />
            <span>向右侧滚动鼠标滚轮以滑动漫游画廊</span>
          </div>
        </aside>

        {/* Right Gallery Section: 6 Highly Staggered Cards with Hover Parallax & Smooth Horizontal Wheel Scroll */}
        <div
          ref={horizontalScrollRef}
          className="flex-1 overflow-x-auto overflow-y-hidden overscroll-contain horizontal-scroll-container bg-[#EFECE6]/40 relative"
        >
          {/* Subtle background architectural grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#0000000a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* Highly Staggered Gallery Cards Track */}
          <div className="min-w-max h-full flex items-center px-12 sm:px-20 gap-12 sm:gap-16 py-12">
            {cards.map((card, idx) => {
              const isHovered = hoveredCardIndex === idx;
              const hasVideo = card.mediaType === 'video' || hasStoredVideo(`card-video-${card.id}`);

              if (hasVideo) {
                return (
                  <VideoBlock
                    key={card.id}
                    card={card}
                    index={idx}
                    isHovered={isHovered}
                    onMouseEnter={() => setHoveredCardIndex(idx)}
                    onMouseLeave={() => setHoveredCardIndex(null)}
                    onDelete={handleDeleteCard}
                    onUpdateCard={handleUpdateCard}
                    customWidth={idx === 2 || idx === 3 ? '500px' : '440px'}
                    isLocked={isLocked}
                  />
                );
              }

              const effectiveRatio = getCssAspectRatio(card.aspectRatio, card.customRatio);
              const ratioLabel = getRatioLabel(card.aspectRatio, card.customRatio);
              const numericRatio = parseNumericRatio(card.aspectRatio, card.customRatio);

              // Max gallery height is 450px so card never overflows screen vertically
              const maxGalleryHeight = 450;
              const dynamicWidthForRatio = numericRatio < 1
                ? Math.round(maxGalleryHeight * numericRatio)
                : numericRatio >= 2
                ? 540
                : numericRatio >= 1.6
                ? 480
                : numericRatio >= 1.2
                ? 420
                : 380;

              const cardWidth = card.customWidth
                ? Math.min(Math.max(220, card.customWidth), numericRatio < 1 ? Math.round(maxGalleryHeight * numericRatio * 1.05) : 580)
                : dynamicWidthForRatio;

              const resolvedCardImage =
                card.imageUrl ||
                getStoredImage(`card-${card.id}`) ||
                (typeof window !== 'undefined'
                  ? localStorage.getItem(`portfolio_img_card-${card.id}`) || localStorage.getItem(`card_img_${card.id}`)
                  : null);

              return (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCardIndex(idx)}
                  onMouseLeave={() => setHoveredCardIndex(null)}
                  className={`flex flex-col transition-transform duration-500 ease-out shrink-0 select-none ${card.yOffsetClass}`}
                  style={{
                    width: `${cardWidth}px`,
                    maxWidth: 'min(85vw, 580px)',
                  }}
                >
                  {/* Card Visual Container with Hover Parallax: Grayscale to Color + Scale-105 */}
                  <div className="relative group overflow-hidden border border-black/15 shadow-xl bg-white w-full">
                    {/* The Aspect Ratio Box */}
                    <div
                      className="w-full overflow-hidden bg-neutral-200 transition-all duration-300 flex items-center justify-center"
                      style={{
                        aspectRatio: effectiveRatio,
                      }}
                    >
                      <div
                        className={`w-full h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isHovered
                            ? 'grayscale-0 scale-105 contrast-100'
                            : 'grayscale contrast-[1.08] brightness-[0.98] scale-100'
                        }`}
                      >
                        <ArtworkVisual
                          key={`card-art-${card.id}-${mediaVersion}`}
                          type={card.visualType}
                          imageUrl={resolvedCardImage}
                          isHovered={isHovered}
                          clearBaseVisual={true}
                          fitMode={card.fitMode || 'cover'}
                        />
                      </div>
                    </div>

                    {/* Card Top Index Badge */}
                    <div className="absolute top-2 left-2 bg-neutral-900 text-white text-[9px] font-mono px-1.5 py-0.5 tracking-widest z-10">
                      0{idx + 1}
                    </div>

                    {/* Quick Replace & Delete & Ratio & Fit Mode Buttons - Only visible when unlocked */}
                    {!isLocked && (
                      <div className={`absolute top-2 right-2 flex items-center gap-1.5 transition-opacity z-20 ${
                        resolvedCardImage ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                      }`}>
                        {/* Fit Mode Toggle Button */}
                        {resolvedCardImage && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleToggleFitMode(card.id);
                            }}
                            title={card.fitMode === 'contain' ? '当前模式: 完整居中 (点击切换为裁剪填满)' : '当前模式: 裁剪填满 (点击切换为完整居中)'}
                            className="px-2 py-1 bg-neutral-900/90 text-white hover:bg-neutral-950 border border-neutral-700 backdrop-blur-xs transition-colors cursor-pointer text-[10px] font-mono flex items-center gap-1"
                          >
                            {card.fitMode === 'contain' ? (
                              <Minimize className="w-3 h-3 text-cyan-400" />
                            ) : (
                              <Maximize className="w-3 h-3 text-cyan-400" />
                            )}
                            <span>{card.fitMode === 'contain' ? '完整' : '填满'}</span>
                          </button>
                        )}

                        {/* Custom Ratio Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setEditingRatioCard(card);
                          }}
                          title={`自定义版块比例 (当前: ${ratioLabel})`}
                          className="px-2 py-1 bg-neutral-900/90 text-white hover:bg-neutral-950 border border-neutral-700 backdrop-blur-xs transition-colors cursor-pointer text-[10px] font-mono flex items-center gap-1"
                        >
                          <Ratio className="w-3 h-3 text-emerald-400" />
                          <span>{ratioLabel}</span>
                        </button>

                        <ImageReplaceButton
                          imageKey={`card-${card.id}`}
                          title={`更换《${card.title}》照片`}
                          size="icon"
                          variant="dark"
                          onImageUploaded={(dataUrl, w, h) => {
                            handleImageUploadedForCard(card.id, dataUrl, w, h);
                          }}
                        />
                        <VideoReplaceButton
                          videoKey={`card-video-${card.id}`}
                          title={`为此体块上传视频（将转为视频体块）`}
                          label="上传视频"
                          size="icon"
                          variant="dark"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteCard(card.id);
                          }}
                          title="删去此卡片"
                          className="p-1.5 bg-neutral-900/90 text-white hover:bg-red-600 border border-neutral-700 backdrop-blur-xs transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Subtle Micro Coordinate Indicator */}
                    <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-xs text-neutral-500 text-[8px] font-mono px-1.5 py-0.5 flex items-center gap-1">
                      <span>{ratioLabel}</span>
                      <span>·</span>
                      <span>FIG. {idx + 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* End of Gallery Callout: Next Project Preview */}
            <div className="flex flex-col justify-center items-start p-8 sm:p-12 w-[340px] border border-dashed border-neutral-300 bg-white/60 shrink-0 space-y-4">
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
                NEXT ARCHIVE
              </span>
              <h3 className="text-2xl font-serif-display font-medium text-neutral-900">
                {nextProject.title}
              </h3>
              <p className="text-xs text-neutral-500 font-sans-body">
                {nextProject.tagline}
              </p>
              <button
                onClick={() => onSwitchProject(nextProject)}
                className="group flex items-center gap-2 text-xs font-mono tracking-widest uppercase bg-neutral-950 text-white px-4 py-2.5 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <span>浏览下一作品</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Scroll Progress Bar & Manual Arrow Controllers */}
      <footer className="h-12 px-6 sm:px-10 border-t border-black/10 bg-[#F5F4F0] flex items-center justify-between z-30 shrink-0 text-xs font-mono">
        {/* Scroll Progress Track */}
        <div className="flex items-center gap-4 flex-1 max-w-xs">
          <span className="text-[10px] text-neutral-400">01</span>
          <div className="relative flex-1 h-0.5 bg-neutral-300 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-neutral-900 transition-all duration-150"
              style={{ width: `${Math.max(8, scrollProgress)}%` }}
            />
          </div>
          <span className="text-[10px] text-neutral-400">
            0{cards.length < 10 ? cards.length : cards.length}
          </span>
        </div>

        {/* Inertia & Wheel Instructions */}
        <div className="hidden sm:flex items-center gap-2 text-neutral-500 text-[10px]">
          <span>支持滚轮惯性滑动 (HORIZONTAL WHEEL ENABLED)</span>
        </div>

        {/* Manual Arrow Buttons for Accessibility */}
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeftManual}
            className="p-1.5 border border-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
            title="向左滑动"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={scrollRightManual}
            className="p-1.5 border border-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
            title="向右滑动"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>

      {/* Modals for Custom Ratio & Add Block */}
      {isAddModalOpen && (
        <AddCardModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          defaultMediaType={addModalType}
          projectId={project.id}
          currentCount={cards.length}
          onAddCard={handleInsertCard}
        />
      )}

      {editingRatioCard && (
        <CardRatioModal
          isOpen={Boolean(editingRatioCard)}
          onClose={() => setEditingRatioCard(null)}
          card={editingRatioCard}
          onUpdateCard={(updated) => handleUpdateCard(editingRatioCard.id, updated)}
        />
      )}
    </div>
  );
};
