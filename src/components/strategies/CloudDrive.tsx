'use client';

import { useState } from 'react';
import { CloudDriveConfig } from '@/lib/strategy-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Download, UserPlus, CheckCircle } from 'lucide-react';

interface CloudDriveProps {
  affiliateUrl: string;
  config: CloudDriveConfig;
}

export default function CloudDrive({ affiliateUrl, config }: CloudDriveProps) {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const extractCode = config.extractCode || '8888';
  const fileContent = config.fileContent || '感謝您的下載！\n\n這是您的專屬內容。';
  const fileName = config.fileName || '分享資料.txt';

  // 隨機生成分享者名稱（部分遮蔽）
  const randomNames = [
    'Joh**son', 'Mic**ael', 'Ale**nder', 'Chr**tina', 'Eli**beth',
    'Wil**am', 'Jes**ca', 'Dan**el', 'Nic**las', 'Kat**rine',
    'Mat**ew', 'Ste**en', 'Jen**fer', 'And**ew', 'Reb**ca',
    'Jam**s', 'Vic**ria', 'Rob**t', 'Sam**tha', 'Bra**ey',
  ];
  const [uploaderName] = useState(() => randomNames[Math.floor(Math.random() * randomNames.length)]);

  const handleExtract = () => {
    if (inputCode === extractCode) {
      setError('');
      // 開啟分潤連結
      window.open(affiliateUrl, '_blank');
      // 顯示下載成功彈窗
      setShowSuccess(true);
    } else {
      setError('提取碼錯誤，請重新輸入');
    }
  };

  const handleDownload = () => {
    // 創建 Blob 並下載
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleExtract();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f5ff] to-[#e8f0fe] flex flex-col">
      {/* Header */}
      <header className="py-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          {/* Logo */}
          <div className="w-10 h-10 relative">
            <div className="absolute w-5 h-5 bg-[#06a7ff] rounded-full top-0 left-1/2 -translate-x-1/2"></div>
            <div className="absolute w-5 h-5 bg-[#ff6b6b] rounded-full bottom-0 left-0"></div>
            <div className="absolute w-5 h-5 bg-[#ffa940] rounded-full bottom-0 right-0"></div>
          </div>
          <span className="text-3xl font-bold text-[#06a7ff]">嘟嘟網盤</span>
        </div>
        <p className="text-sm text-gray-500">讓美好永遠陪伴</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-lg">
          {/* Share Info Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* User Info */}
            <div className="bg-[#f7faff] px-6 py-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#06a7ff] to-[#0066cc] rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">👤</span>
                </div>
                <div>
                  <span className="text-gray-800 font-medium">{uploaderName}</span>
                  <span className="text-gray-600 ml-1">給您加密分享了文件</span>
                </div>
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#06a7ff] border border-[#06a7ff] rounded-full hover:bg-[#06a7ff] hover:text-white transition-colors">
                <UserPlus className="w-4 h-4" />
                加為好友
              </button>
            </div>

            {/* Extract Code Input */}
            <div className="px-6 py-8">
              <div className="text-center mb-6">
                <p className="text-gray-700 text-lg">請輸入提取碼：</p>
              </div>

              <div className="flex gap-3 max-w-xs mx-auto">
                <Input
                  type="text"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="請輸入提取碼"
                  maxLength={8}
                  className="text-center text-lg tracking-widest font-mono border-gray-300 focus:border-[#06a7ff] focus:ring-[#06a7ff]"
                />
                <Button
                  onClick={handleExtract}
                  className="bg-[#06a7ff] hover:bg-[#0596e6] text-white px-6 whitespace-nowrap"
                >
                  提取文件
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-center text-red-500 text-sm mt-3 animate-shake">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Promo Card */}
          <div className="mt-6 bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📷</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">一刻相冊</span>
                  <span className="text-xs text-[#06a7ff] bg-[#e6f4ff] px-2 py-0.5 rounded">嘟嘟網盤榮譽出品</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  無限空間 · 永久免費 · 照片原畫備份 · 下載不限速
                </p>
              </div>
            </div>
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-3 gap-0.5">
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400">
        <p>©2024 Dudu · 移動開放平台 | 服務協議 | 權利聲明 | 版本更新 | 幫助中心 | 問題反饋 | 版權投訴 | 帳號認證</p>
      </footer>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">提取成功！</DialogTitle>
            <DialogDescription className="text-center">
              文件已準備好，點擊下方按鈕下載
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📄</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{fileName}</p>
                  <p className="text-xs text-gray-500">文字檔案</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className="w-full bg-[#06a7ff] hover:bg-[#0596e6] text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              下載文件
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
