'use client';

import { useState, useEffect } from 'react';
import { ImageLinkConfig } from '@/lib/strategy-types';

interface ImageLinkProps {
  affiliateUrl: string;
  config?: ImageLinkConfig;
}

export default function ImageLink({ affiliateUrl, config }: ImageLinkProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const imageUrl = config?.imageUrl || 'https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=%E9%BB%9E%E6%93%8A%E6%9F%A5%E7%9C%8B%E8%A9%B3%E6%83%85';
  const altText = config?.altText || '點擊查看詳情';
  const showHint = config?.showHint !== false;
  const hintText = config?.hintText || '👆 點擊圖片查看詳情';
  const hintPosition = config?.hintPosition || 'bottom';
  const fitMode = config?.fitMode || 'cover';

  useEffect(() => {
    // 預載圖片
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setIsLoaded(true);
  }, [imageUrl]);

  const handleClick = () => {
    window.open(affiliateUrl, '_blank');
  };

  const getHintPositionStyles = () => {
    switch (hintPosition) {
      case 'top':
        return 'top-8';
      case 'center':
        return 'top-1/2 -translate-y-1/2';
      case 'bottom':
      default:
        return 'bottom-8';
    }
  };

  const getObjectFitClass = () => {
    switch (fitMode) {
      case 'contain':
        return 'object-contain';
      case 'fill':
        return 'object-fill';
      case 'cover':
      default:
        return 'object-cover';
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-lg">載入中...</p>
          </div>
        </div>
      )}

      {/* Clickable Image */}
      <div
        onClick={handleClick}
        className="relative w-full h-full cursor-pointer group transition-transform hover:scale-[1.02]"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
      >
        <img
          src={imageUrl}
          alt={altText}
          className={`w-full h-full ${getObjectFitClass()} transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Click Hint */}
        {showHint && (
          <div
            className={`absolute left-1/2 -translate-x-1/2 ${getHintPositionStyles()} z-10`}
          >
            <div className="px-6 py-3 bg-black/80 backdrop-blur-sm text-white rounded-full shadow-2xl border border-white/20 animate-bounce">
              <p className="text-sm md:text-base font-medium whitespace-nowrap">
                {hintText}
              </p>
            </div>
          </div>
        )}

        {/* Pulse Effect on Corners */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-3 h-3 bg-white rounded-full animate-ping" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-3 h-3 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </div>
  );
}
