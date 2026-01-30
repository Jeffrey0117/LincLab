"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import OGTagsEditor from "./shared/OGTagsEditor";
import AccountTagsSelector from "./shared/AccountTagsSelector";
import StrategySelector, { type StrategyType } from "@/components/StrategySelector";
import CookieTriggerConfig from "@/components/CookieTriggerConfig";
import CaptchaVerificationConfig from "@/components/CaptchaVerificationConfig";
import ContentUnlockConfig from "@/components/ContentUnlockConfig";
import ImageLinkConfig from "@/components/ImageLinkConfig";
import Adult18PlusConfig from "@/components/Adult18PlusConfig";
import PreviewCard from "@/components/PreviewCard";
import { useToast } from "@/hooks/use-toast";

interface ExternalLinkEditorProps {
  onBack?: () => void;
  onSubmit: (data: ExternalLinkData) => Promise<void>;
  defaultAccountId?: string | null;
  defaultStrategy?: string | null;
  editingLink?: any;
}

interface ExternalLinkData {
  title: string;
  targetUrl: string;
  proxyContent: string;
  affiliateUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  faviconUrl: string;
  accountId: string;
  tags: string[];
  strategy: string;
  strategyConfig: any;
  linkMode: 'template';
}

export default function ExternalLinkEditor({
  onBack,
  onSubmit,
  defaultAccountId,
  defaultStrategy,
  editingLink
}: ExternalLinkEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("step1");

  // OG Tags States
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  // Form States
  const [targetUrl, setTargetUrl] = useState("");
  const [proxyContent, setProxyContent] = useState("");
  const [title, setTitle] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [accountId, setAccountId] = useState(defaultAccountId || "none");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Strategy states
  const [strategy, setStrategy] = useState<StrategyType>((defaultStrategy as StrategyType) || "cookie_popup");
  const [strategyConfig, setStrategyConfig] = useState<any>({});

  // Load editing data if exists
  useEffect(() => {
    if (editingLink) {
      // 資料庫欄位是 snake_case
      setOgTitle(editingLink.og_title || "");
      setOgDescription(editingLink.og_description || "");
      setOgImage(editingLink.og_image || "");
      setFaviconUrl(editingLink.favicon_url || "");
      setTargetUrl(editingLink.target_url || "");
      setProxyContent(editingLink.proxy_content || "");
      setTitle(editingLink.title || "");
      setAffiliateUrl(editingLink.affiliate_url || "");
      setAccountId(editingLink.account_id || "none");
      setTagsInput(editingLink.tags?.join(", ") || "");
      setStrategy(editingLink.strategy || "cookie_popup");
      setStrategyConfig(editingLink.strategy_config || {});
    }
  }, [editingLink]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Step 1: OG Tags
    if (!ogTitle.trim()) {
      toast({
        title: "錯誤",
        description: "請填寫 OG 標題",
        variant: "destructive",
      });
      setActiveTab("step1");
      return;
    }

    if (!ogDescription.trim()) {
      toast({
        title: "錯誤",
        description: "請填寫 OG 描述",
        variant: "destructive",
      });
      setActiveTab("step1");
      return;
    }

    if (!ogImage.trim()) {
      toast({
        title: "錯誤",
        description: "請填寫 OG 圖片網址",
        variant: "destructive",
      });
      setActiveTab("step1");
      return;
    }

    // Validate Step 2: Link Settings
    if (!targetUrl.trim()) {
      toast({
        title: "錯誤",
        description: "請填寫目標網址",
        variant: "destructive",
      });
      setActiveTab("step2");
      return;
    }

    if (!affiliateUrl.trim()) {
      toast({
        title: "錯誤",
        description: "請填寫蝦皮分潤連結",
        variant: "destructive",
      });
      setActiveTab("step2");
      return;
    }

    setLoading(true);

    try {
      // Process tags
      const tags = tagsInput
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const data: ExternalLinkData = {
        title: title || ogTitle, // Use OG title as fallback
        targetUrl: targetUrl.trim(),
        proxyContent: proxyContent.trim(),
        affiliateUrl: affiliateUrl.trim(),
        ogTitle: ogTitle.trim(),
        ogDescription: ogDescription.trim(),
        ogImage: ogImage.trim(),
        faviconUrl: faviconUrl.trim(),
        accountId,
        tags,
        strategy,
        strategyConfig,
        linkMode: 'template'
      };

      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "錯誤",
        description: "創建連結時發生錯誤",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">外部連結模式</h2>
          <p className="text-muted-foreground">推薦外部文章或評測</p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回選擇
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="step1">Step 1: 社群外觀</TabsTrigger>
            <TabsTrigger value="step2">Step 2: 連結設定</TabsTrigger>
            <TabsTrigger value="step3">Step 3: 策略</TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              預覽
            </TabsTrigger>
          </TabsList>

          {/* Step 1: 社群外觀（OG Tags） */}
          <TabsContent value="step1" className="space-y-4 mt-4">
            <OGTagsEditor
              ogTitle={ogTitle}
              setOgTitle={setOgTitle}
              ogDescription={ogDescription}
              setOgDescription={setOgDescription}
              ogImage={ogImage}
              setOgImage={setOgImage}
              faviconUrl={faviconUrl}
              setFaviconUrl={setFaviconUrl}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setActiveTab("step2")}
              >
                下一步：連結設定 →
              </Button>
            </div>
          </TabsContent>

          {/* Step 2: 連結設定 */}
          <TabsContent value="step2" className="space-y-4 mt-4">
            {/* 目標網址 */}
            <div className="space-y-2">
              <Label htmlFor="targetUrl">
                目標網址（推薦文章的原始網址）
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="targetUrl"
                type="url"
                placeholder="https://example.com/article"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                使用者可以點擊「繼續前往網頁」訪問這個網址
              </p>
            </div>

            {/* 蝦皮分潤連結 */}
            <div className="space-y-2">
              <Label htmlFor="affiliateUrl">
                蝦皮分潤連結
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="affiliateUrl"
                type="url"
                placeholder="https://shp.ee/..."
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                使用者點擊轉換策略按鈕會跳轉到這個連結
              </p>
            </div>

            {/* 預覽摘要 */}
            <div className="space-y-2">
              <Label htmlFor="proxyContent">預覽摘要（選填）</Label>
              <Textarea
                id="proxyContent"
                placeholder="輸入文章摘要或推薦理由..."
                value={proxyContent}
                onChange={(e) => setProxyContent(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                填寫摘要可以讓使用者更快了解內容
              </p>
            </div>

            {/* 連結標題 */}
            <div className="space-y-2">
              <Label htmlFor="title">連結標題（選填）</Label>
              <Input
                id="title"
                placeholder="例如：iPhone 16 評測推薦"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                方便在後台管理時識別連結，不會顯示給使用者
              </p>
            </div>

            {/* 帳號和標籤 */}
            <AccountTagsSelector
              accountId={accountId}
              setAccountId={setAccountId}
              tagsInput={tagsInput}
              setTagsInput={setTagsInput}
              defaultAccountId={defaultAccountId}
            />

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("step1")}
              >
                ← 上一步
              </Button>
              <Button
                type="button"
                onClick={() => setActiveTab("step3")}
              >
                下一步：策略 →
              </Button>
            </div>
          </TabsContent>

          {/* Step 3: 轉換策略 */}
          <TabsContent value="step3" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">轉換策略</h3>
              <p className="text-sm text-muted-foreground mb-4">
                選擇如何引導使用者點擊分潤連結
              </p>
            </div>

            <StrategySelector
              value={strategy}
              onChange={setStrategy}
            />

            {strategy === 'cookie_popup' && (
              <CookieTriggerConfig
                config={strategyConfig}
                onChange={setStrategyConfig}
              />
            )}

            {strategy === 'captcha_verification' && (
              <CaptchaVerificationConfig
                config={strategyConfig}
                onChange={setStrategyConfig}
              />
            )}

            {strategy === 'content_unlock' && (
              <ContentUnlockConfig
                config={strategyConfig}
                onChange={setStrategyConfig}
              />
            )}

            {strategy === 'image_link' && (
              <ImageLinkConfig
                config={strategyConfig}
                onChange={setStrategyConfig}
              />
            )}

            {strategy === 'adult_18plus' && (
              <Adult18PlusConfig
                config={strategyConfig}
                onChange={setStrategyConfig}
              />
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("step2")}
              >
                ← 上一步
              </Button>
              <Button
                type="button"
                onClick={() => setActiveTab("preview")}
              >
                預覽 →
              </Button>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4 mt-4">
            <div className="border rounded-lg overflow-hidden bg-muted/30">
              <h3 className="font-semibold p-4 border-b bg-background">預覽卡片效果</h3>
              <div className="bg-background">
                <PreviewCard
                  targetUrl={targetUrl || "https://example.com"}
                  ogTitle={ogTitle || "預覽標題"}
                  ogDescription={ogDescription || "預覽描述"}
                  ogImage={ogImage || ""}
                  proxyContent={proxyContent}
                  affiliateUrl={affiliateUrl || "https://shope.ee/example"}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("step3")}
              >
                ← 返回編輯
              </Button>
              {onBack && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={loading}
                >
                  取消
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-primary hover:opacity-90"
              >
                {loading ? "創建中..." : editingLink ? "更新連結" : "創建連結"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}