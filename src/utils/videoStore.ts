/**
 * High-performance Video Storage utility using IndexedDB:
 * - Stores native File/Blob objects with zero Base64 overhead.
 * - Automatic ObjectURL generation and memory caching for instant playback.
 * - Supports online video URLs as well as uploaded MP4 / WebM / MOV / OGG video files.
 * - Memory leak prevention via proper URL.revokeObjectURL on cleanup/replacement.
 */

import { useState, useEffect } from 'react';
import { toRootRelativePath } from './pathUtils';

const EVENT_NAME = 'portfolio_custom_video_updated';
const IDB_NAME = 'portfolio_video_storage';
const IDB_STORE = 'videos';

import persistedLinks from '../data/persistedLinks.json';

// In-memory cache for synchronous instant access
const videoCache = new Map<string, string>();
const rawBlobs = new Map<string, Blob>();
let isIdbInitialized = false;

// Preload any video links baked into persistedLinks.json
if (persistedLinks && typeof persistedLinks === 'object' && (persistedLinks as any).videos) {
  Object.entries((persistedLinks as any).videos).forEach(([k, v]) => {
    if (typeof v === 'string' && v.trim() && !v.startsWith('blob:') && !v.startsWith('data:')) {
      videoCache.set(k, v);
    }
  });
}

// Open or create IndexedDB
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Asynchronously load all stored videos into memory on startup
async function initVideoIndexedDB() {
  if (isIdbInitialized) return;
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const getAllReq = store.openCursor();

    getAllReq.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
      if (cursor) {
        const key = cursor.key as string;
        const value = cursor.value;

        if (value instanceof Blob) {
          rawBlobs.set(key, value);
          const objUrl = URL.createObjectURL(value);
          videoCache.set(key, objUrl);
        } else if (typeof value === 'string') {
          videoCache.set(key, value);
        }

        cursor.continue();
      } else {
        isIdbInitialized = true;
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { type: 'init' } }));
      }
    };
  } catch (err) {
    console.warn('Video IndexedDB initialization failed:', err);
  }
}

if (typeof window !== 'undefined') {
  initVideoIndexedDB();
}

export function isLocalUploadedVideo(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return false;
  return val.startsWith('blob:') || val.startsWith('data:');
}

/**
 * Synchronously get stored video URL (only keeps valid web links / embed URLs / root paths)
 */
export function getStoredVideo(key: string, fallback?: string): string | null {
  if (videoCache.has(key)) {
    const cached = videoCache.get(key) || null;
    if (isLocalUploadedVideo(cached)) return null;
    return toRootRelativePath(cached) || cached;
  }
  if (isLocalUploadedVideo(fallback)) return null;
  return toRootRelativePath(fallback) || fallback || null;
}

/**
 * Check if a custom video exists for this key (ignoring purged local blobs)
 */
export function hasStoredVideo(key: string): boolean {
  if (!videoCache.has(key)) return false;
  const val = videoCache.get(key);
  if (!val || isLocalUploadedVideo(val)) return false;
  return true;
}

/**
 * Clear all locally uploaded video blobs/files while keeping web/bilibili links
 */
export function clearLocalUploadedVideos(): void {
  rawBlobs.forEach((_, key) => {
    const url = videoCache.get(key);
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
    videoCache.delete(key);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key, videoUrl: null } }));
    }
  });
  rawBlobs.clear();

  // Purge any local blobs in IndexedDB
  if (typeof window !== 'undefined') {
    openIndexedDB().then((db) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.openCursor();
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          if (typeof cursor.value !== 'string' || isLocalUploadedVideo(cursor.value)) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }).catch(() => {});
  }
}

/**
 * Save video to IndexedDB and cache as ObjectURL or string
 */
export async function setStoredVideo(key: string, input: Blob | File | string): Promise<string> {
  // Revoke previous object URL if any to prevent memory leaks
  const prevUrl = videoCache.get(key);
  if (prevUrl && prevUrl.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(prevUrl);
    } catch {
      // ignore
    }
  }

  let finalUrl: string;

  if (typeof input === 'string') {
    finalUrl = toRootRelativePath(input) || input;
    rawBlobs.delete(key);
  } else {
    rawBlobs.set(key, input);
    finalUrl = URL.createObjectURL(input);
  }

  videoCache.set(key, finalUrl);

  // Dispatch event immediately so UI updates with zero delay
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key, videoUrl: finalUrl } }));

  // Persist into IndexedDB
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put(input, key);
  } catch (err) {
    console.warn('Failed to persist video to IndexedDB:', err);
  }

  return finalUrl;
}

/**
 * Remove stored video
 */
export async function removeStoredVideo(key: string): Promise<void> {
  const prevUrl = videoCache.get(key);
  if (prevUrl && prevUrl.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(prevUrl);
    } catch {
      // ignore
    }
  }

  videoCache.delete(key);
  rawBlobs.delete(key);

  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key, videoUrl: null } }));

  try {
    const db = await openIndexedDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.delete(key);
  } catch (err) {
    console.warn('Failed to delete video from IndexedDB:', err);
  }
}

/**
 * React hook for reactive video state
 */
export function useStoredVideo(key: string, fallback?: string) {
  const [videoUrl, setVideoUrlState] = useState<string | null>(() => getStoredVideo(key, fallback));

  useEffect(() => {
    setVideoUrlState(getStoredVideo(key, fallback));

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ key?: string; videoUrl?: string | null; type?: string }>;
      if (!customEvent.detail || customEvent.detail.key === key || customEvent.detail.type === 'init') {
        setVideoUrlState(getStoredVideo(key, fallback));
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, [key, fallback]);

  const setVideo = async (input: Blob | File | string) => {
    return await setStoredVideo(key, input);
  };

  const removeVideo = async () => {
    await removeStoredVideo(key);
  };

  const isCustom = hasStoredVideo(key);

  return { videoUrl, setVideo, removeVideo, isCustom };
}
