'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ComparisonItem {
  title: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

interface ComparisonTemplateConfig {
  title?: string;
  items: ComparisonItem[];
}

interface ComparisonTemplateProps {
  config: ComparisonTemplateConfig;
}

const ComparisonTemplate: React.FC<ComparisonTemplateProps> = ({ config }) => {
  const { title, items } = config;

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "relative rounded-lg border-2 p-6 space-y-6",
              item.highlighted
                ? "border-primary shadow-lg scale-105"
                : "border-gray-200"
            )}
          >
            {item.highlighted && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                最受歡迎
              </Badge>
            )}

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">{item.title}</h3>
              <div className="text-3xl font-bold text-primary">
                {item.price}
              </div>
            </div>

            <div className="space-y-3">
              {item.features.map((feature, fIndex) => (
                <div key={fIndex} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              variant={item.highlighted ? "default" : "outline"}
            >
              {item.ctaText || '選擇方案'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonTemplate;