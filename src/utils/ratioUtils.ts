export interface RatioPreset {
  id: string;
  label: string;
  title: string;
  ratioStr: string; // e.g. "16 / 9"
  aspectClass: string;
  w: number;
  h: number;
  recommendedFor?: 'video' | 'image' | 'both';
  defaultWidth: number;
}

export const RATIO_PRESETS: RatioPreset[] = [
  {
    id: '16-9',
    label: '16:9',
    title: '宽幅横画 (视频/宽照推荐)',
    ratioStr: '16 / 9',
    aspectClass: 'aspect-video',
    w: 16,
    h: 9,
    recommendedFor: 'video',
    defaultWidth: 460,
  },
  {
    id: '4-3',
    label: '4:3',
    title: '经典画廊 (建筑摄影标准)',
    ratioStr: '4 / 3',
    aspectClass: 'aspect-[4/3]',
    w: 4,
    h: 3,
    recommendedFor: 'both',
    defaultWidth: 400,
  },
  {
    id: '3-4',
    label: '3:4',
    title: '竖向立幅 (高耸立面/装置)',
    ratioStr: '3 / 4',
    aspectClass: 'aspect-[3/4]',
    w: 3,
    h: 4,
    recommendedFor: 'image',
    defaultWidth: 360,
  },
  {
    id: '1-1',
    label: '1:1',
    title: '正方形框 (特写与材质局部)',
    ratioStr: '1 / 1',
    aspectClass: 'aspect-square',
    w: 1,
    h: 1,
    recommendedFor: 'both',
    defaultWidth: 360,
  },
  {
    id: '16-10',
    label: '16:10',
    title: '微宽展框 (黄金视觉比例)',
    ratioStr: '16 / 10',
    aspectClass: 'aspect-[16/10]',
    w: 16,
    h: 10,
    recommendedFor: 'both',
    defaultWidth: 440,
  },
  {
    id: '3-2',
    label: '3:2',
    title: '35mm画幅 (全画幅微单摄影)',
    ratioStr: '3 / 2',
    aspectClass: 'aspect-[3/2]',
    w: 3,
    h: 2,
    recommendedFor: 'image',
    defaultWidth: 420,
  },
  {
    id: '9-16',
    label: '9:16',
    title: '移动竖屏 (手机短视频/漫游)',
    ratioStr: '9 / 16',
    aspectClass: 'aspect-[9/16]',
    w: 9,
    h: 16,
    recommendedFor: 'video',
    defaultWidth: 280,
  },
  {
    id: '21-9',
    label: '21:9',
    title: '电影超宽 (全景横卷/宽银幕)',
    ratioStr: '21 / 9',
    aspectClass: 'aspect-[21/9]',
    w: 21,
    h: 9,
    recommendedFor: 'both',
    defaultWidth: 500,
  },
];

/**
 * Normalizes any Tailwind class or custom ratio into a valid CSS aspectRatio string
 */
export function getCssAspectRatio(aspectClass?: string, customRatio?: string): string {
  if (customRatio && customRatio.trim()) {
    return customRatio.replace(':', ' / ');
  }

  if (!aspectClass) return '4 / 3';

  if (aspectClass === 'aspect-video') return '16 / 9';
  if (aspectClass === 'aspect-square') return '1 / 1';

  // Match aspect-[X/Y]
  const match = aspectClass.match(/aspect-\[(\d+)\/(\d+)\]/);
  if (match) {
    return `${match[1]} / ${match[2]}`;
  }

  return '4 / 3';
}

/**
 * Format human-readable ratio tag (e.g. "16:9", "4:3", "自定义")
 */
export function getRatioLabel(aspectClass?: string, customRatio?: string): string {
  if (customRatio && customRatio.trim()) {
    return customRatio.replace('/', ':');
  }

  if (!aspectClass) return '4:3';
  if (aspectClass === 'aspect-video') return '16:9';
  if (aspectClass === 'aspect-square') return '1:1';

  const match = aspectClass.match(/aspect-\[(\d+)\/(\d+)\]/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }

  return '4:3';
}

/**
 * Parses aspect ratio into width / height numeric decimal (e.g. 9/16 = 0.5625, 16/9 = 1.7778)
 */
export function parseNumericRatio(aspectClass?: string, customRatio?: string): number {
  const cssRatio = getCssAspectRatio(aspectClass, customRatio);
  const parts = cssRatio.split('/').map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] !== 0) {
    return parts[0] / parts[1];
  }
  return 4 / 3;
}

function calcGcd(a: number, b: number): number {
  return b === 0 ? a : calcGcd(b, a % b);
}

/**
 * Automatically determine the best ratio preset and recommended gallery width from natural image width & height
 */
export function getSmartRatioForDimensions(width: number, height: number): {
  aspectClass: string;
  ratioStr: string;
  label: string;
  recommendedWidth: number;
} {
  if (!width || !height || width <= 0 || height <= 0) {
    return {
      aspectClass: 'aspect-[4/3]',
      ratioStr: '4 / 3',
      label: '4:3',
      recommendedWidth: 400,
    };
  }

  const numeric = width / height;

  // 1. 16:9 widescreen (~1.778)
  if (Math.abs(numeric - 16 / 9) < 0.08) {
    return { aspectClass: 'aspect-video', ratioStr: '16 / 9', label: '16:9', recommendedWidth: 500 };
  }
  // 2. 21:9 cinematic (~2.333)
  if (Math.abs(numeric - 21 / 9) < 0.12) {
    return { aspectClass: 'aspect-[21/9]', ratioStr: '21 / 9', label: '21:9', recommendedWidth: 560 };
  }
  // 3. 16:10 wide (~1.6)
  if (Math.abs(numeric - 16 / 10) < 0.06) {
    return { aspectClass: 'aspect-[16/10]', ratioStr: '16 / 10', label: '16:10', recommendedWidth: 460 };
  }
  // 4. 3:2 classic photo (~1.5)
  if (Math.abs(numeric - 3 / 2) < 0.06) {
    return { aspectClass: 'aspect-[3/2]', ratioStr: '3 / 2', label: '3:2', recommendedWidth: 440 };
  }
  // 5. 4:3 gallery (~1.333)
  if (Math.abs(numeric - 4 / 3) < 0.07) {
    return { aspectClass: 'aspect-[4/3]', ratioStr: '4 / 3', label: '4:3', recommendedWidth: 400 };
  }
  // 6. 1:1 square (~1.0)
  if (Math.abs(numeric - 1) < 0.08) {
    return { aspectClass: 'aspect-square', ratioStr: '1 / 1', label: '1:1', recommendedWidth: 360 };
  }
  // 7. 3:4 vertical (~0.75)
  if (Math.abs(numeric - 3 / 4) < 0.07) {
    return { aspectClass: 'aspect-[3/4]', ratioStr: '3 / 4', label: '3:4', recommendedWidth: 330 };
  }
  // 8. 2:3 vertical (~0.667)
  if (Math.abs(numeric - 2 / 3) < 0.06) {
    return { aspectClass: 'aspect-[2/3]', ratioStr: '2 / 3', label: '2:3', recommendedWidth: 300 };
  }
  // 9. 9:16 mobile portrait (~0.5625)
  if (Math.abs(numeric - 9 / 16) < 0.08) {
    return { aspectClass: 'aspect-[9/16]', ratioStr: '9 / 16', label: '9:16', recommendedWidth: 260 };
  }

  // Exact custom ratio
  const roundedW = Math.round(width);
  const roundedH = Math.round(height);
  const gcdVal = calcGcd(roundedW, roundedH);
  const simpW = Math.round(roundedW / (gcdVal || 1));
  const simpH = Math.round(roundedH / (gcdVal || 1));

  const customW = simpW < 100 && simpH < 100 ? simpW : Math.round(numeric * 100) / 10;
  const customH = simpW < 100 && simpH < 100 ? simpH : 10;

  // Calculate recommended width to keep card height <= 450px
  const maxGalleryH = 450;
  const idealWidth = Math.max(260, Math.min(560, Math.round(maxGalleryH * numeric)));

  return {
    aspectClass: `aspect-[${Math.round(customW)}/${Math.round(customH)}]`,
    ratioStr: `${customW} / ${customH}`,
    label: `${customW}:${customH}`,
    recommendedWidth: idealWidth,
  };
}


