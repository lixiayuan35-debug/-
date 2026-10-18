import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { ImageReplaceModal } from './ImageReplaceModal';

interface ImageReplaceButtonProps {
  imageKey: string;
  title?: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'icon';
  variant?: 'light' | 'dark' | 'ghost';
  defaultFallback?: string;
  onImageUploaded?: (dataUrl: string, width: number, height: number) => void;
}

export const ImageReplaceButton: React.FC<ImageReplaceButtonProps> = ({
  imageKey,
  title = '更换作品照片',
  label = '更换照片',
  className = '',
  size = 'sm',
  variant = 'light',
  defaultFallback,
  onImageUploaded,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'dark':
        return 'bg-neutral-900/90 text-white hover:bg-neutral-950 border border-neutral-700 backdrop-blur-xs';
      case 'ghost':
        return 'bg-black/40 text-white hover:bg-black/75 border border-white/20 backdrop-blur-xs';
      case 'light':
      default:
        return 'bg-white/90 text-neutral-800 hover:bg-white border border-neutral-300 shadow-xs backdrop-blur-xs';
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
        <Camera className="w-3.5 h-3.5 shrink-0" />
        {size !== 'icon' && <span>{label}</span>}
      </button>

      <ImageReplaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageKey={imageKey}
        title={title}
        defaultFallback={defaultFallback}
        onImageUploaded={onImageUploaded}
      />
    </>
  );
};
