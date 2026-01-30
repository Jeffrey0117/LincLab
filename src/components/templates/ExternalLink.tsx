'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink as LinkIcon } from 'lucide-react';

interface ExternalLinkConfig {
  targetUrl: string;
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
  favicon?: string;
}

interface ExternalLinkProps {
  config: ExternalLinkConfig;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({ config }) => {
  const { targetUrl, customTitle, customDescription, customImage, favicon } = config;

  // 從 URL 提取域名
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {customImage && (
          <div className="relative w-full h-48 bg-gray-100">
            <Image
              src={customImage}
              alt={customTitle || 'Preview'}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            {favicon && (
              <div className="relative w-6 h-6 shrink-0 mt-1">
                <Image
                  src={favicon}
                  alt="Site icon"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 truncate">
                {customTitle || getDomain(targetUrl)}
              </h3>

              {customDescription && (
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {customDescription}
                </p>
              )}

              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <LinkIcon className="w-3 h-3" />
                <span className="truncate">{getDomain(targetUrl)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalLink;