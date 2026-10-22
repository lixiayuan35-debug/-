import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, X, Film, Video } from 'lucide-react';
import { StaggeredCard } from '../types';
import { useStoredVideo } from '../utils/videoStore';
import { toRootRelativePath } from '../utils/pathUtils';
import { analyzeVideoSource } from '../utils/videoUtils';
import { getCssAspectRatio, getRatioLabel, parseNumericRatio } from '../utils/ratioUtils';

interface VideoBlockProps {
  card: StaggeredCard;
  index: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDelete?: (id: string) => void;
  onUpdateCard?: (id: string, updated: Partial<StaggeredCard>) => void;
  customWidth?: string;
  isLocked?: boolean;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({
  card,
  index,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onDelete,
  onUpdateCard,
  customWidth,
  isLocked = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [controlsVisible, setControlsVisible] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const { videoUrl } = useStoredVideo(`card-video-${card.id}`, card.videoUrl);
  const videoSource = analyzeVideoSource(videoUrl);
  const isEmbed = videoSource?.type === 'bilibili' || videoSource?.type === 'youtube' || videoSource?.type === 'iframe';

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!containerRef.current) return;

    if (document.fullscreenElement || isFullscreen) {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // ignore
        }
      }
      setIsFullscreen(false);
    } else {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        } else {
          setIsFullscreen(true);
        }
      } catch {
        // Fallback for iframe / permission restriction: in-window full screen
        setIsFullscreen(true);
      }
    }
  };

  // Listen to native browser fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFs = Boolean(
        document.fullscreenElement && document.fullscreenElement === containerRef.current
      );
      if (document.fullscreenElement) {
        setIsFullscreen(isNativeFs);
      } else {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const effectiveAspectRatio = getCssAspectRatio(card.aspectRatio, card.customRatio);
  const ratioLabel = getRatioLabel(card.aspectRatio, card.customRatio);
  const numericRatio = parseNumericRatio(card.aspectRatio, card.customRatio);
  const maxGalleryHeight = 500;
  const defaultVideoWidth = numericRatio < 1
    ? Math.round(maxGalleryHeight * numericRatio)
    : customWidth ? parseFloat(customWidth) || 480 : 480;

  const effectiveVideoWidth = card.customWidth
    ? Math.min(card.customWidth, Math.round(maxGalleryHeight * Math.max(numericRatio, 0.4) * 1.15))
    : defaultVideoWidth;

  return (
    <div
      onMouseEnter={() => {
        onMouseEnter();
        setControlsVisible(true);
      }}
      onMouseLeave={() => {
        onMouseLeave();
        setControlsVisible(false);
      }}
      className={`flex flex-col transition-transform duration-500 ease-out shrink-0 select-none ${card.yOffsetClass}`}
      style={{
        width: `${effectiveVideoWidth}px`,
        maxWidth: 'min(85vw, 520px)',
      }}
    >
      {/* Video Container Card */}
      <div
        ref={containerRef}
        className={`relative group overflow-hidden border border-black/20 shadow-xl bg-neutral-950 text-white transition-all duration-300 w-full ${
          isFullscreen
            ? '!fixed !inset-0 !z-[9999] !w-screen !h-screen flex items-center justify-center !bg-black/98 p-3 sm:p-6 !border-none !shadow-none'
            : ''
        }`}
      >
        {/* Fullscreen Close Button */}
        {isFullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-neutral-900/90 text-white hover:bg-white hover:text-neutral-950 transition-colors cursor-pointer border border-white/20 shadow-lg"
            title="退出全屏 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Aspect Ratio Frame: Strictly preserves ratio in both normal and fullscreen modes */}
        <div
          className={`overflow-hidden relative bg-neutral-950 flex items-center justify-center transition-all duration-300 ${
            isFullscreen
              ? 'max-w-full max-h-full shadow-2xl border border-white/10'
              : 'w-full'
          }`}
          style={
            isFullscreen
              ? {
                  aspectRatio: effectiveAspectRatio,
                  width: `min(calc(100vw - 32px), calc((100vh - 32px) * ${numericRatio}))`,
                  height: `min(calc(100vh - 32px), calc((100vw - 32px) / ${numericRatio}))`,
                }
              : {
                  aspectRatio: effectiveAspectRatio,
                }
          }
        >
          {videoUrl ? (
            isEmbed && videoSource?.embedUrl ? (
              <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
                <iframe
                  src={videoSource.embedUrl}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  className="w-full h-full border-0 select-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={toRootRelativePath(videoUrl) || videoUrl}
                  loop
                  muted={isMuted}
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleTimeUpdate}
                  onClick={togglePlay}
                  className={`w-full h-full cursor-pointer transition-all duration-300 ${
                    isFullscreen ? 'object-contain' : 'object-cover'
                  }`}
                />

              {/* Big Center Play Button Overlay (when paused) */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] cursor-pointer group/play"
                >
                  <div className="w-14 h-14 rounded-full bg-white/90 text-neutral-950 flex items-center justify-center shadow-lg group-hover/play:scale-110 group-hover/play:bg-white transition-all pl-1">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                </div>
              )}

              {/* Modern Minimalist Video Controls Bar */}
              <div
                className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 flex flex-col gap-1.5 transition-opacity duration-300 z-20 ${
                  controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Progress Bar / Scrubber */}
                <div className="relative w-full h-1 bg-white/25 rounded-full overflow-hidden cursor-pointer group/bar">
                  <div
                    className="absolute left-0 top-0 h-full bg-white transition-all duration-75"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1 text-white/90">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="hover:text-white transition-colors cursor-pointer"
                      title={isPlaying ? '暂停' : '播放'}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="hover:text-white transition-colors cursor-pointer"
                      title={isMuted ? '取消静音' : '静音'}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-[10px] text-white/70">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono tracking-widest text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 bg-emerald-950/40">
                      MOTION · 动态影像
                    </span>
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="hover:text-white transition-colors cursor-pointer"
                      title={isFullscreen ? '退出全屏 (ESC)' : '全屏播放'}
                    >
                      {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )) : (
            /* Empty State: Architectural Video Placeholder */
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-neutral-900 border border-neutral-800 text-center relative overflow-hidden select-none">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0f_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center mb-3 z-10">
                <Video className="w-5 h-5 text-neutral-400" />
              </div>
              <span className="text-xs font-mono font-medium text-neutral-300 block z-10">
                空间实录 · 动态影像体块
              </span>
              <span className="text-[10px] font-mono text-neutral-500 mt-1 block max-w-xs z-10 leading-relaxed">
                MOTION & SPATIAL CHRONICLE
              </span>
            </div>
          )}
        </div>

        {/* Card Top Index Badge */}
        <div className="absolute top-2 left-2 bg-neutral-900/90 text-white border border-white/20 text-[9px] font-mono px-2 py-0.5 tracking-widest z-20 flex items-center gap-1.5">
          <Film className="w-2.5 h-2.5 text-emerald-400" />
          <span>0{index + 1} · 视频体块</span>
        </div>

        {/* Bottom micro coordinate indicator */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-neutral-400 text-[8px] font-mono px-1.5 py-0.5 z-10 flex items-center gap-1">
          <span>{ratioLabel}</span>
          <span>·</span>
          <span>VID. {index + 1}</span>
        </div>
      </div>
    </div>
  );
};
