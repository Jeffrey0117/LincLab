'use client';

import React from 'react';
import { Calendar, User, Clock } from 'lucide-react';

interface ArticleTemplateConfig {
  title: string;
  content: string;
  authorName?: string;
  publishDate?: string;
  coverImage?: string;
  readTime?: string;
  category?: string;
}

interface ArticleTemplateProps {
  config: ArticleTemplateConfig;
  onClick?: () => void;
}

const ArticleTemplate: React.FC<ArticleTemplateProps> = ({ config, onClick }) => {
  const {
    title,
    content,
    authorName,
    publishDate,
    coverImage,
    readTime,
    category
  } = config;

  return (
    <article
      className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
      onClick={onClick}
    >
      {/* 封面圖片 */}
      {coverImage && (
        <div className="relative h-64 md:h-96 w-full overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          {category && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
              {category}
            </span>
          )}
        </div>
      )}

      {/* 文章內容 */}
      <div className="p-6 md:p-8">
        {/* 文章資訊 */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          {authorName && (
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {authorName}
            </span>
          )}
          {publishDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {publishDate}
            </span>
          )}
          {readTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {readTime}
            </span>
          )}
        </div>

        {/* 標題 */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h1>

        {/* 內容 */}
        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="whitespace-pre-line leading-relaxed">
            {content}
          </p>
        </div>

        {/* 繼續閱讀提示 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            繼續閱讀 →
          </button>
        </div>
      </div>
    </article>
  );
};

export default ArticleTemplate;