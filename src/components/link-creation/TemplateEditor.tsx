'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image, Link, Palette, FileText, Plus, X, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

// Template types
export type TemplateType = 'image' | 'external_link' | 'beauty' | 'article' | 'cloud_drive';

// Template configurations
export interface ImageTemplateConfig {
  imageUrl: string;
  altText?: string;
  fitMode?: 'cover' | 'contain' | 'fill';
  showHint?: boolean;
  hintText?: string;
  hintPosition?: 'top' | 'bottom' | 'center';
}

export interface ExternalLinkTemplateConfig {
  targetUrl: string;
  customTitle?: string;
  customDescription?: string;
  customImage?: string;
}

export interface BeautyTemplateConfig {
  images: string[];
  title: string;
  description?: string;
  layout?: 'grid' | 'carousel' | 'masonry';
}

export interface ArticleTemplateConfig {
  title: string;
  content: string;
  authorName?: string;
  publishDate?: string;
  coverImage?: string;
}

export interface CloudDriveTemplateConfig {
  extractCode: string;
  fileContent: string;
  fileName: string;
}

export type TemplateConfig =
  | ImageTemplateConfig
  | ExternalLinkTemplateConfig
  | BeautyTemplateConfig
  | ArticleTemplateConfig
  | CloudDriveTemplateConfig;

interface TemplateEditorProps {
  templateType: TemplateType;
  onBack?: () => void;
  onNext: (config: TemplateConfig, affiliateUrl: string) => void;
  initialConfig?: TemplateConfig;
  initialAffiliateUrl?: string;
}

// Template metadata
const templateInfo: Record<TemplateType, {
  icon: React.ReactNode;
  title: string;
  description: string;
  implemented: boolean;
}> = {
  image: {
    icon: <Image className="h-5 w-5" />,
    title: '圖片模板',
    description: '展示吸引人的圖片來引導點擊',
    implemented: true,
  },
  external_link: {
    icon: <Link className="h-5 w-5" />,
    title: '外部連結預覽',
    description: '展示外部網站的預覽資訊',
    implemented: true,
  },
  beauty: {
    icon: <Palette className="h-5 w-5" />,
    title: '正妹圖片',
    description: '精美的圖片集展示模板',
    implemented: true,
  },
  article: {
    icon: <FileText className="h-5 w-5" />,
    title: '文章評測',
    description: '專業的產品評測文章模板',
    implemented: true,
  },
  cloud_drive: {
    icon: <Cloud className="h-5 w-5" />,
    title: '嘟嘟網盤',
    description: '偽裝雲端硬碟分享頁，輸入提取碼下載內容',
    implemented: true,
  },
};

export default function TemplateEditor({
  templateType,
  onBack,
  onNext,
  initialConfig,
  initialAffiliateUrl,
}: TemplateEditorProps) {
  const { toast } = useToast();
  const templateMeta = templateInfo[templateType];

  // Common state for all templates
  const [affiliateUrl, setAffiliateUrl] = useState(initialAffiliateUrl || '');
  // Strategy is now selected in the final step

  // Image template state
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [fitMode, setFitMode] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [showHint, setShowHint] = useState(true);
  const [hintText, setHintText] = useState('👆 點擊圖片查看詳情');
  const [hintPosition, setHintPosition] = useState<'top' | 'bottom' | 'center'>('bottom');

  // External link template state
  const [targetUrl, setTargetUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customImage, setCustomImage] = useState('');

  // Article template state
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleAuthorName, setArticleAuthorName] = useState('');
  const [articlePublishDate, setArticlePublishDate] = useState('');
  const [articleCoverImage, setArticleCoverImage] = useState('');

  // Beauty template state
  const [beautyImages, setBeautyImages] = useState<string[]>([]);
  const [beautyTitle, setBeautyTitle] = useState('');
  const [beautyDescription, setBeautyDescription] = useState('');
  const [beautyLayout, setBeautyLayout] = useState<'grid' | 'carousel' | 'masonry'>('carousel');

  // Cloud drive template state
  const [cloudExtractCode, setCloudExtractCode] = useState('8888');
  const [cloudFileContent, setCloudFileContent] = useState('感謝您的下載！\n\n這是您的專屬內容。');
  const [cloudFileName, setCloudFileName] = useState('分享資料.txt');

  // Sync with initialAffiliateUrl changes
  useEffect(() => {
    if (initialAffiliateUrl) {
      setAffiliateUrl(initialAffiliateUrl);
    }
  }, [initialAffiliateUrl]);

  // Initialize from config
  useEffect(() => {
    if (!initialConfig) return;

    if (templateType === 'image') {
      const config = initialConfig as ImageTemplateConfig;
      setImageUrl(config.imageUrl || '');
      setAltText(config.altText || '');
      setFitMode(config.fitMode || 'cover');
      setShowHint(config.showHint !== false);
      setHintText(config.hintText || '👆 點擊圖片查看詳情');
      setHintPosition(config.hintPosition || 'bottom');
    } else if (templateType === 'external_link') {
      const config = initialConfig as ExternalLinkTemplateConfig;
      setTargetUrl(config.targetUrl || '');
      setCustomTitle(config.customTitle || '');
      setCustomDescription(config.customDescription || '');
      setCustomImage(config.customImage || '');
    } else if (templateType === 'article') {
      const config = initialConfig as ArticleTemplateConfig;
      setArticleTitle(config.title || '');
      setArticleContent(config.content || '');
      setArticleAuthorName(config.authorName || '');
      setArticlePublishDate(config.publishDate || '');
      setArticleCoverImage(config.coverImage || '');
    } else if (templateType === 'beauty') {
      const config = initialConfig as BeautyTemplateConfig;
      setBeautyImages(config.images || []);
      setBeautyTitle(config.title || '');
      setBeautyDescription(config.description || '');
      setBeautyLayout(config.layout || 'carousel');
    } else if (templateType === 'cloud_drive') {
      const config = initialConfig as CloudDriveTemplateConfig;
      setCloudExtractCode(config.extractCode || '8888');
      setCloudFileContent(config.fileContent || '感謝您的下載！\n\n這是您的專屬內容。');
      setCloudFileName(config.fileName || '分享資料.txt');
    }
  }, [initialConfig, templateType]);

  const handleSubmit = () => {
    // Common validation for affiliate URL
    if (!affiliateUrl.trim()) {
      toast({
        title: '錯誤',
        description: '請填寫分潤連結',
        variant: 'destructive',
      });
      return;
    }

    // Validate based on template type
    if (templateType === 'image') {
      if (!imageUrl.trim()) {
        toast({
          title: '錯誤',
          description: '請填寫圖片網址',
          variant: 'destructive',
        });
        return;
      }

      const config: ImageTemplateConfig = {
        imageUrl: imageUrl.trim(),
        altText: altText.trim() || '點擊查看詳情',
        fitMode,
        showHint,
        hintText: hintText.trim() || '👆 點擊圖片查看詳情',
        hintPosition,
      };
      onNext(config, affiliateUrl.trim());
    } else if (templateType === 'external_link') {
      if (!targetUrl.trim()) {
        toast({
          title: '錯誤',
          description: '請填寫目標網址',
          variant: 'destructive',
        });
        return;
      }

      const config: ExternalLinkTemplateConfig = {
        targetUrl: targetUrl.trim(),
        customTitle: customTitle.trim() || undefined,
        customDescription: customDescription.trim() || undefined,
        customImage: customImage.trim() || undefined,
      };
      onNext(config, affiliateUrl.trim());
    } else if (templateType === 'article') {
      if (!articleTitle.trim()) {
        toast({
          title: '錯誤',
          description: '請填寫文章標題',
          variant: 'destructive',
        });
        return;
      }
      if (!articleContent.trim()) {
        toast({
          title: '錯誤',
          description: '請填寫文章內容',
          variant: 'destructive',
        });
        return;
      }

      const config: ArticleTemplateConfig = {
        title: articleTitle.trim(),
        content: articleContent.trim(),
        authorName: articleAuthorName.trim() || undefined,
        publishDate: articlePublishDate.trim() || undefined,
        coverImage: articleCoverImage.trim() || undefined,
      };
      onNext(config, affiliateUrl.trim());
    } else if (templateType === 'beauty') {
      if (beautyImages.length === 0 || !beautyImages.some(img => img.trim())) {
        toast({
          title: '錯誤',
          description: '請至少添加一張圖片',
          variant: 'destructive',
        });
        return;
      }
      if (!beautyTitle.trim()) {
        toast({
          title: '錯誤',
          description: '請填寫標題',
          variant: 'destructive',
        });
        return;
      }

      const config: BeautyTemplateConfig = {
        images: beautyImages.filter(img => img.trim()),
        title: beautyTitle.trim(),
        description: beautyDescription.trim() || undefined,
        layout: beautyLayout,
      };
      onNext(config, affiliateUrl.trim());
    } else if (templateType === 'cloud_drive') {
      const config: CloudDriveTemplateConfig = {
        extractCode: cloudExtractCode.trim() || '8888',
        fileContent: cloudFileContent.trim() || '感謝您的下載！',
        fileName: cloudFileName.trim() || '分享資料.txt',
      };
      onNext(config, affiliateUrl.trim());
    }
  };

  const renderImageForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image-url">圖片網址 *</Label>
        <Input
          id="image-url"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-xs text-muted-foreground">
          請提供圖片的完整網址（建議尺寸：1200x630 或更大）
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-alt">圖片替代文字</Label>
        <Input
          id="image-alt"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="點擊查看詳情"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-fit">圖片顯示模式</Label>
        <Select
          value={fitMode}
          onValueChange={(value) => setFitMode(value as 'cover' | 'contain' | 'fill')}
        >
          <SelectTrigger id="image-fit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cover">覆蓋 (Cover) - 填滿整個畫面，可能裁切</SelectItem>
            <SelectItem value="contain">包含 (Contain) - 完整顯示圖片，可能有留白</SelectItem>
            <SelectItem value="fill">填充 (Fill) - 拉伸填滿，可能變形</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between space-x-2 py-2">
        <div className="space-y-0.5">
          <Label htmlFor="show-hint">顯示點擊提示</Label>
          <p className="text-xs text-muted-foreground">
            在圖片上顯示提示文字引導使用者點擊
          </p>
        </div>
        <Switch
          id="show-hint"
          checked={showHint}
          onCheckedChange={setShowHint}
        />
      </div>

      {showHint && (
        <>
          <div className="space-y-2">
            <Label htmlFor="hint-text">提示文字</Label>
            <Input
              id="hint-text"
              value={hintText}
              onChange={(e) => setHintText(e.target.value)}
              placeholder="👆 點擊圖片查看詳情"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hint-position">提示位置</Label>
            <Select
              value={hintPosition}
              onValueChange={(value) => setHintPosition(value as 'top' | 'bottom' | 'center')}
            >
              <SelectTrigger id="hint-position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">上方</SelectItem>
                <SelectItem value="center">中央</SelectItem>
                <SelectItem value="bottom">下方</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>使用建議：</strong>圖片連結模式最適合分享到社群媒體，看起來像普通圖片分享，點擊後會開啟分潤連結。建議使用吸引人的圖片以提高點擊率。
        </p>
      </div>
    </div>
  );

  const renderExternalLinkForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="target-url">目標網址 *</Label>
        <Input
          id="target-url"
          type="url"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="https://example.com/article"
        />
        <p className="text-xs text-muted-foreground">
          要預覽的外部網站網址
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-title">自訂標題（可選）</Label>
        <Input
          id="custom-title"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          placeholder="留空則自動抓取網站標題"
        />
        <p className="text-xs text-muted-foreground">
          覆蓋原始網站的標題
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-description">自訂描述（可選）</Label>
        <Textarea
          id="custom-description"
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          placeholder="留空則自動抓取網站描述"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          覆蓋原始網站的描述文字
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-image">自訂圖片（可選）</Label>
        <Input
          id="custom-image"
          type="url"
          value={customImage}
          onChange={(e) => setCustomImage(e.target.value)}
          placeholder="https://example.com/preview.jpg"
        />
        <p className="text-xs text-muted-foreground">
          覆蓋原始網站的預覽圖片
        </p>
      </div>

      <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md">
        <p className="text-sm text-green-800 dark:text-green-200">
          💡 <strong>使用建議：</strong>外部連結預覽模式適合推薦第三方文章或評測內容。系統會自動抓取網站的預覽資訊，你也可以自訂標題、描述和圖片來優化展示效果。
        </p>
      </div>
    </div>
  );

  const renderArticleForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="article-title">文章標題 *</Label>
        <Input
          id="article-title"
          value={articleTitle}
          onChange={(e) => setArticleTitle(e.target.value)}
          placeholder="輸入吸引人的文章標題"
        />
        <p className="text-xs text-muted-foreground">
          一個引人注目的標題可以提高點擊率
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="article-content">文章內容 *</Label>
        <Textarea
          id="article-content"
          value={articleContent}
          onChange={(e) => setArticleContent(e.target.value)}
          placeholder="在這裡輸入文章內容...

使用空行分段讓文章更易讀。

支援多段落格式，讓內容結構更清晰。"
          rows={10}
        />
        <p className="text-xs text-muted-foreground">
          撰寫吸引人的文章內容，支援換行與段落
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="article-author">作者名稱（可選）</Label>
        <Input
          id="article-author"
          value={articleAuthorName}
          onChange={(e) => setArticleAuthorName(e.target.value)}
          placeholder="例如：科技小編"
        />
        <p className="text-xs text-muted-foreground">
          文章作者的名稱
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="article-date">發布日期（可選）</Label>
        <Input
          id="article-date"
          type="date"
          value={articlePublishDate}
          onChange={(e) => setArticlePublishDate(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          文章的發布日期
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="article-cover">封面圖片（可選）</Label>
        <Input
          id="article-cover"
          type="url"
          value={articleCoverImage}
          onChange={(e) => setArticleCoverImage(e.target.value)}
          placeholder="https://example.com/cover-image.jpg"
        />
        <p className="text-xs text-muted-foreground">
          文章的封面圖片（建議尺寸：1920x1080 或 16:9 比例）
        </p>
      </div>

      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-md">
        <p className="text-sm text-indigo-800 dark:text-indigo-200">
          💡 <strong>使用建議：</strong>文章模板適合創建看起來像真實部落格或新聞文章的頁面。適合推廣需要詳細說明的產品或服務，透過優質內容建立信任感。
        </p>
      </div>
    </div>
  );

  const renderBeautyForm = () => {
    const addImage = () => {
      setBeautyImages([...beautyImages, '']);
    };

    const updateImage = (index: number, value: string) => {
      const newImages = [...beautyImages];
      newImages[index] = value;
      setBeautyImages(newImages);
    };

    const removeImage = (index: number) => {
      setBeautyImages(beautyImages.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="beauty-title">標題 *</Label>
          <Input
            id="beauty-title"
            value={beautyTitle}
            onChange={(e) => setBeautyTitle(e.target.value)}
            placeholder="精選美圖集"
          />
          <p className="text-xs text-muted-foreground">
            吸引人的標題
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="beauty-description">描述（可選）</Label>
          <Input
            id="beauty-description"
            value={beautyDescription}
            onChange={(e) => setBeautyDescription(e.target.value)}
            placeholder="點擊查看更多精彩內容"
          />
          <p className="text-xs text-muted-foreground">
            簡短的描述文字
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="beauty-layout">布局模式</Label>
          <Select
            value={beautyLayout}
            onValueChange={(value) => setBeautyLayout(value as 'grid' | 'carousel' | 'masonry')}
          >
            <SelectTrigger id="beauty-layout">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="carousel">輪播模式 - 一次顯示一張，自動播放</SelectItem>
              <SelectItem value="grid">網格模式 - 整齊排列，適合多張圖片</SelectItem>
              <SelectItem value="masonry">瀑布流模式 - 錯落有致，Pinterest 風格</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            選擇最適合的展示方式
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>圖片列表 *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImage}
              className="h-8"
            >
              <Plus className="mr-1 h-3 w-3" />
              新增圖片
            </Button>
          </div>

          {beautyImages.length === 0 && (
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                點擊上方按鈕添加圖片
              </p>
            </div>
          )}

          {beautyImages.length > 0 && (
            <div className="space-y-2">
              {beautyImages.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={image}
                    onChange={(e) => updateImage(index, e.target.value)}
                    placeholder={`圖片 ${index + 1} 的網址`}
                    type="url"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="h-10 w-10 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            建議使用高品質圖片，尺寸建議：1080x1350（3:4 比例）或 1080x1080（1:1 比例）
          </p>
        </div>

        <div className="p-3 bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 rounded-md">
          <p className="text-sm text-pink-800 dark:text-pink-200">
            💡 <strong>使用建議：</strong>正妹圖片模板適合展示多張精美圖片，支援三種布局模式。輪播模式適合少量圖片，網格模式適合3-9張圖片，瀑布流模式適合大量圖片展示。
          </p>
        </div>
      </div>
    );
  };

  const renderCloudDriveForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cloud-extract-code">提取碼</Label>
        <Input
          id="cloud-extract-code"
          type="text"
          value={cloudExtractCode}
          onChange={(e) => setCloudExtractCode(e.target.value)}
          placeholder="8888"
          maxLength={8}
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          使用者需要輸入正確的提取碼才能下載內容（預設：8888）
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cloud-file-name">下載檔案名稱</Label>
        <Input
          id="cloud-file-name"
          type="text"
          value={cloudFileName}
          onChange={(e) => setCloudFileName(e.target.value)}
          placeholder="分享資料.txt"
        />
        <p className="text-xs text-muted-foreground">
          使用者下載時顯示的檔案名稱
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cloud-file-content">下載內容</Label>
        <Textarea
          id="cloud-file-content"
          value={cloudFileContent}
          onChange={(e) => setCloudFileContent(e.target.value)}
          placeholder="輸入使用者下載後會看到的內容..."
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          使用者下載的 .txt 檔案內容
        </p>
      </div>

      <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-md">
        <p className="text-sm text-cyan-800 dark:text-cyan-200">
          💡 <strong>使用建議：</strong>嘟嘟網盤模板模擬雲端硬碟分享頁面，使用者輸入正確提取碼後會開啟分潤連結，同時可下載自訂的文字內容。非常適合需要互動驗證的場景。
        </p>
      </div>
    </div>
  );

  const renderComingSoon = () => (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          {templateMeta.icon}
        </div>
        <CardTitle>即將推出</CardTitle>
        <CardDescription>
          {templateMeta.description}模板正在開發中，敬請期待！
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Badge variant="outline" className="text-sm">
          開發中
        </Badge>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {templateMeta.icon}
          <div>
            <h2 className="text-2xl font-bold">{templateMeta.title}</h2>
            <p className="text-muted-foreground">{templateMeta.description}</p>
          </div>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        )}
      </div>

      {/* Form Content */}
      <div className="max-w-2xl space-y-6">
        {/* Common Fields for all templates */}
        {templateInfo[templateType].implemented && (
          <>
            {/* Affiliate URL Field */}
            <div className="space-y-2">
              <Label htmlFor="affiliate-url">分潤連結 *</Label>
              <Input
                id="affiliate-url"
                type="url"
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                placeholder="https://shopee.tw/..."
              />
              <p className="text-xs text-muted-foreground">
                請輸入蝦皮或其他電商的分潤連結
              </p>
            </div>

            {/* Template-specific fields */}
            {templateType === 'image' && renderImageForm()}
            {templateType === 'external_link' && renderExternalLinkForm()}
            {templateType === 'beauty' && renderBeautyForm()}
            {templateType === 'article' && renderArticleForm()}
            {templateType === 'cloud_drive' && renderCloudDriveForm()}
          </>
        )}

        {!templateInfo[templateType].implemented && renderComingSoon()}
      </div>

      {/* Action Buttons */}
      {templateInfo[templateType].implemented && (
        <div className="flex justify-between pt-4 border-t">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              返回
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            className={`bg-gradient-primary hover:opacity-90 ${!onBack ? 'ml-auto' : ''}`}
          >
            {templateType === 'external_link' ? '建立連結' : '下一步：選擇策略 →'}
          </Button>
        </div>
      )}
    </div>
  );
}