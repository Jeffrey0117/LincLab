"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import OGTagsEditor from "./shared/OGTagsEditor";
import AccountTagsSelector from "./shared/AccountTagsSelector";
import StrategySelector, { type StrategyType } from "@/components/StrategySelector";
import CookieTriggerConfig from "@/components/CookieTriggerConfig";
import { useToast } from "@/hooks/use-toast";

interface CustomContentEditorProps {
  onBack: () => void;
  onSubmit: (data: CustomLinkData) => Promise<void>;
  defaultAccountId?: string | null;
  editingLink?: any;
}

interface CustomLinkData {
  title: string;
  htmlContent: string;
  affiliateUrl: string;
  strategy: string;
  strategyConfig: any;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  faviconUrl: string;
  accountId: string;
  tags: string[];
  linkMode: 'custom';
}

export default function CustomContentEditor({
  onBack,
  onSubmit,
  defaultAccountId,
  editingLink
}: CustomContentEditorProps) {
  const { toast } = useToast();

  // OG Tags states
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  // Content states
  const [title, setTitle] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  // Strategy states
  const [strategy, setStrategy] = useState<StrategyType>("cookie_popup");
  const [strategyConfig, setStrategyConfig] = useState<any>({});

  // Account and tags states
  const [accountId, setAccountId] = useState(defaultAccountId || "none");
  const [tagsInput, setTagsInput] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  // Load editing data if exists
  useEffect(() => {
    if (editingLink) {
      // OG Tags (資料庫欄位是 snake_case)
      setOgTitle(editingLink.og_title || "");
      setOgDescription(editingLink.og_description || "");
      setOgImage(editingLink.og_image || "");
      setFaviconUrl(editingLink.favicon_url || "");

      // Content
      setTitle(editingLink.title || "");
      setAffiliateUrl(editingLink.affiliate_url || "");
      setHtmlContent(editingLink.html_content || "");

      // Strategy
      setStrategy(editingLink.strategy || "cookie_popup");
      setStrategyConfig(editingLink.strategy_config || {});

      // Account and tags
      setAccountId(editingLink.account_id || "none");
      setTagsInput(editingLink.tags?.join(", ") || "");
    }
  }, [editingLink]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!ogTitle.trim()) {
      toast({
        title: "錯誤",
        description: "請填寫 OG 標題",
        variant: "destructive",
      });
      return;
    }

    if (!ogDescription.trim()) {
      toast({
        title: "錯誤",
        description: "請填寫 OG 描述",
        variant: "destructive",
      });
      return;
    }

    if (!ogImage.trim()) {
      toast({
        title: "錯誤",
        description: "請填寫 OG 圖片網址",
        variant: "destructive",
      });
      return;
    }

    if (!affiliateUrl.trim()) {
      toast({
        title: "錯誤",
        description: "請填寫蝦皮分潤連結",
        variant: "destructive",
      });
      return;
    }

    if (!htmlContent.trim()) {
      toast({
        title: "錯誤",
        description: "請填寫文章內容",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Process tags
      const tags = tagsInput
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const data: CustomLinkData = {
        title: title.trim(),
        htmlContent: htmlContent.trim(),
        affiliateUrl: affiliateUrl.trim(),
        strategy,
        strategyConfig,
        ogTitle: ogTitle.trim(),
        ogDescription: ogDescription.trim(),
        ogImage: ogImage.trim(),
        faviconUrl: faviconUrl.trim(),
        accountId,
        tags,
        linkMode: 'custom'
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
          <h2 className="text-2xl font-bold">原創內容模式</h2>
          <p className="text-muted-foreground">自己撰寫文章內容</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回選擇
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. OG Tags (最優先) */}
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

        {/* 2. 連結標題 */}
        <div className="space-y-2">
          <Label htmlFor="title">連結標題（選填）</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="用於管理連結的標題"
          />
          <p className="text-sm text-muted-foreground">
            用於在管理介面中識別連結，不會顯示在分享預覽中
          </p>
        </div>

        {/* 3. 蝦皮分潤連結 */}
        <div className="space-y-2">
          <Label htmlFor="affiliateUrl">
            蝦皮分潤連結 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="affiliateUrl"
            type="url"
            required
            value={affiliateUrl}
            onChange={(e) => setAffiliateUrl(e.target.value)}
            placeholder="https://shope.ee/..."
          />
          <p className="text-sm text-muted-foreground">
            使用者最終會被導向到這個連結
          </p>
        </div>

        {/* 4. 策略選擇 */}
        <StrategySelector
          value={strategy}
          onChange={setStrategy}
        />

        {/* 5. 策略配置（條件顯示） */}
        {strategy === 'cookie_popup' && (
          <CookieTriggerConfig
            config={strategyConfig}
            onChange={setStrategyConfig}
          />
        )}

        {/* 6. HTML 內容 */}
        <div className="space-y-2">
          <Label htmlFor="htmlContent">
            文章內容（HTML）<span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="htmlContent"
            rows={10}
            required
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder={`輸入 HTML 內容，例如：
<h1>標題</h1>
<p>段落內容...</p>
<img src="圖片網址" alt="描述" />`}
            className="font-mono text-sm"
          />
          <p className="text-sm text-muted-foreground">
            支援完整的 HTML 標記，包括圖片、連結、樣式等
          </p>
        </div>

        {/* 7. 帳號和標籤 */}
        <AccountTagsSelector
          accountId={accountId}
          setAccountId={setAccountId}
          tagsInput={tagsInput}
          setTagsInput={setTagsInput}
        />

        {/* 提交按鈕 */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
          >
            取消
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "創建中..." : editingLink ? "更新連結" : "創建連結"}
          </Button>
        </div>
      </form>
    </div>
  );
}