'use client';

import { useState, useEffect } from 'react';
import { BeautyTemplateConfig } from '@/lib/strategy-types';
import { ChevronLeft, ChevronRight, Heart, Share2, Sparkles } from 'lucide-react';

interface BeautyTemplateProps {
  affiliateUrl: string;
  config?: BeautyTemplateConfig;
}

export default function BeautyTemplate({ affiliateUrl, config }: BeautyTemplateProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState<boolean[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 獲取配置
  const images = config?.images || [
    'https://via.placeholder.com/1080x1350/FF69B4/FFFFFF?text=Beauty+1',
    'https://via.placeholder.com/1080x1350/FFB6C1/FFFFFF?text=Beauty+2',
    'https://via.placeholder.com/1080x1350/FFC0CB/FFFFFF?text=Beauty+3',
  ];
  const title = config?.title || '精選美圖集';
  const description = config?.description || '點擊圖片查看完整內容';
  const layout = config?.layout || 'carousel';

  // 預載所有圖片
  useEffect(() => {
    setIsLoaded(new Array(images.length).fill(false));

    images.forEach((url, index) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setIsLoaded((prev) => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
        setImagesLoaded((prev) => prev + 1);
      };
    });
  }, [images]);

  const handleClick = () => {
    window.open(affiliateUrl, '_blank');
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsAutoPlaying(false);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsAutoPlaying(false);
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
    setIsAutoPlaying(false);
  };

  // 自動播放（輪播模式）
  useEffect(() => {
    if (layout !== 'carousel' || !isAutoPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000); // 每4秒切換

    return () => clearInterval(interval);
  }, [images.length, layout, isAutoPlaying]);

  // Loading State
  if (imagesLoaded < images.length) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium">載入美圖中...</p>
          <p className="text-sm text-muted-foreground">
            {imagesLoaded} / {images.length}
          </p>
        </div>
      </div>
    );
  }

  // 輪播模式
  if (layout === 'carousel') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-6 text-white">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-pink-400 animate-pulse" />
              <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
              <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
            </div>
            {description && (
              <p className="text-base md:text-lg opacity-90">{description}</p>
            )}
          </div>
        </div>

        {/* Main Image Container */}
        <div
          onClick={handleClick}
          className="relative w-full max-w-2xl aspect-[3/4] md:aspect-[4/5] mx-auto cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick();
            }
          }}
        >
          <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
            <img
              src={images[currentImageIndex]}
              alt={`${title} - 圖片 ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all duration-200"
                  aria-label="上一張"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all duration-200"
                  aria-label="下一張"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">
                {currentImageIndex + 1} / {images.length}
              </span>
            </div>

            {/* Interactive Elements */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 text-white">
                <Heart className="h-5 w-5 animate-pulse text-pink-400" />
                <span className="text-sm">點擊查看更多</span>
              </div>
              <div className="flex gap-2">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                  <Share2 className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleDotClick(index, e)}
                className={`transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'w-8 h-2 bg-white rounded-full'
                    : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/70'
                }`}
                aria-label={`圖片 ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 網格模式
  if (layout === 'grid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 p-4 md:p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-pink-500 animate-pulse" />
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
          </div>
          {description && (
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">{description}</p>
          )}
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {images.map((image, index) => (
              <div
                key={index}
                onClick={handleClick}
                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleClick();
                  }
                }}
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-pink-100 to-purple-100 dark:from-gray-800 dark:to-gray-700">
                  <img
                    src={image}
                    alt={`${title} - 圖片 ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold text-base">圖片 {index + 1}/{images.length}</p>
                    <p className="text-white/90 text-sm mt-1">點擊查看詳情</p>
                  </div>
                </div>

                {/* Heart Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="max-w-7xl mx-auto mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-xl animate-pulse">
            <span className="text-xl">💝</span>
            <span className="font-medium">點擊任意圖片查看完整內容</span>
          </div>
        </div>
      </div>
    );
  }

  // 瀑布流模式
  if (layout === 'masonry') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg mb-8 -mx-4 md:-mx-8 px-4 md:px-8 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {title}
            </h1>
            {description && (
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">{description}</p>
            )}
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6">
            {images.map((image, index) => (
              <div
                key={index}
                onClick={handleClick}
                className="relative group cursor-pointer mb-4 md:mb-6 break-inside-avoid"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleClick();
                  }
                }}
              >
                <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
                  <img
                    src={image}
                    alt={`${title} - 圖片 ${index + 1}`}
                    className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-medium text-sm">點擊查看更多</p>
                    </div>
                  </div>

                  {/* Heart Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 text-pink-500 p-2 rounded-full backdrop-blur-sm transform transition-transform duration-300 group-hover:scale-110">
                    <svg
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="max-w-7xl mx-auto mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-xl animate-pulse">
            <span className="text-xl">💝</span>
            <span className="font-medium">點擊任意圖片查看完整內容</span>
          </div>
        </div>
      </div>
    );
  }

  // 預設返回輪播模式
  return null;
}