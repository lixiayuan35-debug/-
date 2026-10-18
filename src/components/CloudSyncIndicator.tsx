import React, { useState, useEffect } from 'react';
import {
  subscribeSyncStatus,
  triggerFullCloudSync,
  SyncStatus,
} from '../utils/cloudSync';
import { Cloud, Check, RefreshCw, AlertCircle, Info, X } from 'lucide-react';

export const CloudSyncIndicator: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [count, setCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeSyncStatus((newStatus, newCount, err) => {
      setStatus(newStatus);
      setCount(newCount);
      if (err) setErrorMessage(err);
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    try {
      setLastSyncResult(null);
      const res = await triggerFullCloudSync();
      setLastSyncResult(`全量同步完成：已存证 ${res.total} 项媒体文件至云端`);
    } catch (e) {
      setLastSyncResult('同步过程中遇到网络波动，请稍后重试');
    }
  };

  return (
    <>
      {/* Floating Minimal Cloud Sync Status Pill (Bottom Left) */}
      <div className="fixed bottom-4 left-4 z-40 select-none">
        <div className="flex items-center gap-2 bg-[#F5F4F0]/90 backdrop-blur-md border border-neutral-300 shadow-md px-3 py-1.5 text-[11px] font-mono text-neutral-700">
          {/* Status Icon */}
          {status === 'syncing' ? (
            <RefreshCw className="w-3.5 h-3.5 text-neutral-800 animate-spin" />
          ) : status === 'error' ? (
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Cloud className="w-3.5 h-3.5 text-emerald-700" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-600" />
            </div>
          )}

          {/* Status Text */}
          <span className="tracking-wider">
            {status === 'syncing'
              ? '云端同步中...'
              : status === 'error'
              ? '云端连接中'
              : `云端已同步 · ${count} 项`}
          </span>

          {/* Sync Now / Info Buttons */}
          <div className="flex items-center gap-1.5 ml-1 border-l border-neutral-300 pl-2">
            <button
              onClick={handleManualSync}
              disabled={status === 'syncing'}
              className="hover:text-black transition-colors cursor-pointer disabled:opacity-50"
              title="点击立即双向同步云端与本地数据"
            >
              <RefreshCw className={`w-3 h-3 ${status === 'syncing' ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="hover:text-black transition-colors cursor-pointer text-neutral-400 hover:text-neutral-700"
              title="查看云端同步详情"
            >
              <Info className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Sync Information Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in select-none">
          <div className="relative w-full max-w-md bg-[#FBFBFA] border border-neutral-300 shadow-2xl p-6 text-neutral-900 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 mb-4">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif-display font-medium text-lg">云端媒体永久存证状态</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-neutral-600" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono text-neutral-600 leading-relaxed">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 space-y-1">
                <div className="font-medium flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Google Cloud Firestore 云端已接入</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  当前云端已存证 <strong>{count}</strong> 项图片与多媒体数据。
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-neutral-800 font-medium">关于 GitHub 发布后数据呈现原理：</div>
                <p>
                  1. 之前由于未开启云端数据库，上传的媒体只留存在本地浏览器缓存中，发布到 GitHub 换域名后会变为空白。
                </p>
                <p>
                  2. 现在已开通永久云端存储：只要在此处点击<strong>「全量同步」</strong>，所有媒体将实时上传至云端；您发布到 GitHub 的页面会自动连接同一云端数据库，所有访客与手机端均可直接正常浏览，无需二次上传。
                </p>
              </div>

              {lastSyncResult && (
                <div className="p-2 bg-neutral-100 border border-neutral-300 text-neutral-800 text-center font-medium">
                  {lastSyncResult}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  onClick={handleManualSync}
                  disabled={status === 'syncing'}
                  className="flex-1 py-2 px-4 bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${status === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>{status === 'syncing' ? '正在同步...' : '立即同步本地所有数据到云端'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
