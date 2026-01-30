import { LinkTemplateType } from './template-types';

export interface TemplateExample {
  name: string;
  description: string;
  data: any;
}

export const TEMPLATE_EXAMPLES: Record<LinkTemplateType, TemplateExample> = {
  image: {
    name: '圖片展示',
    description: '展示單張精美圖片，支援多種顯示模式',
    data: {
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      altText: '精選商品圖片',
      fitMode: 'cover' as const,
      showHint: true,
      hintText: '👆 點擊圖片查看詳情',
      hintPosition: 'bottom' as const,
    },
  },
  external_link: {
    name: '外部連結',
    description: '重定向到指定網址，可自訂標題和描述',
    data: {
      targetUrl: 'https://shopee.tw',
      customTitle: '限時特價！立即搶購',
      customDescription: '精選商品優惠中，數量有限售完為止',
      customImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
    },
  },
  beauty: {
    name: '美圖精選',
    description: '展示多張精美圖片集錦',
    data: {
      images: [
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800',
      ],
      title: '精選美圖集',
      description: '高品質圖片展示',
      layout: 'grid' as const,
    },
  },
  article: {
    name: '文章內容',
    description: '展示文章或部落格內容',
    data: {
      title: '2024 最新購物指南：如何挑選適合你的商品',
      content: '在這個快速變化的時代，選擇合適的商品變得越來越重要。本文將為您介紹最新的購物技巧...',
      authorName: '購物達人',
      publishDate: '2024-11-12',
      coverImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200',
    },
  },
};

// 輔助函數：根據模板類型獲取範例資料
export function getTemplateExample(type: LinkTemplateType): TemplateExample {
  return TEMPLATE_EXAMPLES[type];
}