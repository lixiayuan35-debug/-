import React, { useState } from 'react';
import { Film, Video } from 'lucide-react';
import { VideoUploadModal } from './VideoUploadModal';

interface VideoReplaceButtonProps {
  videoKey: string;
  title?: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'icon';
  variant?: 'light' | 'dark' | 'ghost';
  defaultFallback?: string;
}

export const VideoReplaceButton: React.FC<VideoReplaceButtonProps> = ({
  videoKey,
  title = '上传/更换此模块视频',
  label = '上传视频',
  className = '',
  size = 'sm',
  variant = 'dark',
  defaultFallback,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'light':
        return 'bg-white/90 text-neutral-800 hover:bg-white border border-neutral-300 shadow-xs backdrop-blur-xs';
      case 'ghost':
        return 'bg-black/40 text-white hover:bg-black/75 border border-white/20 backdrop-blur-xs';
      case 'dark':
      default:
        return 'bg-neutral-900/90 text-white hover:bg-neutral-950 border border-neutral-700 backdrop-blur-xs';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'icon':
        return 'p-1.5';
      case 'md':
        return 'px-3 py-1.5 text-xs';
      case 'sm':
      default:
        return 'px-2 py-1 text-[11px]';
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsModalOpen(true);
        }}
        title={title}
        className={`inline-flex items-center gap-1.5 font-mono tracking-wider cursor-pointer transition-all duration-200 z-30 ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      >
        <Film className="w-3.5 h-3.5 shrink-0" />
        {size !== 'icon' && <span>{label}</span>}
      </button>

      <VideoUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoKey={videoKey}
        title={title}
        defaultFallback={defaultFallback}
      />
    </>
  );
};
