'use client'

import React from 'react'
import { ArticleTemplateConfig } from '@/lib/strategy-types'

interface ArticleTemplateProps {
  config: ArticleTemplateConfig
}

export default function ArticleTemplate({ config }: ArticleTemplateProps) {
  const { title, content, authorName, publishDate, coverImage } = config

  // Format date if provided
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Image */}
      {coverImage && (
        <div className="w-full bg-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <img
                src={coverImage}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Article Container */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-8">
          {title}
        </h1>

        {/* Author Info */}
        {(authorName || publishDate) && (
          <div className="flex items-center gap-4 pb-8 mb-8 border-b border-gray-200">
            {authorName && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{authorName}</p>
                  {publishDate && (
                    <p className="text-sm text-gray-500">{formatDate(publishDate)}</p>
                  )}
                </div>
              </div>
            )}
            {!authorName && publishDate && (
              <p className="text-gray-500">{formatDate(publishDate)}</p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div
            className="text-gray-800 leading-relaxed whitespace-pre-wrap"
            style={{
              fontSize: '1.125rem',
              lineHeight: '1.75',
              wordBreak: 'break-word'
            }}
          >
            {content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6">
                {paragraph.split('\n').map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {line}
                    {lineIndex < paragraph.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            ))}
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full mx-1"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full mx-1"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full mx-1"></div>
          </div>
        </div>
      </article>
    </div>
  )
}