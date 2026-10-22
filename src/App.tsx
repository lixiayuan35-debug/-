/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PersonalSection } from './components/PersonalSection';
import { WorksSection } from './components/WorksSection';
import { ProjectQuickModal } from './components/ProjectQuickModal';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { OpeningAnimation } from './components/OpeningAnimation';
import { ContactQrModal } from './components/ContactQrModal';
import { DataBackupModal } from './components/DataBackupModal';
import { Footer } from './components/Footer';
import { Project } from './types';
import { PROJECTS_DATA } from './data/portfolioData';
import { recoverAllStoredImages } from './utils/imageStore';

export default function App() {
  const [isOpeningOpen, setIsOpeningOpen] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<string>('cover');
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [liveProject, setLiveProject] = useState<Project | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);

  // Automatically scan and recover all custom images across local/session/indexedDB storages
  // and immediately auto-persist any valid links to codebase files
  useEffect(() => {
    recoverAllStoredImages();

    try {
      const images: Record<string, string> = {};
      const videos: Record<string, string> = {};
      const layouts: Record<string, any> = {};
      const ratios: Record<string, any> = {};
      const deletedCards: Record<string, any> = {};

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        const val = localStorage.getItem(k);
        if (!val) continue;

        if (
          k.startsWith('portfolio_img_') ||
          k.startsWith('card-') ||
          k.startsWith('project-') ||
          k.startsWith('hero-') ||
          k.startsWith('persona_') ||
          k.startsWith('contact_qr_')
        ) {
          if (!val.startsWith('data:') && !val.startsWith('blob:') && (val.startsWith('http') || val.startsWith('/'))) {
            const cleanKey = k.startsWith('portfolio_img_') ? k.replace('portfolio_img_', '') : k;
            images[cleanKey] = val;
          }
        } else if (k.startsWith('card-video-')) {
          if (!val.startsWith('blob:') && !val.startsWith('data:')) {
            videos[k] = val;
          }
        } else if (k.startsWith('project_cards_')) {
          try {
            layouts[k] = JSON.parse(val);
          } catch {}
        } else if (k.startsWith('card_ratio_')) {
          try {
            ratios[k] = JSON.parse(val);
          } catch {}
        } else if (k.startsWith('project_deleted_cards_')) {
          try {
            deletedCards[k] = JSON.parse(val);
          } catch {}
        }
      }

      if (Object.keys(images).length > 0 || Object.keys(videos).length > 0 || Object.keys(layouts).length > 0) {
        fetch('/api/save-portfolio-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version: '1.0',
            exportedAt: new Date().toISOString(),
            images,
            videos,
            layouts,
            ratios,
            deletedCards,
          }),
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Auto sync error:', e);
    }
  }, []);

  // Scroll spy to update active navigation item
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const coverEl = document.getElementById('cover');
      const profileEl = document.getElementById('profile');
      const worksEl = document.getElementById('works');

      if (worksEl && scrollPos >= worksEl.offsetTop) {
        setActiveSection('works');
      } else if (profileEl && scrollPos >= profileEl.offsetTop) {
        setActiveSection('profile');
      } else if (coverEl) {
        setActiveSection('cover');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (sectionId: string) => {
    if (liveProject) {
      setLiveProject(null);
    }
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreDown = () => {
    const profileEl = document.getElementById('profile');
    if (profileEl) {
      profileEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#121212] selection:bg-neutral-900 selection:text-white">
      {/* 1. Opening Ceremony Animation */}
      <OpeningAnimation
        isOpen={isOpeningOpen}
        onComplete={() => setIsOpeningOpen(false)}
      />

      {/* 2. Top Navigation Bar */}
      <Header
        onReplayOpening={() => setIsOpeningOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenQrModal={() => setIsQrModalOpen(true)}
      />

      {/* Main Content View */}
      <main className="relative w-full">
        {/* 3. Cover / Hero Page (Exact match to reference image) */}
        <HeroSection onExploreClick={handleExploreDown} />

        {/* 4. Personal Page (Morphing Blob avatar, palette invert tags, 3D flip-book timeline) */}
        <PersonalSection />

        {/* 5. Works Directory (Circular Carousel Ferris Wheel layout & gradient scrim) */}
        <WorksSection onSelectProject={(project) => setModalProject(project)} />
      </main>

      {/* 6. Footer */}
      <Footer
        onBackToTop={handleBackToTop}
      />

      {/* 7. Fullscreen Quick Preview Modal */}
      <ProjectQuickModal
        project={modalProject ? PROJECTS_DATA.find((p) => p.id === modalProject.id) || modalProject : null}
        isOpen={modalProject !== null}
        onClose={() => setModalProject(null)}
        onViewLiveProject={(project) => {
          setModalProject(null);
          setLiveProject(project);
        }}
      />

      {/* 8. Dedicated "作品详情页" (Chinese intro + 6 highly staggered cards + hover parallax + horizontal wheel scroll) */}
      {liveProject && (
        <ProjectDetailPage
          project={PROJECTS_DATA.find((p) => p.id === liveProject.id) || liveProject}
          onBack={() => setLiveProject(null)}
          onSwitchProject={(p) => setLiveProject(p)}
        />
      )}

      {/* 9. Contact QR Codes Modal (WeChat & Douyin QR codes) */}
      <ContactQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* 10. Data Backup & Solidification Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
}
