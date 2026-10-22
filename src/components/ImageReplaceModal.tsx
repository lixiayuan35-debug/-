import React, { useState, useRef } from 'react';
import { Camera, Upload, Link as LinkIcon, Trash2, X, Check, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useStoredImage, compressImageFileWithMeta } from '../utils/imageStore';
import { toRootRelativePath } from '../utils/pathUtils';

interface ImageReplaceModalProps {
  imageKey: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  defaultFallback?: string;
  onImageUploaded?: (dataUrl: string, width: number, height: number) => void;
}

export const ImageReplaceModal: React.FC<ImageReplaceModalProps> = ({
  imageKey,
  title = '更换作品照片',
  isOpen,
  onClose,
  defaultFallback,
  onImageUploaded,
}) => {
  const { imageUrl, setImage, removeImage, isCustom } = useStoredImage(imageKey, defaultFallback);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processAndSaveFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      const res = await compressImageFileWithMeta(file);
      if (res.dataUrl) {
        await setImage(res.dataUrl);
        onImageUploaded?.(res.dataUrl, res.width, res.height);
        setSuccessMsg('图片已成功上传并替换！');
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 900);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('图片读取失败，请检查文件格式或选择其他图片。');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndSaveFile(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processAndSaveFile(file);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = urlInput.trim();
    if (!raw) return;

    const normalizedUrl = toRootRelativePath(raw) || raw;

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      await setImage(normalizedUrl);

      // Attempt to read natural dimensions with no-referrer
      try {
        const img = new Image();
        img.referrerPolicy = 'no-referrer';
        img.onload = () => {
          onImageUploaded?.(normalizedUrl, img.naturalWidth || 800, img.naturalHeight || 600);
        };
        img.src = normalizedUrl;
      } catch {}

      setSuccessMsg('图片已成功应用！');
      setUrlInput('');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      setErrorMsg('保存图片路径失败，请确认文件路径或链接可直接访问。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearImage = () => {
    removeImage();
    setSuccessMsg('已清除作品底图/照片！');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-[#FDFCF9] border border-neutral-300 shadow-2xl overflow-hidden text-neutral-900 select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-neutral-700" />
            <h3 className="font-serif-display font-medium text-base text-neutral-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-none transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Image Preview */}
        <div className="p-6 space-y-5">
          <div className="relative w-full h-44 bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Current Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={() => {
                  console.warn('Preview image load error for:', imageUrl);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-400 gap-2 text-xs font-mono p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-neutral-200/70 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-neutral-500" />
                </div>
                <span className="font-medium text-neutral-600">底图已清除 · 呈现空白构图画布</span>
                <span className="text-[10px] text-neutral-400">点击下方即可上传您的项目高清实景照片</span>
              </div>
            )}

            {isCustom && (
              <span className="absolute top-2 right-2 bg-neutral-900 text-white text-[10px] font-mono px-2 py-0.5 shadow-sm">
                自定义照片已生效
              </span>
            )}
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-xs font-mono text-rose-800 bg-rose-50 border border-rose-200 px-3 py-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tabs: Local Upload vs URL */}
          <div className="flex border-b border-neutral-200 text-xs font-mono">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 text-center border-b-2 font-medium transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              本地图片上传
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 text-center border-b-2 font-medium transition-colors cursor-pointer ${
                activeTab === 'url'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              网络图片链接
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50/50 hover:bg-white p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-200 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center transition-colors">
                  <Upload className="w-5 h-5 text-neutral-700 group-hover:text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-neutral-800">
                    {isProcessing ? '正在处理并保存照片...' : '点击选择或拖入本地照片'}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                    支持所有常见图片格式 · 高保真轻量优化 · 永不丢失
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-600 block">
                  输入相对网站根路径或网络图片 URL：
                </label>
                <div className="flex items-center gap-2 border border-neutral-300 bg-white px-3 py-2 focus-within:border-neutral-900">
                  <LinkIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="/works/the-cubo/cover.jpg 或 https://..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full text-xs font-mono outline-none text-neutral-800 bg-transparent"
                    required
                  />
                </div>
                <p className="text-[10px] text-neutral-400 font-mono">
                  支持相对网站根路径（如 /works/...，文件放入 public 目录即可全网可见）
                </p>
              </div>

              {urlInput.trim() && (
                <div className="relative w-full h-32 bg-neutral-100 border border-neutral-300 overflow-hidden flex items-center justify-center">
                  <img
                    src={toRootRelativePath(urlInput.trim()) || urlInput.trim()}
                    alt="URL Live Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5">
                    实时效果预览
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || !urlInput.trim()}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-mono tracking-wider transition-colors cursor-pointer"
              >
                {isProcessing ? '正在处理...' : '确认应用图片'}
              </button>
            </form>
          )}

          {/* Clear base image / clear custom image option */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-xs font-mono">
            <span className="text-[10px] text-neutral-400">已清除默认底图</span>
            {isCustom && (
              <button
                onClick={handleClearImage}
                className="flex items-center gap-1.5 text-neutral-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清除照片 · 恢复空白底图</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
