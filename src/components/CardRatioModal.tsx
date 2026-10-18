import React, { useState } from 'react';
import { Ratio, Check, X, SlidersHorizontal, Maximize2, MoveVertical } from 'lucide-react';
import { StaggeredCard } from '../types';
import { RATIO_PRESETS, getCssAspectRatio, getRatioLabel } from '../utils/ratioUtils';

interface CardRatioModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: StaggeredCard;
  onUpdateCard: (updated: Partial<StaggeredCard>) => void;
}

export const CardRatioModal: React.FC<CardRatioModalProps> = ({
  isOpen,
  onClose,
  card,
  onUpdateCard,
}) => {
  const currentRatioClass = card.aspectRatio || (card.mediaType === 'video' ? 'aspect-video' : 'aspect-[4/3]');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    const found = RATIO_PRESETS.find(
      (p) => p.aspectClass === currentRatioClass || (card.customRatio && p.label === card.customRatio.replace('/', ':'))
    );
    return found ? found.id : 'custom';
  });

  const [customW, setCustomW] = useState<string>(() => {
    if (card.customRatio) {
      const parts = card.customRatio.split(/[/:]/);
      return parts[0]?.trim() || '16';
    }
    return '16';
  });

  const [customH, setCustomH] = useState<string>(() => {
    if (card.customRatio) {
      const parts = card.customRatio.split(/[/:]/);
      return parts[1]?.trim() || '9';
    }
    return '9';
  });

  const [cardWidth, setCardWidth] = useState<number>(() => {
    if (card.customWidth) return card.customWidth;
    return card.mediaType === 'video' ? 480 : 380;
  });

  const [yOffset, setYOffset] = useState<string>(() => card.yOffsetClass || 'mt-0');

  if (!isOpen) return null;

  // Compute live aspect ratio for preview
  const liveRatio =
    selectedPresetId === 'custom'
      ? `${parseFloat(customW) || 16} / ${parseFloat(customH) || 9}`
      : RATIO_PRESETS.find((p) => p.id === selectedPresetId)?.ratioStr || '4 / 3';

  const numericLiveRatio = (() => {
    const parts = liveRatio.split('/').map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] !== 0) {
      return parts[0] / parts[1];
    }
    return 16 / 9;
  })();

  const handleApply = () => {
    if (selectedPresetId === 'custom') {
      const w = parseFloat(customW) || 16;
      const h = parseFloat(customH) || 9;
      onUpdateCard({
        aspectRatio: `aspect-[${Math.round(w)}/${Math.round(h)}]`,
        customRatio: `${w} / ${h}`,
        customWidth: cardWidth,
        yOffsetClass: yOffset,
      });
    } else {
      const preset = RATIO_PRESETS.find((p) => p.id === selectedPresetId);
      if (preset) {
        onUpdateCard({
          aspectRatio: preset.aspectClass,
          customRatio: preset.ratioStr,
          customWidth: cardWidth,
          yOffsetClass: yOffset,
        });
      }
    }
    onClose();
  };

  const WIDTH_PRESETS = [
    { label: '紧凑 (320px)', val: 320 },
    { label: '标准 (380px)', val: 380 },
    { label: '宽幅 (440px)', val: 440 },
    { label: '大幅 (480px)', val: 480 },
  ];

  const OFFSET_PRESETS = [
    { label: '上浮 (-24px)', val: '-mt-6' },
    { label: '居中 (标准)', val: 'mt-0' },
    { label: '下沉 (+32px)', val: 'mt-8' },
    { label: '深沉 (+56px)', val: 'mt-14' },
  ];

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
              <Ratio className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-serif-display font-medium text-base text-neutral-900">
                自定义{card.mediaType === 'video' ? '视频' : '图片'}版块比例与尺寸
              </h3>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                CUSTOMIZE ASPECT RATIO & GALLERY SCALE
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Live Proportion Box Preview */}
          <div className="bg-neutral-900 p-5 flex flex-col items-center justify-center border border-neutral-800 relative overflow-hidden">
            <div className="text-[10px] font-mono text-neutral-400 mb-3 tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>实时比例预览 (LIVE ASPECT PREVIEW): {liveRatio.replace('/', ':')}</span>
            </div>

            {/* Container for the preview box */}
            <div className="w-full h-40 flex items-center justify-center p-2 bg-neutral-950/40">
              <div
                className="bg-neutral-800 border-2 border-emerald-400 shadow-lg flex flex-col items-center justify-center text-white transition-all duration-300 relative overflow-hidden"
                style={{
                  aspectRatio: liveRatio,
                  height: numericLiveRatio <= 1 ? '140px' : undefined,
                  width: numericLiveRatio > 1 ? `${Math.min(140 * numericLiveRatio, 260)}px` : undefined,
                  maxHeight: '140px',
                  maxWidth: '260px',
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:12px_12px]" />
                <span className="text-xs font-mono font-medium z-10 text-white drop-shadow-xs">
                  {selectedPresetId === 'custom' ? `${customW}:${customH}` : liveRatio.replace(' / ', ':')}
                </span>
                <span className="text-[9px] font-mono text-neutral-400 z-10">
                  {card.mediaType === 'video' ? 'VIDEO BLOCK' : 'IMAGE CARD'}
                </span>
              </div>
            </div>
          </div>

          {/* Preset Ratios Selection Grid */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider flex items-center justify-between">
              <span>预设构图比例 (STANDARD PRESETS)</span>
              <span className="text-[10px] text-neutral-400">点击即刻选用</span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {RATIO_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(p.id);
                      setCardWidth(p.defaultWidth);
                    }}
                    className={`p-2.5 border text-left flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white hover:border-neutral-400 text-neutral-800'
                    }`}
                  >
                    {/* Visual mini aspect ratio wireframe with true geometric proportion */}
                    <div className="w-8 h-8 flex items-center justify-center">
                      <div
                        className={`border transition-colors ${
                          isSelected ? 'border-white bg-white/20' : 'border-neutral-700 bg-neutral-100'
                        }`}
                        style={{
                          aspectRatio: p.ratioStr,
                          height: p.w <= p.h ? '26px' : undefined,
                          width: p.w > p.h ? '26px' : undefined,
                          maxHeight: '26px',
                          maxWidth: '26px',
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold">{p.label}</span>
                    <span
                      className={`text-[9px] font-mono truncate w-full text-center ${
                        isSelected ? 'text-neutral-300' : 'text-neutral-400'
                      }`}
                    >
                      {p.title.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Ratio Numerical Inputs */}
          <div className="space-y-2 border-t border-neutral-200 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider">
                自由输入自定义比例数值 (CUSTOM NUMERICAL RATIO)
              </label>
              <button
                type="button"
                onClick={() => setSelectedPresetId('custom')}
                className={`text-[10px] font-mono px-2 py-0.5 border cursor-pointer transition-colors ${
                  selectedPresetId === 'custom'
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                启用自定义模式
              </button>
            </div>

            <div className="flex items-center gap-3 bg-neutral-50 p-3 border border-neutral-200">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-mono text-neutral-500 block">宽度比例 (Width)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="50"
                  value={customW}
                  onChange={(e) => {
                    setSelectedPresetId('custom');
                    setCustomW(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-neutral-300 focus:outline-none focus:border-neutral-900 text-center font-bold"
                />
              </div>

              <span className="text-lg font-mono text-neutral-400 pt-4">:</span>

              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-mono text-neutral-500 block">高度比例 (Height)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="50"
                  value={customH}
                  onChange={(e) => {
                    setSelectedPresetId('custom');
                    setCustomH(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-neutral-300 focus:outline-none focus:border-neutral-900 text-center font-bold"
                />
              </div>

              <div className="text-[10px] font-mono text-neutral-400 pt-4 pl-1">
                比例 ≈ {((parseFloat(customW) || 16) / (parseFloat(customH) || 9)).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Width Scale in Gallery */}
          <div className="space-y-2 border-t border-neutral-200 pt-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span className="uppercase">在画廊中的展陈宽度 (CARD WIDTH):</span>
              <span className="font-bold text-neutral-900">{cardWidth}px</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {WIDTH_PRESETS.map((w) => (
                <button
                  key={w.val}
                  type="button"
                  onClick={() => setCardWidth(w.val)}
                  className={`py-1.5 px-2 text-[10px] font-mono border text-center transition-colors cursor-pointer ${
                    cardWidth === w.val
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>

            <input
              type="range"
              min="280"
              max="660"
              step="10"
              value={cardWidth}
              onChange={(e) => setCardWidth(parseInt(e.target.value, 10))}
              className="w-full mt-2 accent-neutral-900 cursor-pointer"
            />
          </div>

          {/* Stagger Vertical Offset */}
          <div className="space-y-2 border-t border-neutral-200 pt-4">
            <label className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider block">
              上下错落层叠位移 (STAGGERED Y-OFFSET)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {OFFSET_PRESETS.map((o) => (
                <button
                  key={o.val}
                  type="button"
                  onClick={() => setYOffset(o.val)}
                  className={`py-1.5 px-2 text-[10px] font-mono border text-center transition-colors cursor-pointer ${
                    yOffset === o.val
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-neutral-200 bg-neutral-50 gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-mono text-neutral-600 hover:text-neutral-950 cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                onUpdateCard({
                  aspectRatio: card.mediaType === 'video' ? 'aspect-video' : 'aspect-[4/3]',
                  customRatio: undefined,
                  customWidth: undefined,
                  yOffsetClass: 'mt-0',
                });
                onClose();
              }}
              className="px-3 py-2 text-xs font-mono text-neutral-600 hover:text-red-600 hover:bg-red-50 border border-neutral-300 transition-colors cursor-pointer"
              title="重置为此卡片初始的标准构图比例与居中尺寸"
            >
              重置默认比例
            </button>
          </div>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 bg-neutral-950 text-white text-xs font-mono hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>确认应用此比例与尺寸</span>
          </button>
        </div>
      </div>
    </div>
  );
};
