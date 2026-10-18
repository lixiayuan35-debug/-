import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, ensureAuth } from '../firebase';
import {
  getAllStoredImages,
  setStoredImage,
  getStoredCardRatio,
  setStoredCardRatio,
  getKeyAliases,
} from './imageStore';
import {
  getStoredVideo,
  setStoredVideo,
} from './videoStore';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface SyncListener {
  (status: SyncStatus, count: number, errorMsg?: string): void;
}

const listeners = new Set<SyncListener>();
let currentStatus: SyncStatus = 'idle';
let currentSyncedCount = 0;
let lastErrorMessage = '';
let isSyncInProgress = false;

// Sanitize document ID to conform with Firestore rules /^[a-zA-Z0-9_-]+$/
function sanitizeDocId(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
}

export function subscribeSyncStatus(listener: SyncListener) {
  listeners.add(listener);
  listener(currentStatus, currentSyncedCount, lastErrorMessage);
  return () => {
    listeners.delete(listener);
  };
}

function updateStatus(status: SyncStatus, count?: number, errorMsg?: string) {
  currentStatus = status;
  if (count !== undefined) currentSyncedCount = count;
  if (errorMsg !== undefined) lastErrorMessage = errorMsg;
  listeners.forEach((fn) => fn(currentStatus, currentSyncedCount, lastErrorMessage));
}

/**
 * Push a single image to Firestore cloud storage
 */
export async function syncImageToCloud(key: string, dataUrl: string) {
  if (!dataUrl || !key) return;
  try {
    await ensureAuth();
    const docId = sanitizeDocId(key);
    const mediaRef = doc(db, 'portfolio_media', docId);

    // Check if card ratio exists for this key
    const cardRatio = getStoredCardRatio(key.replace(/^card-/, ''));

    await setDoc(
      mediaRef,
      {
        id: docId,
        key: key,
        data: dataUrl,
        mediaType: 'image',
        ratio: cardRatio?.aspectRatio || '',
        customWidth: cardRatio?.customWidth || 0,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    // Update global state heartbeat
    await setDoc(
      doc(db, 'portfolio_state', 'global'),
      {
        id: 'global',
        lastSyncedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn(`Failed to sync image ${key} to cloud:`, err);
  }
}

/**
 * Push a single video to Firestore cloud storage
 */
export async function syncVideoToCloud(key: string, videoUrl: string) {
  if (!videoUrl || !key) return;
  try {
    await ensureAuth();
    const docId = sanitizeDocId(key);
    const mediaRef = doc(db, 'portfolio_media', docId);

    await setDoc(
      mediaRef,
      {
        id: docId,
        key: key,
        data: videoUrl,
        mediaType: 'video',
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn(`Failed to sync video ${key} to cloud:`, err);
  }
}

/**
 * Bi-directional Cloud Synchronization:
 * 1. Pulls all cloud media from Firestore and writes to local memory/storage.
 * 2. Uploads any locally uploaded media that hasn't made it to the cloud yet.
 */
export async function triggerFullCloudSync(): Promise<{
  downloaded: number;
  uploaded: number;
  total: number;
}> {
  if (isSyncInProgress) {
    return { downloaded: 0, uploaded: 0, total: currentSyncedCount };
  }
  isSyncInProgress = true;
  updateStatus('syncing');

  let downloadedCount = 0;
  let uploadedCount = 0;

  try {
    await ensureAuth();
    const mediaCol = collection(db, 'portfolio_media');
    const snapshot = await getDocs(mediaCol);

    const cloudKeys = new Set<string>();

    // Step 1: Download all items from cloud into local cache
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const rawKey = (data.key || docSnap.id) as string;
      const mediaType = data.mediaType as string;
      const payload = data.data as string;

      cloudKeys.add(docSnap.id);
      cloudKeys.add(rawKey);

      if (mediaType === 'image' && payload) {
        // Save to local cache without triggering immediate upload loop
        setStoredImage(rawKey, payload);
        if (data.ratio) {
          setStoredCardRatio(rawKey.replace(/^card-/, ''), {
            aspectRatio: data.ratio,
            customWidth: data.customWidth || undefined,
          });
        }
        downloadedCount++;
      } else if (mediaType === 'video' && payload) {
        setStoredVideo(rawKey, payload);
        downloadedCount++;
      }
    });

    // Step 2: Upload all existing local images that are not yet in the cloud
    const localImages = getAllStoredImages();
    for (const [key, dataUrl] of Object.entries(localImages)) {
      if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image')) {
        const docId = sanitizeDocId(key);
        // Avoid duplicate aliases upload
        if (!cloudKeys.has(docId) && !cloudKeys.has(key)) {
          const cardRatio = getStoredCardRatio(key.replace(/^card-/, ''));
          await setDoc(doc(db, 'portfolio_media', docId), {
            id: docId,
            key: key,
            data: dataUrl,
            mediaType: 'image',
            ratio: cardRatio?.aspectRatio || '',
            customWidth: cardRatio?.customWidth || 0,
            updatedAt: Date.now(),
          });
          cloudKeys.add(docId);
          uploadedCount++;
        }
      }
    }

    const totalMedia = cloudKeys.size;
    updateStatus('synced', totalMedia);

    // Update global sync heartbeat
    await setDoc(
      doc(db, 'portfolio_state', 'global'),
      {
        id: 'global',
        lastSyncedAt: Date.now(),
        totalMediaItems: totalMedia,
      },
      { merge: true }
    );

    isSyncInProgress = false;
    return { downloaded: downloadedCount, uploaded: uploadedCount, total: totalMedia };
  } catch (err) {
    console.error('Cloud synchronization error:', err);
    updateStatus('error', currentSyncedCount, (err as Error).message);
    isSyncInProgress = false;
    throw err;
  }
}

/**
 * Initialize real-time cloud sync listener:
 * When changes occur in Firestore, immediately update local cache
 */
export function initRealtimeCloudSync() {
  if (typeof window === 'undefined') return;

  try {
    ensureAuth().then(() => {
      // First run immediate initial pull
      triggerFullCloudSync().catch((err) => {
        console.warn('Initial cloud sync notice:', err);
      });

      // Realtime listener for cross-tab, cross-device updates
      const mediaCol = collection(db, 'portfolio_media');
      onSnapshot(
        mediaCol,
        (snapshot) => {
          let hasUpdates = false;
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const data = change.doc.data();
              const rawKey = (data.key || change.doc.id) as string;
              const payload = data.data as string;
              const mediaType = data.mediaType as string;

              if (mediaType === 'image' && payload) {
                setStoredImage(rawKey, payload);
                if (data.ratio) {
                  setStoredCardRatio(rawKey.replace(/^card-/, ''), {
                    aspectRatio: data.ratio,
                    customWidth: data.customWidth || undefined,
                  });
                }
                hasUpdates = true;
              } else if (mediaType === 'video' && payload) {
                setStoredVideo(rawKey, payload);
                hasUpdates = true;
              }
            }
          });

          if (hasUpdates) {
            updateStatus('synced', snapshot.size);
          }
        },
        (error) => {
          console.warn('Firestore realtime listener notice:', error);
        }
      );
    });
  } catch (err) {
    console.warn('Realtime cloud sync setup skipped:', err);
  }
}
