'use client';

import React from 'react';
import { Facebook, Instagram, Youtube, Twitter, Linkedin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialPlatform {
  name: string;
  icon: string;
  url: string;
  username?: string;
  color?: string;
}

interface SocialMediaTemplateConfig {
  title?: string;
  description?: string;
  platforms: SocialPlatform[];
  layout?: 'grid' | 'list';
  showUsernames?: boolean;
}

interface SocialMediaTemplateProps {
  config: SocialMediaTemplateConfig;
}

const SocialMediaTemplate: React.FC<SocialMediaTemplateProps> = ({ config }) => {
  const {
    title,
    description,
    platforms,
    layout = 'grid',
    showUsernames = true,
  } = config;

  const getIcon = (iconName: string) => {
    const iconClass = "w-6 h-6";
    switch (iconName.toLowerCase()) {
      case 'facebook':
        return <Facebook className={iconClass} />;
      case 'instagram':
        return <Instagram className={iconClass} />;
      case 'youtube':
        return <Youtube className={iconClass} />;
      case 'twitter':
        return <Twitter className={iconClass} />;
      case 'linkedin':
        return <Linkedin className={iconClass} />;
      case 'line':
        return <span className="text-2xl">📱</span>;
      default:
        return <Globe className={iconClass} />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      {/* Header */}
      {(title || description) && (
        <div className="mb-8">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {platforms.map((platform, index) => (
            <a
              key={index}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div
                className="aspect-square rounded-lg flex flex-col items-center justify-center p-4 transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  backgroundColor: platform.color || '#f3f4f6',
                  color: platform.color ? '#ffffff' : '#1f2937',
                }}
              >
                <div className="mb-2">
                  {getIcon(platform.icon)}
                </div>
                <span className="font-semibold text-sm">{platform.name}</span>
                {showUsernames && platform.username && (
                  <span className="text-xs opacity-80 mt-1">
                    {platform.username}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* List Layout */}
      {layout === 'list' && (
        <div className="space-y-3">
          {platforms.map((platform, index) => (
            <a
              key={index}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="outline"
                className="w-full justify-start gap-3 p-4 h-auto hover:shadow-md"
                style={{
                  borderColor: platform.color,
                  color: platform.color,
                }}
              >
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: platform.color || '#f3f4f6',
                    color: '#ffffff',
                  }}
                >
                  {getIcon(platform.icon)}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{platform.name}</div>
                  {showUsernames && platform.username && (
                    <div className="text-sm opacity-70">{platform.username}</div>
                  )}
                </div>
              </Button>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialMediaTemplate;