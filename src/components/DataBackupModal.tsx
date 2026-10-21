import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, Upload, Database, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { getAllStoredImages, setStoredImage, setStoredCardRatio } from '../utils/imageStore';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<{ imagesCount: number; cardsLayoutCount: number; ratiosCount: number }>({
    imagesCount: 0,
    cardsLayoutCount: 0,
    ratiosCount: 0,
  });
  const [copied, setCopied] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Compute local data statistics
  useEffect(() => {
    if (!isOpen) return;

    try {
      const images = getAllStoredImages();
      let cardsLayoutCount = 0;
      let ratiosCount = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith('project_cards_')) cardsLayoutCount++;
        if (k?.startsWith('card_ratio_')) ratiosCount++;
      }

      setStats({
        imagesCount: Object.keys(images).length,
        cardsLayoutCount,
        ratiosCount,
      });
    } catch (err) {
      console.warn('Failed to compute backup stats:', err);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build full export JSON object
  const getFullBackupData = () => {
    const images = getAllStoredImages();
    const layouts: Record<string, any> = {};
    const ratios: Record<string, any> = {};
    const deletedCards: Record<string, any> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;

      if (k.startsWith('project_cards_')) {
        try {
          layouts[k] = JSON.parse(localStorage.getItem(k) || '[]');
        } catch {}
      } else if (k.startsWith('card_ratio_')) {
        try {
          ratios[k] = JSON.parse(localStorage.getItem(k) || '{}');
        } catch {}
      } else if (k.startsWith('project_deleted_cards_')) {
        try {
          deletedCards[k] = JSON.parse(localStorage.getItem(k) || '[]');
        } catch {}
      }
    }

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      images,
      layouts,
      ratios,
      deletedCards,
    };
  };

  // Download JSON file
  const handleDownload = () => {
    const data = getFullBackupData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy JSON to clipboard
  const handleCopy = async () => {
    try {
      const data = getFullBackupData();
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  // Import JSON file
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        if (data.images && typeof data.images === 'object') {
          Object.entries(data.images).forEach(([key, val]) => {
            if (typeof val === 'string') {
              setStoredImage(key, val);
            }
          });
        }

        if (data.layouts && typeof data.layouts === 'object') {
          Object.entries(data.layouts).forEach(([key, val]) => {
            localStorage.setItem(key, JSON.stringify(val));
          });
        }

        if (data.ratios && typeof data.ratios === 'object') {
          Object.entries(data.ratios).forEach(([key, val]) => {
            const cardId = key.replace('card_ratio_', '');
            setStoredCardRatio(cardId, val as any);
          });
        }

        if (data.deletedCards && typeof data.deletedCards === 'object') {
          Object.entries(data.deletedCards).forEach(([key, val]) => {
            localStorage.setItem(key, JSON.stringify(val));
          });
        }

        setImportStatus('导入成功！页面将自动刷新以应用新数据...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        setImportStatus('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#F5F4F0] border border-neutral-300 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          title="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase">
            [ PORTFOLIO DATA PERSISTENCE & EXPORT ]
          </div>
          <h2 className="text-2xl font-serif-display font-medium text-neutral-900">
            作品集数据备份与全网固化
          </h2>
        </div>

        {/* Explanation banner */}
        <div className="p-4 bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>为什么分享链接给其他人时，他们默认看不到您本地上传的图片？</span>
          </div>
          <p className="leading-relaxed text-amber-800 text-[11px]">
            当前在页面中更换的照片和视频保存在<strong>您当前浏览器的本地缓存</strong>中。要让别人打开网站链接时也能看到：只需将配置数据导出并发送给 AI 助手，AI 即可帮您<strong>直接固化进网站源代码</strong>，永久对全网所有访客生效！
          </p>
        </div>

        {/* Current Local Stats */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y border-neutral-200 font-mono text-center">
          <div className="p-2.5 bg-white border border-neutral-200/80">
            <div className="text-lg font-semibold text-neutral-900">{stats.imagesCount}</div>
            <div className="text-[10px] text-neutral-500 uppercase">已缓存图片</div>
          </div>
          <div className="p-2.5 bg-white border border-neutral-200/80">
            <div className="text-lg font-semibold text-neutral-900">{stats.cardsLayoutCount}</div>
            <div className="text-[10px] text-neutral-500 uppercase">作品卡片排版</div>
          </div>
          <div className="p-2.5 bg-white border border-neutral-200/80">
            <div className="text-lg font-semibold text-neutral-900">{stats.ratiosCount}</div>
            <div className="text-[10px] text-neutral-500 uppercase">比例自定设置</div>
          </div>
        </div>

        {/* Action 1: Export / Copy for AI Solidification */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-medium text-neutral-800">
            方案一：一键固化到网站（永久有效，全网访客可见）
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs tracking-wider transition-all cursor-pointer shadow-sm active:scale-[0.99]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '已复制！请直接粘贴给 AI 助手' : '复制全部配置数据'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 font-mono text-xs tracking-wider transition-all cursor-pointer shadow-xs active:scale-[0.99]"
              title="下载完整备份文件"
            >
              <Download className="w-4 h-4" />
              <span>下载 JSON 备份</span>
            </button>
          </div>
          <p className="text-[11px] text-neutral-500 font-sans-body">
            💡 点击“复制全部配置数据”后，直接在对话框中发给 AI 助手并说：“<strong>这是我的作品数据，请帮我写入网站源码固化</strong>”，即可自动合并进默认数据！
          </p>
        </div>

        {/* Action 2: Import backup on other devices */}
        <div className="space-y-3 pt-3 border-t border-neutral-200">
          <div className="text-xs font-mono font-medium text-neutral-800">
            方案二：在其他设备恢复或导入
          </div>
          <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-200/60 hover:bg-neutral-200 text-neutral-700 font-mono text-xs tracking-wider transition-all cursor-pointer border border-neutral-300/70 border-dashed">
            <Upload className="w-4 h-4" />
            <span>从本地 JSON 备份文件导入</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
          {importStatus && (
            <div className="text-xs font-mono text-neutral-700 bg-neutral-100 p-2 border border-neutral-200 text-center">
              {importStatus}
            </div>
          )}
        </div>

        {/* Action 3: Video advice */}
        <div className="p-3 bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
          <div className="font-semibold text-neutral-800 font-mono">关于高清视频作品的建议：</div>
          <p className="leading-relaxed">
            视频文件通常体积较大，建议上传至 Bilibili、YouTube、腾讯云或七牛云图床，然后在作品详情页中输入<strong>公网视频链接</strong>。这样不仅加载飞快，而且所有访客在任何设备都能直接流畅播放。
          </p>
        </div>
      </div>
    </div>
  );
};
