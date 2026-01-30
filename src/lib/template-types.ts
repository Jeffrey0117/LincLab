import { LucideIcon } from 'lucide-react';
import {
  Image,
  ExternalLink,
  Sparkles,
  FileText,
  Cloud,
} from 'lucide-react';

// 模板類型定義
export type LinkTemplateType =
  | 'image'
  | 'external_link'
  | 'beauty'
  | 'article'
  | 'cloud_drive';

// 模板資訊介面
export interface TemplateInfo {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  isRecommended?: boolean;
}

// 模板資訊映射
export const TEMPLATE_INFO: Record<LinkTemplateType, TemplateInfo> = {
  image: {
    name: '圖片展示',
    description: '展示單張精美圖片，支援多種顯示模式',
    icon: Image,
    color: 'bg-blue-500',
    isRecommended: true,
  },
  external_link: {
    name: '外部連結',
    description: '重定向到指定網址，可自訂標題和描述',
    icon: ExternalLink,
    color: 'bg-green-500',
  },
  beauty: {
    name: '美圖精選',
    description: '展示多張精美圖片集錦',
    icon: Sparkles,
    color: 'bg-pink-500',
  },
  article: {
    name: '文章內容',
    description: '展示文章或部落格內容',
    icon: FileText,
    color: 'bg-indigo-500',
    isRecommended: true,
  },
  cloud_drive: {
    name: '嘟嘟網盤',
    description: '偽裝雲端硬碟分享頁，輸入提取碼下載內容',
    icon: Cloud,
    color: 'bg-cyan-500',
    isRecommended: true,
  },
};