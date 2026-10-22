import React, { useState, useRef } from 'react';
import { Video, Upload, Link as LinkIcon, Trash2, X, Check, Film, AlertCircle, Play } from 'lucide-react';
import { useStoredVideo } from '../utils/videoStore';
import { toRootRelativePath } from '../utils/pathUtils';
import { analyzeVideoSource } from '../utils/videoUtils';

interface VideoUploadModalProps {
  videoKey: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  defaultFallback?: string;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  videoKey,
  title = '上传/更换视频体块',
  isOpen,
  onClose,
  defaultFallback,
}) => {
  const { videoUrl, setVideo, removeVideo, isCustom } = useStoredVideo(videoKey, defaultFallback);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|m4v|ogg)$/i)) {
      setErrorMsg('请选择有效的视频文件（支持 MP4、WebM、MOV、OGG 等格式）');
      return;
    }
    // Clean up previous preview url if created
    if (previewBlobUrl && previewBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setSelectedFile(file);
    const objUrl = URL.createObjectURL(file);
    setPreviewBlobUrl(objUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleConfirmFileUpload = async () => {
    if (!selectedFile) return;
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      await setVideo(selectedFile);
      setSuccessMsg('视频已成功保存并载入！');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('视频保存失败，请检查文件后重试。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = urlInput.trim();
    if (!raw) return;

    const sourceInfo = analyzeVideoSource(raw);
    const finalUrl = sourceInfo?.embedUrl || toRootRelativePath(raw) || raw;

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      await setVideo(finalUrl);
      setSuccessMsg(sourceInfo?.type === 'bilibili' ? 'Bilibili 视频已成功载入！' : '视频已成功载入！');
      setUrlInput('');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      setErrorMsg('保存视频路径失败，请确认文件路径或链接可直接访问。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearVideo = async () => {
    await removeVideo();
    if (previewBlobUrl && previewBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setSelectedFile(null);
    setPreviewBlobUrl(null);
    setSuccessMsg('已移除视频体块内容！');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 600);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#FDFCF9] border border-neutral-300 shadow-2xl overflow-hidden text-neutral-900 select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-neutral-900 text-white flex items-center justify-center">
              <Film className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-serif-display font-medium text-base text-neutral-900">
                {title}
              </h3>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                VIDEO UPLOAD & ARCHIVE MANAGEMENT
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

        {/* Status Messages */}
        {successMsg && (
          <div className="px-6 py-2.5 bg-emerald-50 text-emerald-800 text-xs font-mono flex items-center gap-2 border-b border-emerald-100 animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="px-6 py-2.5 bg-rose-50 text-rose-800 text-xs font-mono flex items-center gap-2 border-b border-rose-100 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200 bg-neutral-50/80 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-neutral-900 text-neutral-900 bg-white font-medium'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>本地视频文件 (MP4 / WebM / MOV)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2.5 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'border-neutral-900 text-neutral-900 bg-white font-medium'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>在线视频 URL 链接</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mov,.ogg,.m4v"
                onChange={handleFileChange}
                className="hidden"
              />

              {!previewBlobUrl ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-300 hover:border-neutral-800 bg-neutral-50/60 hover:bg-neutral-100/80 transition-all p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-neutral-200 group-hover:bg-neutral-900 text-neutral-700 group-hover:text-white flex items-center justify-center transition-colors">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-medium text-neutral-900 block">
                      点击选择视频文件 或 拖拽至此处
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 mt-1 block">
                      支持 MP4、WebM、QuickTime MOV，高保真流畅播放
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-600 bg-white border border-neutral-300 px-3 py-1 shadow-xs">
                    BROWSE LOCAL VIDEO
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-video bg-black overflow-hidden border border-neutral-300">
                    <video
                      src={previewBlobUrl}
                      controls
                      autoPlay
                      muted
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {selectedFile && (
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-600 px-1">
                      <span className="truncate max-w-[260px] font-medium text-neutral-800">
                        {selectedFile.name}
                      </span>
                      <span>{formatFileSize(selectedFile.size)}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 border border-neutral-300 text-xs font-mono text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      重新选片
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmFileUpload}
                      disabled={isProcessing}
                      className="flex-1 py-2 px-3 bg-neutral-950 text-white text-xs font-mono hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isProcessing ? (
                        <span>正在写入存储...</span>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>确认载入此视频</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-600 block">
                  粘贴 Bilibili 视频链接、在线直链或相对网站根路径：
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://www.bilibili.com/video/BV... 或 /videos/xxx.mp4"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors pr-8"
                  />
                  <LinkIcon className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
                <p className="text-[10px] text-neutral-400 font-mono">
                  支持 Bilibili 链接（如 BV号页面或嵌入代码）、YouTube、MP4 直链及相对根路径（/videos/...）
                </p>
              </div>

              {urlInput.trim() && (() => {
                const sourceInfo = analyzeVideoSource(urlInput.trim());
                if (sourceInfo?.type === 'bilibili') {
                  return (
                    <div className="space-y-1.5">
                      <div className="aspect-video bg-black overflow-hidden border border-neutral-300 relative">
                        <iframe
                          src={sourceInfo.embedUrl}
                          scrolling="no"
                          frameBorder="0"
                          allowFullScreen
                          referrerPolicy="no-referrer"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                        <span className="text-emerald-700 font-medium">✓ 已识别 Bilibili 官方视频播放器</span>
                        <span>{sourceInfo.bvid ? `BV号: ${sourceInfo.bvid}` : '嵌入播放'}</span>
                      </div>
                    </div>
                  );
                }
                if (sourceInfo?.type === 'youtube' || sourceInfo?.type === 'iframe') {
                  return (
                    <div className="aspect-video bg-black overflow-hidden border border-neutral-300 relative">
                      <iframe
                        src={sourceInfo.embedUrl}
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen
                        referrerPolicy="no-referrer"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  );
                }
                return (
                  <div className="aspect-video bg-black overflow-hidden border border-neutral-300">
                    <video
                      src={toRootRelativePath(urlInput.trim()) || urlInput.trim()}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                );
              })()}

              <button
                type="submit"
                disabled={!urlInput.trim() || isProcessing}
                className="w-full py-2.5 bg-neutral-950 text-white text-xs font-mono hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? '正在验证并载入...' : '应用此视频链接'}
              </button>
            </form>
          )}

          {/* Current Video Info & Clear Action */}
          {(videoUrl || isCustom) && (
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-500 text-[11px]">
                当前体块已载入专属视频档案
              </span>
              <button
                type="button"
                onClick={handleClearVideo}
                className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:underline cursor-pointer text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>移除视频体块</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
