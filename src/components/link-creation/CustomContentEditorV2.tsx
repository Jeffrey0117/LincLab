"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AccountSelector from "./shared/AccountSelector";
import { useToast } from "@/hooks/use-toast";

interface BasicInfoData {
  title: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  faviconUrl: string;
}

interface CustomContentEditorV2Props {
  onBack?: () => void;
  onNext: (data: CustomContentData) => void;
  defaultAccountId?: string | null;
  editingLink?: any;
  basicInfo?: BasicInfoData;
}

// 只包含內容資料，策略在下一步選擇
export interface CustomContentData {
  title: string;
  htmlContent: string;
  affiliateUrl: string;
  accountId: string;
}

export default function CustomContentEditorV2({
  onBack,
  onNext,
  defaultAccountId,
  editingLink,
  basicInfo
}: CustomContentEditorV2Props) {
  const { toast } = useToast();

  // Content states
  const [title, setTitle] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  // Account states
  const [accountId, setAccountId] = useState(defaultAccountId || "none");

  // Load editing data if exists
  useEffect(() => {
    if (editingLink) {
      setTitle(editingLink.title || "");
      setAffiliateUrl(editingLink.affiliate_url || "");
      setHtmlContent(editingLink.html_content || "");
      setAccountId(editingLink.account_id || "none");
    }
  }, [editingLink]);

  // Handle next step (go to strategy selection)
  const handleNext = () => {
    // Validate required fields
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

    const data: CustomContentData = {
      title: title.trim() || basicInfo?.title || '',
      htmlContent: htmlContent.trim(),
      affiliateUrl: affiliateUrl.trim(),
      accountId,
    };

    onNext(data);
  };

  // 產生預覽 URL
  const getPreviewContent = () => {
    return htmlContent || "<p class='text-muted-foreground text-center py-8'>輸入內容後會在此顯示預覽</p>";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">自訂內容</h2>
          <p className="text-muted-foreground">自己撰寫 HTML 文章內容</p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回選擇
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* 連結標題 */}
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

        {/* 蝦皮分潤連結 */}
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

        {/* HTML 內容 */}
        <div className="space-y-2">
          <Label htmlFor="htmlContent">
            文章內容（HTML）<span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="htmlContent"
            rows={12}
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

        {/* 帳號選擇 */}
        <AccountSelector
          accountId={accountId}
          setAccountId={setAccountId}
          defaultAccountId={defaultAccountId}
        />

        {/* Preview */}
        {htmlContent && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4" />
              <h3 className="font-semibold">內容預覽</h3>
            </div>
            <div
              className="prose prose-lg max-w-none bg-background p-6 rounded border"
              dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            返回上一步
          </Button>
        )}
        <Button
          onClick={handleNext}
          className={`bg-gradient-primary hover:opacity-90 ${!onBack ? 'ml-auto' : ''}`}
        >
          下一步：選擇策略 →
        </Button>
      </div>
    </div>
  );
}
