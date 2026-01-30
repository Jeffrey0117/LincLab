'use client';

import React from 'react';
import Image from 'next/image';

interface ImageLinkConfig {
  imageUrl: string;
  altText?: string;
  fitMode?: 'cover' | 'contain' | 'fill';
  backgroundColor?: string;
  showHint?: boolean;
  hintText?: string;
  hintPosition?: 'top' | 'bottom';
}

interface ImageLinkProps {
  config: ImageLinkConfig;
}

const ImageLink: React.FC<ImageLinkProps> = ({ config }) => {
  const {
    imageUrl,
    altText,
    fitMode = 'cover',
    backgroundColor = '#ffffff',
    showHint = false,
    hintText = '點擊查看詳情',
    hintPosition = 'bottom'
  } = config;

  return (
    <div
      className="w-full h-full min-h-[400px] flex items-center justify-center relative"
      style={{ backgroundColor }}
    >
      <div className="relative w-full h-full">
        <Image
          src={imageUrl}
          alt={altText || 'Image'}
          fill
          style={{ objectFit: fitMode }}
          className="rounded-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        />
        {showHint && (
          <div className={`absolute ${hintPosition === 'top' ? 'top-4' : 'bottom-4'} left-0 right-0 flex justify-center`}>
            <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium animate-pulse">
              {hintText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLink;