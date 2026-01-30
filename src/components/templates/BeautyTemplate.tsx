'use client';

import React from 'react';
import Image from 'next/image';

interface BeautyTemplateConfig {
  images: string[];
  title?: string;
  description?: string;
  layout?: 'grid' | 'carousel';
  columns?: number;
  spacing?: 'tight' | 'normal' | 'wide';
}

interface BeautyTemplateProps {
  config: BeautyTemplateConfig;
}

const BeautyTemplate: React.FC<BeautyTemplateProps> = ({ config }) => {
  const {
    images,
    title,
    description,
    layout = 'grid',
    columns = 2,
    spacing = 'normal'
  } = config;

  const getSpacingClass = () => {
    switch (spacing) {
      case 'tight': return 'gap-2';
      case 'wide': return 'gap-6';
      default: return 'gap-4';
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      {(title || description) && (
        <div className="mb-6 text-center">
          {title && (
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
          )}
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}

      {/* Grid Layout */}
      {layout === 'grid' && (
        <div
          className={`grid ${getSpacingClass()}`}
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <Image
                src={image}
                alt={`Beauty ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                className="hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Carousel Layout (簡化版預覽) */}
      {layout === 'carousel' && (
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative flex-none w-80 aspect-[4/5] rounded-lg overflow-hidden bg-gray-100 snap-center"
              >
                <Image
                  src={image}
                  alt={`Beauty ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BeautyTemplate;