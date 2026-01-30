import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Eye } from "lucide-react";
import StrategySelector, { type StrategyType } from "@/components/StrategySelector";
import CookieTriggerConfig from "@/components/CookieTriggerConfig";
import {
  CookieStrategyConfig
} from "@/lib/strategy-types";
import { Account, ACCOUNT_TYPE_ICONS } from "@/lib/account-types";

interface Link {
  id: string;
  short_code: string;
  title?: string;
  html_content: string;
  affiliate_url: string;
  created_at: string;
  is_active: boolean;
  strategy?: StrategyType;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  favicon_url?: string;
  account_id?: string;
  tags?: string[];
}

interface CreateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingLink?: Link | null;
  defaultAccountId?: string | null;
}

const CreateLinkDialog = ({ open, onOpenChange, onSuccess, editingLink, defaultAccountId }: CreateLinkDialogProps) => {
  const [title, setTitle] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [strategy, setStrategy] = useState<StrategyType>("cookie_popup");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [strategyConfig, setStrategyConfig] = useState<Partial<CookieStrategyConfig>>({});
  const [accountId, setAccountId] = useState<string>("none");
  const [tagsInput, setTagsInput] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkMode, setLinkMode] = useState<'redirect' | 'proxy_preview'>('redirect');
  const [targetUrl, setTargetUrl] = useState("");
  const [proxyContent, setProxyContent] = useState("");
  const { toast } = useToast();

  // 載入帳號列表
  useEffect(() => {
    const fetchAccounts = async () => {
      const { data } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setAccounts(data);
      }
    };

    if (open) {
      fetchAccounts();
    }
  }, [open]);

  useEffect(() => {
    if (editingLink) {
      setTitle(editingLink.title || "");
      setHtmlContent(editingLink.html_content);
      setAffiliateUrl(editingLink.affiliate_url);
      setStrategy(editingLink.strategy || "cookie_popup");
      setOgTitle(editingLink.og_title || "");
      setOgDescription(editingLink.og_description || "");
      setOgImage(editingLink.og_image || "");
      setFaviconUrl(editingLink.favicon_url || "");
      setStrategyConfig((editingLink as any).strategy_config || {});
      setAccountId(editingLink.account_id || "none");
      setTagsInput(editingLink.tags?.join(", ") || "");
      setLinkMode((editingLink as any).link_mode || 'redirect');
      setTargetUrl((editingLink as any).target_url || '');
      setProxyContent((editingLink as any).proxy_content || '');
    } else {
      setTitle("");
      setHtmlContent("");
      setAffiliateUrl("");
      setStrategy("cookie_popup");
      setOgTitle("");
      setOgDescription("");
      setOgImage("");
      setFaviconUrl("");
      setStrategyConfig({});
      // 如果有預設帳號ID，使用它；否則設為 "none"
      setAccountId(defaultAccountId || "none");
      setTagsInput("");
      setLinkMode('redirect');
      setTargetUrl('');
      setProxyContent('');
    }
  }, [editingLink, open, defaultAccountId]);

  // 當選擇帳號時，自動套入帳號的預設值（僅在建立新連結時）
  useEffect(() => {
    // 只在建立新連結且選擇了帳號時執行
    if (!editingLink && accountId && accountId !== "none" && accounts.length > 0) {
      const selectedAccount = accounts.find(a => a.id === accountId);
      if (selectedAccount) {
        // 自動套入預設值（只在欄位為空時）
        if (!ogTitle && selectedAccount.default_og_title) {
          setOgTitle(selectedAccount.default_og_title);
        }
        if (!ogDescription && selectedAccount.default_og_description) {
          setOgDescription(selectedAccount.default_og_description);
        }
        if (!ogImage && selectedAccount.default_og_image) {
          setOgImage(selectedAccount.default_og_image);
        }
        if (!faviconUrl && selectedAccount.default_favicon_url) {
          setFaviconUrl(selectedAccount.default_favicon_url);
        }
        if (!affiliateUrl && selectedAccount.default_affiliate_url) {
          setAffiliateUrl(selectedAccount.default_affiliate_url);
        }
      }
    }
  }, [accountId, accounts, editingLink]);

  const generateShortCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("未登入");

      // 處理標籤：逗號分隔的字串轉成陣列
      const tags = tagsInput
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const linkData = {
        title: title || null,
        html_content: htmlContent,
        affiliate_url: affiliateUrl,
        strategy: strategy,
        og_title: ogTitle || null,
        og_description: ogDescription || null,
        og_image: ogImage || null,
        favicon_url: faviconUrl || null,
        strategy_config: ((strategy === 'cookie_popup') && Object.keys(strategyConfig).length > 0) ? strategyConfig : null,
        account_id: accountId && accountId !== "none" ? accountId : null,
        tags: tags.length > 0 ? tags : null,
        // 新增字段
        link_mode: linkMode,
        target_url: linkMode === 'proxy_preview' ? targetUrl : null,
        proxy_content: linkMode === 'proxy_preview' ? proxyContent : null,
      };

      if (editingLink) {
        // 編輯模式
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
        // 新增模式
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

      setTitle("");
      setHtmlContent("");
      setAffiliateUrl("");
      setStrategy("cookie_popup");
      setOgTitle("");
      setOgDescription("");
      setOgImage("");
      setFaviconUrl("");
      setStrategyConfig({});
      setAccountId("none");
      setTagsInput("");
      setLinkMode('redirect');
      setTargetUrl('');
      setProxyContent('');
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingLink ? "編輯分潤連結" : "新增分潤連結"}</DialogTitle>
          <DialogDescription>
            {editingLink
              ? "修改文章內容和蝦皮分潤連結"
              : "填寫文章內容和蝦皮分潤連結，系統將自動生成短網址"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">連結標題（選填）</Label>
            <Input
              id="title"
              placeholder="例如：AirPods Pro 2 開箱評測"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              方便在後台管理時識別連結
            </p>
          </div>

          {/* 新增：帳號選擇 */}
          <div className="space-y-2">
            <Label htmlFor="account">所屬帳號（選填）</Label>
            <Select
              value={accountId}
              onValueChange={setAccountId}
              disabled={!!defaultAccountId && !editingLink}
            >
              <SelectTrigger id="account">
                <SelectValue placeholder="選擇帳號（不選則不分類）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">不選擇帳號</span>
                  </div>
                </SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{ACCOUNT_TYPE_ICONS[account.type]}</span>
                      <span>{account.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {defaultAccountId && !editingLink
                ? "已自動選擇帳號"
                : "選擇帳號後可以批量管理同類型連結"}
            </p>
          </div>

          {/* 連結模式選擇 */}
          <div className="space-y-2">
            <Label htmlFor="linkMode">連結模式</Label>
            <Select
              value={linkMode}
              onValueChange={(value: 'redirect' | 'proxy_preview') => setLinkMode(value)}
            >
              <SelectTrigger id="linkMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="redirect">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    <div>
                      <div>重定向模式</div>
                      <div className="text-xs text-muted-foreground">直接跳轉到蝦皮連結</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="proxy_preview">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <div>
                      <div>預覽卡片模式</div>
                      <div className="text-xs text-muted-foreground">顯示預覽卡片，用戶選擇查看原文或購買</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 當選擇預覽模式時，顯示目標網址和預覽內容字段 */}
          {linkMode === 'proxy_preview' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="targetUrl">目標網址（推薦文章/評測的原始網址）</Label>
                <Input
                  id="targetUrl"
                  placeholder="https://example.com/article"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required={linkMode === 'proxy_preview'}
                />
                <p className="text-xs text-muted-foreground">
                  系統會顯示這個網址的預覽卡片
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proxyContent">預覽摘要（選填）</Label>
                <Textarea
                  id="proxyContent"
                  placeholder="輸入文章摘要或推薦理由..."
                  value={proxyContent}
                  onChange={(e) => setProxyContent(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  填寫摘要可以讓用戶更快了解內容，不填則只顯示標題和描述
                </p>
              </div>
            </>
          )}

          {/* 新增：標籤輸入 */}
          <div className="space-y-2">
            <Label htmlFor="tags">標籤（選填）</Label>
            <Input
              id="tags"
              placeholder="例如：正妹, 穿搭, 夏日"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              用逗號分隔多個標籤，方便搜尋和篩選
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="html">文章內容 (HTML)</Label>
            <Textarea
              id="html"
              placeholder="<h1>產品評測</h1><p>這是一個很棒的產品...</p>"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              required
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              支援 HTML 標籤，例如 &lt;h1&gt;, &lt;p&gt;, &lt;img&gt; 等
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">蝦皮分潤連結</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://shope.ee/..."
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              請貼上完整的蝦皮分潤連結
            </p>
          </div>

          <div className="pt-4 border-t">
            <StrategySelector
              value={strategy}
              onChange={(newStrategy) => {
                setStrategy(newStrategy);
                // 當策略改變時，清空配置
                setStrategyConfig({});
              }}
            />
          </div>

          {strategy === 'cookie_popup' && (
            <div className="pt-4">
              <CookieTriggerConfig
                config={strategyConfig as Partial<CookieStrategyConfig>}
                onChange={setStrategyConfig}
              />
            </div>
          )}

          <div className="pt-4 border-t space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">社群分享設定 (OG Tags)</h3>
              <p className="text-xs text-muted-foreground">
                設定分享到 LINE、FB、IG 等社群媒體時顯示的內容
                {!editingLink && accountId && accountId !== "none" && (
                  <span className="text-primary font-medium"> · 已自動套入帳號預設值，您仍可手動修改</span>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_title">分享標題</Label>
              <Input
                id="og_title"
                placeholder="例如：超讚的開箱評測！"
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                出現在社群預覽的標題
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_description">分享描述</Label>
              <Textarea
                id="og_description"
                placeholder="例如：這個產品真的太好用了，強烈推薦..."
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                出現在社群預覽的描述文字
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_image">分享預覽圖</Label>
              <Input
                id="og_image"
                type="url"
                placeholder="https://i.imgur.com/example.jpg"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                出現在社群預覽的圖片（建議 1200x630 px）
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="favicon">網站小圖示 (Favicon)</Label>
              <Input
                id="favicon"
                type="url"
                placeholder="https://i.imgur.com/icon.png"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                出現在瀏覽器分頁的小圖示
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary hover:opacity-90"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingLink ? "更新連結" : "生成連結"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLinkDialog;
