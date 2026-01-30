'use client'

import React from 'react'
import { TemplateType, TemplateConfig } from '@/lib/strategy-types'
import ImageLink from '@/components/strategies/ImageLink'
import PreviewCard from '@/components/PreviewCard'
import BeautyTemplate from '@/components/strategies/BeautyTemplate'
import ArticleTemplate from '@/components/strategies/ArticleTemplate'
import CloudDrive from '@/components/strategies/CloudDrive'
import {
  ImageLinkConfig,
  ExternalLinkTemplateConfig,
  BeautyTemplateConfig,
  ArticleTemplateConfig,
  CloudDriveConfig,
} from '@/lib/strategy-types'

interface TemplateRendererProps {
  templateType: TemplateType
  templateConfig: TemplateConfig
  affiliateUrl: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  proxyContent?: string
}

export default function TemplateRenderer({
  templateType,
  templateConfig,
  affiliateUrl,
  ogTitle,
  ogDescription,
  ogImage,
  proxyContent,
}: TemplateRendererProps) {
  switch (templateType) {
    case 'image':
      return (
        <ImageLink
          affiliateUrl={affiliateUrl}
          config={templateConfig as ImageLinkConfig}
        />
      )

    case 'external_link':
      const externalConfig = templateConfig as ExternalLinkTemplateConfig
      return (
        <PreviewCard
          targetUrl={externalConfig.targetUrl}
          ogTitle={externalConfig.customTitle || ogTitle}
          ogDescription={externalConfig.customDescription || ogDescription}
          ogImage={externalConfig.customImage || ogImage}
          proxyContent={proxyContent}
          affiliateUrl={affiliateUrl}
        />
      )

    case 'beauty':
      return (
        <BeautyTemplate
          config={templateConfig as BeautyTemplateConfig}
          affiliateUrl={affiliateUrl}
        />
      )

    case 'article':
      return (
        <ArticleTemplate
          config={templateConfig as ArticleTemplateConfig}
        />
      )

    case 'cloud_drive':
      return (
        <CloudDrive
          affiliateUrl={affiliateUrl}
          config={templateConfig as CloudDriveConfig}
        />
      )

    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">不支援的模板類型</p>
        </div>
      )
  }
}