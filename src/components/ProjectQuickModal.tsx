import React, { useEffect, useState } from 'react';
import { Project } from '../types';
import { ArtworkVisual } from './ArtworkVisual';
import { getStoredImage, getProjectDisplayImage } from '../utils/imageStore';
import { X, ArrowRight } from 'lucide-react';

interface ProjectQuickModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onViewLiveProject: (project: Project) => void;
}

export const ProjectQuickModal: React.FC<ProjectQuickModalProps> = ({
  project,
  isOpen,
  onClose,
  onViewLiveProject,
}) => {
  const [imagesVersion, setImagesVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setImagesVersion((v) => v + 1);
    window.addEventListener('portfolio_custom_images_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_custom_images_updated', handleUpdate);
  }, []);

  // Lock body scroll when modal is open so outer page never scrolls
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 select-none animate-in fade-in duration-300">
      {/* Dark backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/75 backdrop-blur-md cursor-pointer transition-opacity"
      />

      {/* Fullscreen modal card */}
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-[#F5F4F0] text-neutral-900 border border-neutral-300 shadow-2xl z-10 flex flex-col justify-between">
        {/* Modal Top Bar */}
        <div className="sticky top-0 bg-[#F5F4F0]/95 backdrop-blur-sm z-20 flex items-center justify-between px-6 py-4 border-b border-black/10">
          <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-neutral-500 uppercase">
            <span>PROJECT DOSSIER</span>
            <span>·</span>
            <span>{project.slug}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer text-neutral-600"
            title="关闭弹窗 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Header & Visual Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Visual Cover */}
            <div className="md:col-span-5 flex flex-col gap-2.5">
              <div className="relative aspect-[4/3] bg-neutral-200 border border-black/10 overflow-hidden shadow-lg group">
                <div className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700">
                  <ArtworkVisual
                    key={`quickmodal-visual-${project.id}-${imagesVersion}`}
                    type={project.coverVisual}
                    imageUrl={getProjectDisplayImage(
                      project.id,
                      (project.staggeredCards || []).map((c) => c.id)
                    )}
                    clearBaseVisual={true}
                  />
                </div>
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="md:col-span-7 space-y-4">
              <div className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
                {project.location?.includes(project.year)
                  ? project.location
                  : `${project.year} · ${project.location}`}
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif-display font-medium text-neutral-950 leading-tight">
                {project.title}
              </h2>
              <p className="text-xs sm:text-sm font-mono tracking-wider text-neutral-500 uppercase">
                {project.englishTitle}
              </p>
              {project.tagline &&
                project.id !== 'pavilion-o' &&
                project.id !== 'monolith' && (
                  <p className="text-sm font-serif-display italic text-neutral-700 leading-relaxed pt-1">
                    "{project.tagline}"
                  </p>
                )}

              {/* Meta Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs font-mono px-2.5 py-1 bg-white border border-neutral-300 text-neutral-700">
                  {project.discipline}
                </span>
                <span className="text-xs font-mono px-2.5 py-1 bg-white border border-neutral-300 text-neutral-700">
                  {project.role}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Chinese Description & Concept (Omitted for 07 and 08) */}
          {(project.chineseIntro || project.designConcept) &&
            project.id !== 'pavilion-o' &&
            project.id !== 'monolith' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-black/10 pt-8 text-sm font-sans-body text-neutral-700 leading-relaxed">
                {project.chineseIntro && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono tracking-widest uppercase text-neutral-500">
                      空间构筑概述 · OVERVIEW
                    </h4>
                    <p>{project.chineseIntro}</p>
                  </div>
                )}
                {project.designConcept && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono tracking-widest uppercase text-neutral-500">
                      设计哲学与结构秩序 · CONCEPT
                    </h4>
                    <p>{project.designConcept}</p>
                  </div>
                )}
              </div>
            )}

        </div>

        {/* Modal Bottom Bar with "View Live Project" Button */}
        <div className="sticky bottom-0 bg-[#F5F4F0]/95 backdrop-blur-sm border-t border-black/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
          <div className="text-xs font-mono text-neutral-500">
            包含 6 组错落画廊排版与横向微交互体验
          </div>

          {/* CRITICAL: "View Live Project" Button */}
          <button
            onClick={() => {
              onClose();
              onViewLiveProject(project);
            }}
            className="w-full sm:w-auto group flex items-center justify-center gap-3 px-8 py-3.5 bg-neutral-950 text-white hover:bg-neutral-800 transition-all duration-300 font-mono text-xs uppercase tracking-widest cursor-pointer shadow-lg active:scale-95"
          >
            <span>View Live Project / 进入作品详情页</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
