import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Mail, Phone } from 'lucide-react';
import { useStoredImage } from '../utils/imageStore';

interface ContactQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Crisp stylized QR code matrix pattern generator
const generateQrMatrix = (seed: number) => {
  const size = 25;
  const cells: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

  // Top-left finder pattern
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
        cells[r][c] = true;
      }
    }
  }

  // Top-right finder pattern
  for (let r = 0; r < 7; r++) {
    for (let c = size - 7; c < size; c++) {
      const relC = c - (size - 7);
      if (r === 0 || r === 6 || relC === 0 || relC === 6 || (r >= 2 && r <= 4 && relC >= 2 && relC <= 4)) {
        cells[r][c] = true;
      }
    }
  }

  // Bottom-left finder pattern
  for (let r = size - 7; r < size; r++) {
    const relR = r - (size - 7);
    for (let c = 0; c < 7; c++) {
      if (relR === 0 || relR === 6 || c === 0 || c === 6 || (relR >= 2 && relR <= 4 && c >= 2 && c <= 4)) {
        cells[r][c] = true;
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // Center logo cutout
  const centerStart = 9;
  const centerEnd = 15;

  // Pseudo-random data based on seed
  let state = seed;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder zones & separators
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= size - 8) ||
        (r >= size - 8 && c < 8) ||
        (r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) ||
        (r === 6 && c >= 8 && c < size - 8) ||
        (c === 6 && r >= 8 && r < size - 8)
      ) {
        continue;
      }
      state = (state * 9301 + 49297) % 233280;
      cells[r][c] = (state / 233280) > 0.46;
    }
  }

  return cells;
};

const wechatQrCells = generateQrMatrix(10823);
const douyinQrCells = generateQrMatrix(48271);

export const ContactQrModal: React.FC<ContactQrModalProps> = ({ isOpen, onClose }) => {
  const { imageUrl: customWechatQr } = useStoredImage('contact_qr_wechat');
  const { imageUrl: customDouyinQr } = useStoredImage('contact_qr_douyin');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`已复制${label}: ${text}`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-neutral-900 text-white border border-neutral-700 px-4 py-2 text-xs font-mono tracking-wider shadow-2xl rounded flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}



      {/* Main Modal Card */}
      <div className="relative w-full max-w-3xl bg-[#FBFBFA] border border-neutral-300 shadow-2xl text-neutral-900 z-10 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-neutral-200 bg-white/70 backdrop-blur-sm">
          <div>
            <div className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase">
              INTERACTION & SOCIAL MATRIX
            </div>
            <h3 className="text-xl sm:text-2xl font-serif-display font-medium text-neutral-900">
              联络方式与社交平台二维码
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-neutral-200 hover:border-neutral-900 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer bg-white"
            title="关闭 (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Two QR Code Cards */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* CARD 1: 微信二维码 (WeChat QR Code) */}
            <div className="flex flex-col bg-white border border-neutral-200/90 p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Badge & Title */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#07C160]/10 flex items-center justify-center text-[#07C160]">
                    {/* WeChat Icon */}
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M8.5 4.5C4.36 4.5 1 7.41 1 11c0 1.98 1.01 3.76 2.61 4.96-.13.75-.46 2.05-.51 2.3-.06.27.1.33.26.23.13-.08 1.93-1.28 2.68-1.78.78.2 1.61.31 2.46.31.25 0 .5-.01.74-.03-.23-.62-.36-1.28-.36-1.99 0-3.31 3.13-6 7-6 .18 0 .36.01.54.02C15.22 6.09 12.14 4.5 8.5 4.5zm-2.25 4a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zm4.5 0a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM15.5 10c-3.31 0-6 2.24-6 5s2.69 5 6 5c.67 0 1.32-.09 1.94-.25.6.4 2.04 1.36 2.14 1.42.13.08.26.03.21-.18-.04-.2-.3-1.24-.41-1.84 1.28-.96 2.12-2.38 2.12-3.95 0-2.76-2.69-5-6-5zm-1.75 3.25a1 1 0 110 2 1 1 0 010-2zm3.5 0a1 1 0 110 2 1 1 0 010-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-neutral-900 tracking-tight">微信二维码</h4>
                    <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">WECHAT QR CODE</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200">
                    即时沟通
                  </span>
                </div>
              </div>

              {/* QR Code Graphic Frame */}
              <div
                className="relative my-5 mx-auto p-4 bg-white border border-neutral-200 shadow-inner flex flex-col items-center justify-center select-none"
              >
                {customWechatQr ? (
                  <img
                    src={customWechatQr}
                    alt="微信二维码"
                    referrerPolicy="no-referrer"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                ) : (
                  <div className="relative w-48 h-48 sm:w-52 sm:h-52 bg-white flex items-center justify-center">
                    {/* SVG generated crisp WeChat QR Pattern */}
                    <svg viewBox="0 0 25 25" className="w-full h-full text-neutral-900 shape-rendering-crispEdges">
                      {wechatQrCells.map((row, r) =>
                        row.map((val, c) =>
                          val ? (
                            <rect
                              key={`${r}-${c}`}
                              x={c}
                              y={r}
                              width="1.01"
                              height="1.01"
                              fill="currentColor"
                            />
                          ) : null
                        )
                      )}
                    </svg>
                    {/* Center WeChat Logo Badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 bg-white rounded-md p-1 shadow-md border border-neutral-200 flex items-center justify-center">
                        <div className="w-7 h-7 rounded bg-[#07C160] flex items-center justify-center text-white">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M8.5 4.5C4.36 4.5 1 7.41 1 11c0 1.98 1.01 3.76 2.61 4.96-.13.75-.46 2.05-.51 2.3-.06.27.1.33.26.23.13-.08 1.93-1.28 2.68-1.78.78.2 1.61.31 2.46.31.25 0 .5-.01.74-.03-.23-.62-.36-1.28-.36-1.99 0-3.31 3.13-6 7-6 .18 0 .36.01.54.02C15.22 6.09 12.14 4.5 8.5 4.5zm-2.25 4a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zm4.5 0a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM15.5 10c-3.31 0-6 2.24-6 5s2.69 5 6 5c.67 0 1.32-.09 1.94-.25.6.4 2.04 1.36 2.14 1.42.13.08.26.03.21-.18-.04-.2-.3-1.24-.41-1.84 1.28-.96 2.12-2.38 2.12-3.95 0-2.76-2.69-5-6-5zm-1.75 3.25a1 1 0 110 2 1 1 0 010-2zm3.5 0a1 1 0 110 2 1 1 0 010-2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-2 text-[11px] font-mono text-neutral-500 tracking-wider">
                  扫一扫上面的二维码图案，加我为朋友
                </div>
              </div>

              {/* Account info & Copy */}
              <div className="bg-neutral-50 p-3 border border-neutral-200/70 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 block uppercase">微信号 / 手机</span>
                  <span className="text-xs sm:text-sm font-mono font-medium text-neutral-900">
                    13068767831
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard('13068767831', '微信号', 'wechat')}
                  className="px-2.5 py-1 text-xs font-mono bg-white border border-neutral-300 hover:border-neutral-800 text-neutral-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedKey === 'wechat' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'wechat' ? '已复制' : '复制'}</span>
                </button>
              </div>

            </div>

            {/* CARD 2: 抖音二维码 (Douyin QR Code) */}
            <div className="flex flex-col bg-white border border-neutral-200/90 p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Badge & Title */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white">
                    {/* Douyin Musical Note Icon */}
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.889-2.89 2.89 2.89 0 0 1 2.89-2.89c.394 0 .768.08 1.11.222V9.45a6.34 6.34 0 0 0-1.11-.098A6.334 6.334 0 0 0 3.16 15.686a6.334 6.334 0 0 0 6.335 6.334 6.334 6.334 0 0 0 6.334-6.334V9.012a8.214 8.214 0 0 0 4.96 1.638v-3.47a4.78 4.78 0 0 1-1.2-.494z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-neutral-900 tracking-tight">抖音二维码</h4>
                    <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">DOUYIN QR CODE</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200">
                    视频展讯
                  </span>
                </div>
              </div>

              {/* QR Code Graphic Frame */}
              <div
                className="relative my-5 mx-auto p-4 bg-white border border-neutral-200 shadow-inner flex flex-col items-center justify-center select-none"
              >
                {customDouyinQr ? (
                  <img
                    src={customDouyinQr}
                    alt="抖音二维码"
                    referrerPolicy="no-referrer"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                ) : (
                  <div className="relative w-48 h-48 sm:w-52 sm:h-52 bg-white flex items-center justify-center">
                    {/* SVG generated crisp Douyin QR Pattern */}
                    <svg viewBox="0 0 25 25" className="w-full h-full text-neutral-900 shape-rendering-crispEdges">
                      {douyinQrCells.map((row, r) =>
                        row.map((val, c) =>
                          val ? (
                            <rect
                              key={`${r}-${c}`}
                              x={c}
                              y={r}
                              width="1.01"
                              height="1.01"
                              fill="currentColor"
                            />
                          ) : null
                        )
                      )}
                    </svg>
                    {/* Center Douyin Logo Badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 bg-white rounded-full p-1 shadow-md border border-neutral-200 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center text-white">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.889-2.89 2.89 2.89 0 0 1 2.89-2.89c.394 0 .768.08 1.11.222V9.45a6.34 6.34 0 0 0-1.11-.098A6.334 6.334 0 0 0 3.16 15.686a6.334 6.334 0 0 0 6.335 6.334 6.334 6.334 0 0 0 6.334-6.334V9.012a8.214 8.214 0 0 0 4.96 1.638v-3.47a4.78 4.78 0 0 1-1.2-.494z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-2 text-[11px] font-mono text-neutral-500 tracking-wider">
                  打开抖音 App · 扫描二维码关注主页
                </div>
              </div>

              {/* Account info & Copy */}
              <div className="bg-neutral-50 p-3 border border-neutral-200/70 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 block uppercase">抖音号 / 主页</span>
                  <span className="text-xs sm:text-sm font-mono font-medium text-neutral-900">
                    347202793/长瀛
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard('347202793/长瀛', '抖音号', 'douyin')}
                  className="px-2.5 py-1 text-xs font-mono bg-white border border-neutral-300 hover:border-neutral-800 text-neutral-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedKey === 'douyin' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'douyin' ? '已复制' : '复制'}</span>
                </button>
              </div>

            </div>

          </div>

          {/* Quick Direct Contacts Footer Bar */}
          <div className="mt-8 pt-5 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-neutral-600 bg-neutral-100/70 p-4">
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <a
                href="mailto:lixy716@163.com"
                className="flex items-center gap-2 hover:text-neutral-950 transition-colors group"
              >
                <Mail className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-900" />
                <span className="text-neutral-400">Email:</span>
                <span className="text-neutral-800 font-medium group-hover:underline">lixy716@163.com</span>
              </a>

              <a
                href="tel:13068767831"
                className="flex items-center gap-2 hover:text-neutral-950 transition-colors group"
              >
                <Phone className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-900" />
                <span className="text-neutral-400">Number:</span>
                <span className="text-neutral-800 font-medium group-hover:underline">13068767831</span>
              </a>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs tracking-wider transition-colors cursor-pointer self-end sm:self-auto"
            >
              完成返回
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
