/**
 * Video Utilities for parsing and normalizing video URLs,
 * including Bilibili (BV/AV/iframe/b23.tv), YouTube, and direct MP4/WebM media files.
 */

export interface VideoSourceInfo {
  type: 'bilibili' | 'youtube' | 'iframe' | 'direct';
  embedUrl?: string;
  directUrl?: string;
  originalInput: string;
  bvid?: string;
  aid?: string;
}

/**
 * Extracts iframe src if user pasted an entire <iframe> embed code snippet
 */
export function extractIframeSrc(input: string): string | null {
  if (!input) return null;
  const match = input.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (match && match[1]) {
    let src = match[1].trim();
    if (src.startsWith('//')) {
      src = 'https:' + src;
    }
    return src;
  }
  return null;
}

/**
 * Parse and normalize Bilibili links:
 * - https://www.bilibili.com/video/BV1xx411c7mD
 * - https://www.bilibili.com/video/BV1xx411c7mD?p=1&share_source=...
 * - https://b23.tv/BV1xx411c7mD
 * - https://www.bilibili.com/video/av170001
 * - //player.bilibili.com/player.html?bvid=BV1...
 * - <iframe src="//player.bilibili.com/player.html?bvid=..."></iframe>
 */
export function parseBilibiliUrl(input: string): { bvid?: string; aid?: string; embedUrl: string } | null {
  if (!input || typeof input !== 'string') return null;
  const raw = input.trim();

  // If user pasted <iframe> HTML snippet, extract src first
  const iframeSrc = extractIframeSrc(raw);
  const target = iframeSrc || raw;

  // 1. Extract BV ID
  const bvMatch = target.match(/(?:bilibili\.com\/video\/|b23\.tv\/|player\.bilibili\.com\/player\.html\?[^"'\s]*bvid=)(BV[a-zA-Z0-9]+)/i);
  if (bvMatch && bvMatch[1]) {
    const bvid = bvMatch[1];
    return {
      bvid,
      embedUrl: `https://player.bilibili.com/player.html?isOutside=true&bvid=${bvid}&page=1&high_quality=1&danmaku=0&autoplay=0`,
    };
  }

  // 2. Extract AV ID
  const avMatch = target.match(/(?:bilibili\.com\/video\/|b23\.tv\/|player\.bilibili\.com\/player\.html\?[^"'\s]*aid=)av([0-9]+)/i);
  if (avMatch && avMatch[1]) {
    const aid = avMatch[1];
    return {
      aid,
      embedUrl: `https://player.bilibili.com/player.html?isOutside=true&aid=${aid}&page=1&high_quality=1&danmaku=0&autoplay=0`,
    };
  }

  // 3. Existing player.bilibili.com player URL
  if (target.includes('player.bilibili.com/player.html')) {
    let url = target;
    if (url.startsWith('//')) {
      url = 'https:' + url;
    }
    if (!url.includes('isOutside=')) {
      url += (url.includes('?') ? '&' : '?') + 'isOutside=true';
    }
    if (!url.includes('high_quality=')) {
      url += '&high_quality=1';
    }
    if (!url.includes('danmaku=')) {
      url += '&danmaku=0';
    }
    return { embedUrl: url };
  }

  return null;
}

/**
 * Check if a URL is YouTube
 */
export function parseYouTubeUrl(input: string): { videoId: string; embedUrl: string } | null {
  if (!input || typeof input !== 'string') return null;
  const raw = input.trim();
  const iframeSrc = extractIframeSrc(raw);
  const target = iframeSrc || raw;

  const ytMatch = target.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
    };
  }
  return null;
}

/**
 * Analyzes any video input string (Bilibili, YouTube, iframe, local/relative path, direct mp4)
 */
export function analyzeVideoSource(input: string | null | undefined): VideoSourceInfo | null {
  if (!input || typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw) return null;

  // 1. Check Bilibili
  const bili = parseBilibiliUrl(raw);
  if (bili) {
    return {
      type: 'bilibili',
      embedUrl: bili.embedUrl,
      bvid: bili.bvid,
      aid: bili.aid,
      originalInput: raw,
    };
  }

  // 2. Check YouTube
  const yt = parseYouTubeUrl(raw);
  if (yt) {
    return {
      type: 'youtube',
      embedUrl: yt.embedUrl,
      originalInput: raw,
    };
  }

  // 3. Check generic iframe
  const iframeSrc = extractIframeSrc(raw);
  if (iframeSrc) {
    return {
      type: 'iframe',
      embedUrl: iframeSrc,
      originalInput: raw,
    };
  }

  // 4. Direct video file (MP4, WebM, blob, root-relative path /videos/...)
  return {
    type: 'direct',
    directUrl: raw,
    originalInput: raw,
  };
}
