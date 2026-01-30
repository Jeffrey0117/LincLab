'use client';

import React from 'react';
import Image from 'next/image';
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductShowcaseConfig {
  productName: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  images: string[];
  features?: string[];
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  rating?: number;
  reviewCount?: number;
}

interface ProductShowcaseProps {
  config: ProductShowcaseConfig;
}

const ProductShowcase: React.FC<ProductShowcaseProps> = ({ config }) => {
  const {
    productName,
    price,
    originalPrice,
    discount,
    images,
    features,
    description,
    ctaText = '立即購買',
    rating,
    reviewCount,
  } = config;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            {images[0] && (
              <Image
                src={images[0]}
                alt={productName}
                fill
                style={{ objectFit: 'cover' }}
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80"
                >
                  <Image
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{productName}</h1>

            {/* Rating */}
            {rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {rating} {reviewCount && `(${reviewCount} 評價)`}
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-red-600">{price}</span>
              {originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {originalPrice}
                </span>
              )}
              {discount && (
                <Badge variant="destructive">{discount}</Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-gray-600">{description}</p>
          )}

          {/* Features */}
          {features && features.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">產品特色</h3>
              <ul className="space-y-1">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full" size="lg">
              <ShoppingCart className="w-4 h-4 mr-2" />
              {ctaText}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Heart className="w-4 h-4 mr-2" />
                收藏
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;