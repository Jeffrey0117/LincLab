'use client';

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Import all components
import BasicInfoEditor from "./BasicInfoEditor";
import ModeSelector, { LinkMode } from "./ModeSelector";
import TemplateTypeSelector from "./TemplateTypeSelector";
import TemplateEditor, { TemplateConfig } from "./TemplateEditor";
import CustomContentEditorV2, { CustomContentData } from "./CustomContentEditorV2";
import StrategyStep from "./StrategyStep";
import { LinkTemplateType } from "@/lib/template-types";
import { type StrategyType } from "@/components/StrategySelector";

// Interfaces
interface CreateLinkFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultAccountId?: string | null;
  defaultStrategy?: string | null;
  editingLink?: any;
}

// Basic info data structure (without strategy)
interface BasicInfoData {
  title: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  faviconUrl: string;
}

export default function CreateLinkFlow({
  open,
  onOpenChange,
  onSuccess,
  defaultAccountId,
  defaultStrategy,
  editingLink,
}: CreateLinkFlowProps) {
  // Flow state - use tab value for navigation
  const [activeTab, setActiveTab] = useState<string>('step1');

  // Data state
  const [basicInfo, setBasicInfo] = useState<BasicInfoData | null>(null);
  const [contentMode, setContentMode] = useState<'custom' | 'template'>('template');
  const [templateType, setTemplateType] = useState<LinkTemplateType | null>(null);
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null);
  const [customContent, setCustomContent] = useState<CustomContentData | null>(null);
  const [affiliateUrl, setAffiliateUrl] = useState<string>('');

  // Strategy state (now unified at the end)
  const [strategy, setStrategy] = useState<StrategyType>('none');
  const [strategyConfig, setStrategyConfig] = useState<any>({});

  // Loading state
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  // Initialize flow based on editing mode
  useEffect(() => {
    if (editingLink) {
      // Set basic info from existing data
      setBasicInfo({
        title: editingLink.title || '',
        ogTitle: editingLink.og_title || '',
        ogDescription: editingLink.og_description || '',
        ogImage: editingLink.og_image || '',
        faviconUrl: editingLink.favicon_url || '',
      });

      // Load affiliate URL and strategy
      setAffiliateUrl(editingLink.affiliate_url || '');
      setStrategy(editingLink.strategy || 'none');
      setStrategyConfig(editingLink.strategy_config || {});

      // If has content_mode field, use it
      if (editingLink.content_mode) {
        setContentMode(editingLink.content_mode);

        if (editingLink.content_mode === 'template') {
          setTemplateType(editingLink.template_type || null);
          setTemplateConfig(editingLink.template_config || null);
        } else if (editingLink.content_mode === 'custom') {
          setCustomContent({
            title: editingLink.title || '',
            htmlContent: editingLink.html_content || '',
            affiliateUrl: editingLink.affiliate_url || '',
            accountId: editingLink.account_id || 'none',
          });
        }
      }

      // Start from step 1 for editing mode
      setActiveTab('step1');
    } else {
      // For new links, start from step 1
      setActiveTab('step1');
      setAffiliateUrl('');
      setStrategy('none');
      setStrategyConfig({});
    }
  }, [editingLink]);

  // Navigation handlers
  const handleBasicInfoNext = (data: BasicInfoData) => {
    setBasicInfo(data);
    setActiveTab('step2');
  };

  const handleBasicInfoSkip = () => {
    setBasicInfo({
      title: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      faviconUrl: '',
    });
    setActiveTab('step2');
  };

  const handleBasicInfoChange = useCallback((data: BasicInfoData) => {
    setBasicInfo(data);
  }, []);

  const handleSelectMode = (mode: LinkMode) => {
    setContentMode(mode);
    if (mode === 'custom') {
      setActiveTab('step3-custom');
    } else if (mode === 'template') {
      setActiveTab('step3-template');
    }
  };

  const handleSelectTemplate = (type: LinkTemplateType) => {
    setTemplateType(type);

    // 當選擇嘟嘟網盤時，自動設定預設 OG 資訊
    if (type === 'cloud_drive') {
      const randomNames = ['Joh**son', 'Mic**ael', 'Ale**nder', 'Chr**tina', 'Wil**am', 'Dan**el', 'Nic**las', 'Mat**ew', 'Ste**en', 'And**ew'];
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
      setBasicInfo(prev => ({
        title: prev?.title || '嘟嘟網盤 - 文件分享',
        ogTitle: prev?.ogTitle || `${randomName}給您加密分享了文件`,
        ogDescription: prev?.ogDescription || '請輸入提取碼查看分享內容',
        ogImage: prev?.ogImage || '',
        faviconUrl: prev?.faviconUrl || '',
      }));
    }

    setActiveTab('step4-template');
  };

  // Custom content -> Strategy step
  const handleCustomContentNext = (data: CustomContentData) => {
    setCustomContent(data);
    setAffiliateUrl(data.affiliateUrl);
    setActiveTab('step-strategy');
  };

  // Template config -> Strategy step (or direct submit for external_link)
  const handleTemplateConfig = async (config: TemplateConfig, url: string) => {
    setTemplateConfig(config);
    setAffiliateUrl(url);

    // If external_link template, skip strategy and submit directly
    if (templateType === 'external_link') {
      await handleDirectSubmit(config, url);
    } else {
      setActiveTab('step-strategy');
    }
  };

  // Direct submit without strategy (for external_link template)
  const handleDirectSubmit = async (config: TemplateConfig, url: string) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("未登入");

      const htmlContent = generateTemplateHTML(templateType!, config);

      const linkData = {
        title: basicInfo?.title || null,
        html_content: htmlContent,
        affiliate_url: url,
        strategy: 'none',
        strategy_config: null,
        og_title: basicInfo?.ogTitle || null,
        og_description: basicInfo?.ogDescription || null,
        og_image: basicInfo?.ogImage || null,
        favicon_url: basicInfo?.faviconUrl || null,
        account_id: defaultAccountId && defaultAccountId !== "none" ? defaultAccountId : null,
        tags: null,
        link_mode: 'redirect' as const,
        content_mode: 'template',
        template_type: templateType,
        template_config: config,
        target_url: null,
        proxy_content: null,
      };

      if (editingLink) {
        const { error } = await supabase
          .from("links")
          .update(linkData)
          .eq("id", editingLink.id);

        if (error) throw error;

        toast({
          title: "成功",
          description: "連結已成功更新！",
        });
      } else {
        const shortCode = generateShortCode();
        const { error } = await supabase.from("links").insert({
          user_id: user.id,
          short_code: shortCode,
          ...linkData,
        });

        if (error) throw error;

        toast({
          title: "成功",
          description: "連結已成功創建！",
        });
      }

      onOpenChange(false);
      resetFlow();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToModeSelect = () => {
    setActiveTab('step2');
  };

  const handleBackToBasicInfo = () => {
    setActiveTab('step1');
  };

  const handleBackToTemplateSelect = () => {
    setActiveTab('step3-template');
  };

  const handleBackToContent = () => {
    if (contentMode === 'custom') {
      setActiveTab('step3-custom');
    } else {
      setActiveTab('step4-template');
    }
  };

  // Helper function to generate short code
  const generateShortCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Final submit handler (from Strategy step)
  const handleStrategySubmit = async (selectedStrategy: StrategyType, selectedConfig: any) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("未登入");

      let linkData: any;

      if (contentMode === 'custom' && customContent) {
        // Custom mode submission
        linkData = {
          title: customContent.title || basicInfo?.title || null,
          html_content: customContent.htmlContent,
          affiliate_url: customContent.affiliateUrl,
          strategy: selectedStrategy,
          strategy_config: selectedConfig && Object.keys(selectedConfig).length > 0 ? selectedConfig : null,
          og_title: basicInfo?.ogTitle || null,
          og_description: basicInfo?.ogDescription || null,
          og_image: basicInfo?.ogImage || null,
          favicon_url: basicInfo?.faviconUrl || null,
          account_id: customContent.accountId && customContent.accountId !== "none" ? customContent.accountId : null,
          tags: null,
          link_mode: 'redirect',
          content_mode: 'custom',
          target_url: null,
          proxy_content: null,
          template_type: null,
          template_config: null,
        };
      } else if (contentMode === 'template' && templateType && templateConfig) {
        // Template mode submission
        const htmlContent = generateTemplateHTML(templateType, templateConfig);

        // 嘟嘟網盤的預設 OG 值
        let ogTitle = basicInfo?.ogTitle || null;
        let ogDescription = basicInfo?.ogDescription || null;
        if (templateType === 'cloud_drive') {
          if (!ogTitle) {
            const randomNames = ['Joh**son', 'Mic**ael', 'Ale**nder', 'Chr**tina', 'Wil**am', 'Dan**el', 'Nic**las', 'Mat**ew', 'Ste**en', 'And**ew'];
            const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
            ogTitle = `${randomName}給您加密分享了文件`;
          }
          if (!ogDescription) {
            ogDescription = '請輸入提取碼查看分享內容';
          }
        }

        linkData = {
          title: basicInfo?.title || (templateType === 'cloud_drive' ? '嘟嘟網盤 - 文件分享' : null),
          html_content: htmlContent,
          affiliate_url: affiliateUrl,
          strategy: selectedStrategy,
          strategy_config: selectedConfig && Object.keys(selectedConfig).length > 0 ? selectedConfig : null,
          og_title: ogTitle,
          og_description: ogDescription,
          og_image: basicInfo?.ogImage || null,
          favicon_url: basicInfo?.faviconUrl || null,
          account_id: defaultAccountId && defaultAccountId !== "none" ? defaultAccountId : null,
          tags: null,
          link_mode: 'redirect',
          content_mode: 'template',
          template_type: templateType,
          template_config: templateConfig,
          target_url: null,
          proxy_content: null,
        };
      } else {
        throw new Error("內容資料不完整");
      }

      if (editingLink) {
        const { error } = await supabase
          .from("links")
          .update(linkData)
          .eq("id", editingLink.id);

        if (error) throw error;

        toast({
          title: "成功",
          description: "連結已成功更新！",
        });
      } else {
        const shortCode = generateShortCode();
        const { error } = await supabase.from("links").insert({
          user_id: user.id,
          short_code: shortCode,
          ...linkData,
        });

        if (error) throw error;

        toast({
          title: "成功",
          description: "連結已成功創建！",
        });
      }

      onOpenChange(false);
      resetFlow();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate HTML from template
  const generateTemplateHTML = (type: LinkTemplateType, config: TemplateConfig): string => {
    switch (type) {
      case 'image': {
        const imgConfig = config as any;
        return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${basicInfo?.title || 'Image'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html { width: 100%; height: 100vh; overflow: hidden; }
        .container {
            width: 100%;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
            position: relative;
        }
        .image {
            max-width: 100%;
            max-height: 100%;
            object-fit: ${imgConfig.fitMode || 'contain'};
        }
        .hint {
            position: absolute;
            ${imgConfig.hintPosition === 'top' ? 'top: 20px;' : imgConfig.hintPosition === 'bottom' ? 'bottom: 20px;' : 'top: 50%; transform: translateY(-50%);'}
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="${imgConfig.imageUrl}" alt="${imgConfig.altText || ''}" class="image" />
        ${imgConfig.showHint ? `<div class="hint">${imgConfig.hintText || '點擊查看更多'}</div>` : ''}
    </div>
</body>
</html>`;
      }

      case 'external_link': {
        const linkConfig = config as any;
        return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${linkConfig.customTitle || basicInfo?.title || 'Loading...'}</title>
    <meta property="og:title" content="${linkConfig.customTitle || basicInfo?.ogTitle || ''}">
    <meta property="og:description" content="${linkConfig.customDescription || basicInfo?.ogDescription || ''}">
    <meta property="og:image" content="${linkConfig.customImage || basicInfo?.ogImage || ''}">
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: system-ui, -apple-system, sans-serif;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .loading {
            text-align: center;
            color: #666;
        }
    </style>
    <script>
        window.location.href = "${linkConfig.targetUrl}";
    </script>
</head>
<body>
    <div class="card">
        <div class="loading">
            <h2>正在跳轉...</h2>
            <p>如果沒有自動跳轉，請<a href="${linkConfig.targetUrl}">點擊這裡</a></p>
        </div>
    </div>
</body>
</html>`;
      }

      default:
        // For unimplemented templates, return a placeholder
        return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${basicInfo?.title || 'Template'}</title>
</head>
<body>
    <div style="padding: 20px; text-align: center;">
        <h1>Template: ${type}</h1>
        <p>This template is under construction</p>
    </div>
</body>
</html>`;
    }
  };

  // Reset flow state
  const resetFlow = () => {
    setActiveTab('step1');
    setBasicInfo(null);
    setContentMode('template');
    setTemplateType(null);
    setTemplateConfig(null);
    setCustomContent(null);
    setAffiliateUrl('');
    setStrategy('none');
    setStrategyConfig({});
  };

  // Determine current step number for display
  const getStepNumber = () => {
    switch (activeTab) {
      case 'step1': return 1;
      case 'step2': return 2;
      case 'step3-custom':
      case 'step3-template': return 3;
      case 'step4-template': return 4;
      case 'step-strategy': return contentMode === 'custom' ? 4 : 5;
      default: return 1;
    }
  };

  const getTotalSteps = () => {
    return contentMode === 'custom' ? 4 : 5;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          setTimeout(resetFlow, 200);
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>
              {editingLink ? '編輯連結' : '建立新連結'}
            </DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">
            步驟 {getStepNumber()} / {getTotalSteps()}
          </span>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="step1">1. 基本設定</TabsTrigger>
            <TabsTrigger value="step2" disabled={!basicInfo}>2. 選擇模式</TabsTrigger>
            <TabsTrigger
              value={contentMode === 'template' ? 'step3-template' : 'step3-custom'}
              disabled={activeTab === 'step1' || activeTab === 'step2'}
            >
              3. {contentMode === 'template' ? '選擇模板' : '編輯內容'}
            </TabsTrigger>
            <TabsTrigger
              value="step-strategy"
              disabled={activeTab !== 'step-strategy'}
            >
              {contentMode === 'custom' ? '4' : '5'}. 選擇策略
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Basic Info */}
          <TabsContent value="step1">
            <div className="mb-4 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Step 1</h3>
              <h2 className="text-lg font-semibold">基本設定</h2>
            </div>
            <BasicInfoEditor
              onNext={handleBasicInfoNext}
              onSkip={handleBasicInfoSkip}
              initialData={basicInfo || undefined}
              onChange={handleBasicInfoChange}
            />
          </TabsContent>

          {/* Step 2: Mode Selection */}
          <TabsContent value="step2">
            <div className="mb-4 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Step 2</h3>
              <h2 className="text-lg font-semibold">選擇模式</h2>
            </div>
            <ModeSelector onSelectMode={handleSelectMode} />
          </TabsContent>

          {/* Step 3a: Custom Content */}
          <TabsContent value="step3-custom">
            <div className="mb-4 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Step 3</h3>
              <h2 className="text-lg font-semibold">編輯內容</h2>
            </div>
            <CustomContentEditorV2
              onBack={handleBackToModeSelect}
              onNext={handleCustomContentNext}
              defaultAccountId={defaultAccountId}
              editingLink={editingLink}
              basicInfo={basicInfo || undefined}
            />
          </TabsContent>

          {/* Step 3b: Template Type Selection */}
          <TabsContent value="step3-template">
            <div className="mb-4 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Step 3</h3>
              <h2 className="text-lg font-semibold">選擇模板</h2>
            </div>
            <TemplateTypeSelector
              onSelect={handleSelectTemplate}
              onBack={handleBackToModeSelect}
              selectedType={templateType || undefined}
            />
          </TabsContent>

          {/* Step 4: Template Editor */}
          <TabsContent value="step4-template">
            <div className="mb-4 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">Step 4</h3>
              <h2 className="text-lg font-semibold">編輯模板</h2>
            </div>
            {templateType && (
              <TemplateEditor
                templateType={templateType}
                onBack={handleBackToTemplateSelect}
                onNext={(config, url) => handleTemplateConfig(config, url)}
                initialConfig={templateConfig || undefined}
                initialAffiliateUrl={affiliateUrl}
              />
            )}
          </TabsContent>

          {/* Final Step: Strategy Selection */}
          <TabsContent value="step-strategy">
            <div className="mb-4 text-center">
              <h3 className="text-sm font-medium text-muted-foreground">
                Step {contentMode === 'custom' ? 4 : 5}
              </h3>
              <h2 className="text-lg font-semibold">選擇策略</h2>
            </div>
            <StrategyStep
              onBack={handleBackToContent}
              onSubmit={handleStrategySubmit}
              initialStrategy={strategy}
              initialConfig={strategyConfig}
              loading={loading}
              isEditing={!!editingLink}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
