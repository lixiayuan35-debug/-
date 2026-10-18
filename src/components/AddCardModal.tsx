import React, { useState } from 'react';
import { Plus, X, Check, Image as ImageIcon, Film, Ratio, SlidersHorizontal } from 'lucide-react';
import { RATIO_PRESETS } from '../utils/ratioUtils';
import { StaggeredCard } from '../types';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMediaType?: 'image' | 'video';
  projectId: string;
  currentCount: number;
  onAddCard: (card: StaggeredCard) => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  defaultMediaType = 'image',
  projectId,
  currentCount,
  onAddCard,
}) => {
  const [mediaType, setMediaType] = useState<'image' | 'video'>(defaultMediaType);
  const [selectedRatioId, setSelectedRatioId] = useState<string>(
    defaultMediaType === 'video' ? '16-9' : '4-3'
  );
  const [customW, setCustomW] = useState<string>('16');
  const [customH, setCustomH] = useState<string>('9');
  const [cardWidth, setCardWidth] = useState<number>(defaultMediaType === 'video' ? 480 : 380);
  const [title, setTitle] = useState<string>('');

  if (!isOpen) return null;

  const liveRatio =
    selectedRatioId === 'custom'
      ? `${parseFloat(customW) || 16} / ${parseFloat(customH) || 9}`
      : RATIO_PRESETS.find((p) => p.id === selectedRatioId)?.ratioStr || '4 / 3';

  const handleCreate = () => {
    const isVideo = mediaType === 'video';
    const newId = `custom-${projectId}-${isVideo ? 'video' : 'card'}-${Date.now()}`;

    let aspectClass = 'aspect-[4/3]';
    let customRatioStr = liveRatio;

    if (selectedRatioId === 'custom') {
      const w = parseFloat(customW) || 16;
      const h = parseFloat(customH) || 9;
      aspectClass = `aspect-[${Math.round(w)}/${Math.round(h)}]`;
      customRatioStr = `${w} / ${h}`;
    } else {
      const preset = RATIO_PRESETS.find((p) => p.id === selectedRatioId);
      if (preset) {
        aspectClass = preset.aspectClass;
        customRatioStr = preset.ratioStr;
      }
    }

    const defaultTitle = isVideo
      ? `0${currentCount + 1}. 现场动态实录与空间漫游`
      : `0${currentCount + 1}. 新增实景展示`;

    const newCard: StaggeredCard = {
      id: newId,
      mediaType,
      title: title.trim() || defaultTitle,
      subtitle: isVideo ? 'Dynamic Walkthrough & Video Archive' : 'Field Photography & Detail',
      annotation: isVideo
        ? '点击体块上传空间实录、漫游视频或动画影像。'
        : '点击卡片右上角相机上传现场实景高精度摄影作品。',
      aspectRatio: aspectClass,
      customRatio: customRatioStr,
      customWidth: cardWidth,
      yOffsetClass: currentCount % 2 === 0 ? '-mt-4' : 'mt-8',
      visualType: isVideo ? 'video' : 'clean-placeholder',
    };

    onAddCard(newCard);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#FDFCF9] border border-neutral-300 shadow-2xl overflow-hidden text-neutral-900 select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-neutral-900 text-white flex items-center justify-center">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-serif-display font-medium text-base text-neutral-900">
                添加自定义比例展陈体块
              </h3>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                ADD CUSTOM PROPORTION BLOCK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Media Type Switcher */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider">
              1. 体块类型选择 (BLOCK TYPE)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMediaType('image');
                  if (selectedRatioId === '16-9') setSelectedRatioId('4-3');
                }}
                className={`p-3 border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  mediaType === 'image'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <div className="text-left">
                  <span className="text-xs font-mono font-medium block">图片相框体块</span>
                  <span className={`text-[9px] font-mono ${mediaType === 'image' ? 'text-neutral-300' : 'text-neutral-400'}`}>
                    支持自主上传实景/效果图
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaType('video');
                  setSelectedRatioId('16-9');
                  setCardWidth(480);
                }}
                className={`p-3 border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  mediaType === 'video'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                }`}
              >
                <Film className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <span className="text-xs font-mono font-medium block">动态视频体块</span>
                  <span className={`text-[9px] font-mono ${mediaType === 'video' ? 'text-neutral-300' : 'text-neutral-400'}`}>
                    支持自主上传 MP4/MOV 漫游
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Aspect Ratio Preview */}
          <div className="bg-neutral-900 p-4 flex flex-col items-center justify-center border border-neutral-800">
            <div className="text-[10px] font-mono text-neutral-400 mb-2 flex items-center gap-1.5">
              <Ratio className="w-3 h-3 text-emerald-400" />
              <span>当前选定比例: {liveRatio.replace('/', ':')}</span>
            </div>
            <div className="w-full h-28 flex items-center justify-center">
              <div
                className="max-h-28 max-w-[220px] bg-neutral-800 border-2 border-emerald-400/80 shadow-md flex items-center justify-center text-white transition-all duration-300"
                style={{
                  aspectRatio: liveRatio,
                  width: '100%',
                }}
              >
                <span className="text-xs font-mono font-bold">{liveRatio.replace(' / ', ':')}</span>
              </div>
            </div>
          </div>

          {/* Ratio Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider">
              2. 自定义或选取比例 (CUSTOM ASPECT RATIO)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {RATIO_PRESETS.map((p) => {
                const isSelected = selectedRatioId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedRatioId(p.id)}
                    className={`p-2 border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white hover:border-neutral-400 text-neutral-800'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold">{p.label}</span>
                    <span className={`text-[8px] font-mono ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                      {p.title.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Numerical Ratio */}
          <div className="flex items-center gap-2 p-2.5 bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] font-mono text-neutral-600 whitespace-nowrap">自定义比例数值:</span>
            <input
              type="number"
              step="0.1"
              value={customW}
              onChange={(e) => {
                setSelectedRatioId('custom');
                setCustomW(e.target.value);
              }}
              className="w-14 px-1.5 py-1 text-xs font-mono bg-white border border-neutral-300 text-center font-bold"
            />
            <span className="text-sm font-mono">:</span>
            <input
              type="number"
              step="0.1"
              value={customH}
              onChange={(e) => {
                setSelectedRatioId('custom');
                setCustomH(e.target.value);
              }}
              className="w-14 px-1.5 py-1 text-xs font-mono bg-white border border-neutral-300 text-center font-bold"
            />
            <button
              type="button"
              onClick={() => setSelectedRatioId('custom')}
              className={`text-[9px] font-mono px-2 py-1 ml-auto border cursor-pointer ${
                selectedRatioId === 'custom'
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-300 bg-white text-neutral-700'
              }`}
            >
              应用自定义数值
            </button>
          </div>

          {/* Width Size */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span className="uppercase">3. 画廊展陈宽度 (SCALE)</span>
              <span className="font-bold text-neutral-900">{cardWidth}px</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[320, 400, 480, 560].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setCardWidth(w)}
                  className={`py-1 text-[10px] font-mono border text-center transition-colors cursor-pointer ${
                    cardWidth === w
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-neutral-200 bg-neutral-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-neutral-600 hover:text-neutral-950 cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="px-5 py-2 bg-neutral-950 text-white text-xs font-mono hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>立即添加此自定义比例体块</span>
          </button>
        </div>
      </div>
    </div>
  );
};
