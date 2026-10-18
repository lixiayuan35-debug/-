import React, { useState } from 'react';
import { Palette, Award, Briefcase, GraduationCap, ArrowUpRight } from 'lucide-react';
import { SKILLS_DATA, TIMELINE_DATA } from '../data/portfolioData';
import { PersonalAvatar } from './PersonalAvatar';

export const PersonalSection: React.FC = () => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('全部');

  const filteredTimeline = TIMELINE_DATA.filter((item) => {
    if (activeCategoryFilter === '全部') return true;
    return item.category === activeCategoryFilter;
  });

  return (
    <section id="profile" className="relative w-full py-28 px-6 bg-[#F5F4F0] border-t border-neutral-300/70">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/10">
          <div>
            <div className="text-[11px] font-mono tracking-[0.25em] text-neutral-500 uppercase mb-2">
              [ 02 / PROFILE & ARCHIVE ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif-display font-normal tracking-tight text-neutral-900">
              个人志·拾感
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-sans-body text-neutral-600 max-w-md leading-relaxed">
            行到水穷处，坐看云起时。
          </p>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Sticky Profile, Morphing Organic Blob Avatar, Bio & Palette Skill Tags */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-10">
            {/* Morphing Organic Blob Avatar Frame */}
            <div className="flex flex-col items-center sm:items-start">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 my-2 group">
                {/* Secondary outer breathing halo */}
                <div className="absolute inset-0 bg-neutral-300/40 animate-blob-halo filter blur-md -z-10" />

                {/* Primary Organic Morphing Blob Shape */}
                <div className="relative w-full h-full animate-blob-organic overflow-hidden shadow-xl border border-black/15 bg-neutral-200 transition-transform duration-500 group-hover:scale-[1.03]">
                  {/* Portrait photo based on user uploaded image */}
                  <PersonalAvatar />
                </div>

                {/* Micro coordinates floating tag */}
                <div className="absolute -bottom-2 -right-2 bg-neutral-900 text-white text-[9px] font-mono px-2 py-0.5 tracking-widest shadow-md">
                  CURATOR
                </div>
              </div>

              {/* Title & Identity */}
              <div className="mt-4 text-center sm:text-left">
                <h3 className="text-2xl font-serif-display font-medium text-neutral-900">
                  李夏远 · Li Xiayuan
                </h3>
                <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase mt-0.5">
                  栖于空间·观照本我
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-[11px] font-mono text-neutral-600">
                  <span>外在皆是假面，本心方为归处</span>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-3 text-neutral-700 text-xs sm:text-sm leading-relaxed font-sans-body border-t border-black/10 pt-6">
              <p>
                毕业于北京服装学院（BIFT）景观设计专业。热爱美术与人文创作，习惯观看直播、接触各类新鲜事物，在多元的体验里寻找创作灵感。
              </p>
              <p>
                相信动人的表达不在于繁复堆砌，而在于抓住核心感受。空间、图像与直播间，都是容纳情绪与叙事的容器，是人与人感知交汇的媒介。
              </p>
            </div>

            {/* Skill Tags with Palette Icon & Invert-Color Hover Micro-interaction */}
            <div className="border-t border-black/10 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-[0.2em] text-neutral-500 uppercase flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-neutral-800" />
                  <span>核心造物领域与技能标签</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-400">悬停反色</span>
              </div>

              {/* Tag Grid: Inverts color on hover as explicitly requested */}
              <div className="flex flex-wrap gap-2">
                {SKILLS_DATA.map((skill, index) => (
                  <div
                    key={index}
                    className="group inline-flex items-center gap-2 px-3 py-2 text-xs font-sans-body border border-neutral-300 bg-white/70 text-neutral-800 rounded-none cursor-default transition-all duration-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 hover:shadow-md hover:-translate-y-0.5 select-none"
                  >
                    <Palette className="w-3 h-3 text-neutral-600 group-hover:text-white transition-colors duration-300 shrink-0" />
                    <span className="font-medium tracking-wide">{skill.name}</span>
                    {skill.category && (
                      <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-400 transition-colors">
                        {skill.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Flip-Book Style Vertical Timeline */}
          <div className="lg:col-span-7 space-y-8">
            {/* Timeline Filter Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-black/10">
              <span className="text-xs font-mono tracking-widest text-neutral-500 uppercase">
                CHRONOLOGY / 经历时间轴
              </span>
              <div className="flex gap-1 p-1 bg-neutral-200/60 rounded-none text-xs font-mono">
                {['全部', '经历', '教育'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-3 py-1 transition-all duration-200 cursor-pointer ${
                      activeCategoryFilter === cat
                        ? 'bg-neutral-900 text-white shadow-sm font-medium'
                        : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Vertical Track with 3D Flip Book Cards */}
            <div className="relative pl-6 sm:pl-8 space-y-8 [perspective:1400px]">
              {/* Continuous vertical timeline guide line */}
              <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-6 w-px bg-neutral-300" />

              {filteredTimeline.map((item, index) => {
                const isHovered = hoveredCardId === item.id;

                return (
                  <div
                    key={item.id}
                    className="relative group transition-all duration-500"
                    onMouseEnter={() => setHoveredCardId(item.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                  >
                    {/* Synchronized Timeline Node Dot (Changes color & glows on card hover) */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-6 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                        isHovered
                          ? 'bg-neutral-950 scale-125 shadow-lg ring-4 ring-neutral-400/40'
                          : 'bg-[#F5F4F0] border-2 border-neutral-400 scale-100 ring-0'
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                          isHovered ? 'bg-white' : 'bg-neutral-400'
                        }`}
                      />
                    </div>

                    {/* Glassmorphic 3D Flip-Book Card */}
                    <div
                      className={`relative p-6 sm:p-7 rounded-none border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${
                        isHovered
                          ? '-translate-y-2.5 bg-neutral-100/95 border-neutral-400/80 shadow-2xl shadow-neutral-900/15 [transform:rotateX(-1.5deg)_rotateY(1.5deg)_scale(1.01)]'
                          : 'bg-white/75 backdrop-blur-md border-neutral-200/90 shadow-sm [transform:rotateX(0deg)_rotateY(0deg)_scale(1)]'
                      }`}
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Top Meta Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono tracking-widest text-neutral-900 font-semibold">
                            {item.period}
                          </span>
                          <span className="text-neutral-300">·</span>
                          <span className="text-[11px] font-mono text-neutral-500">
                            {item.location}
                          </span>
                        </div>

                        {/* Category Badge Icon */}
                        <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {item.category === '经历' && <Briefcase className="w-2.5 h-2.5" />}
                          {item.category === '教育' && <GraduationCap className="w-2.5 h-2.5" />}
                          {item.category === '荣誉' && <Award className="w-2.5 h-2.5" />}
                          <span>{item.category}</span>
                        </div>
                      </div>

                      {/* Main Title */}
                      <h4 className="text-lg sm:text-xl font-serif-display font-medium text-neutral-900 mb-1 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs font-mono text-neutral-500 mb-3 uppercase tracking-wider">
                        {item.organization}
                      </p>

                      {/* Description */}
                      <p className={`text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans-body ${item.highlights.length > 0 ? 'mb-4' : ''}`}>
                        {item.description}
                      </p>

                      {/* Highlights */}
                      {item.highlights.length > 0 && (
                        <div className="border-t border-black/5 pt-3 space-y-1.5">
                          {item.highlights.map((h, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-neutral-600 font-sans-body">
                              <span className="w-1 h-1 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 3D Paper Page Corner Accent */}
                      <div
                        className={`absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 transition-colors duration-300 ${
                          isHovered ? 'border-neutral-900' : 'border-neutral-300'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
