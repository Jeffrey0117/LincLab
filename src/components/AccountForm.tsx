import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Account, AccountType, ACCOUNT_TYPES } from "@/lib/account-types";

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingAccount?: Account | null;
}

const AccountForm = ({ open, onOpenChange, onSuccess, editingAccount }: AccountFormProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("beauty");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  // OG 模版欄位
  const [defaultOgTitle, setDefaultOgTitle] = useState("");
  const [defaultOgDescription, setDefaultOgDescription] = useState("");
  const [defaultOgImage, setDefaultOgImage] = useState("");
  const [defaultFaviconUrl, setDefaultFaviconUrl] = useState("");
  const [defaultAffiliateUrl, setDefaultAffiliateUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setType(editingAccount.type);
      setDescription(editingAccount.description || "");
      setAvatarUrl(editingAccount.avatar_url || "");
      setDefaultOgTitle(editingAccount.default_og_title || "");
      setDefaultOgDescription(editingAccount.default_og_description || "");
      setDefaultOgImage(editingAccount.default_og_image || "");
      setDefaultFaviconUrl(editingAccount.default_favicon_url || "");
      setDefaultAffiliateUrl(editingAccount.default_affiliate_url || "");
    } else {
      setName("");
      setType("beauty");
      setDescription("");
      setAvatarUrl("");
      setDefaultOgTitle("");
      setDefaultOgDescription("");
      setDefaultOgImage("");
      setDefaultFaviconUrl("");
      setDefaultAffiliateUrl("");
    }
  }, [editingAccount, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("未登入");

      if (editingAccount) {
        // 編輯模式
        const { error } = await supabase
          .from("accounts")
          .update({
            name,
            type,
            description: description || null,
            avatar_url: avatarUrl || null,
            default_og_title: defaultOgTitle || null,
            default_og_description: defaultOgDescription || null,
            default_og_image: defaultOgImage || null,
            default_favicon_url: defaultFaviconUrl || null,
            default_affiliate_url: defaultAffiliateUrl || null,
          })
          .eq("id", editingAccount.id);

        if (error) throw error;

        toast({
          title: "成功",
          description: "帳號已成功更新！",
        });
      } else {
        // 新增模式
        const { error } = await supabase.from("accounts").insert({
          user_id: user.id,
          name,
          type,
          description: description || null,
          avatar_url: avatarUrl || null,
          default_og_title: defaultOgTitle || null,
          default_og_description: defaultOgDescription || null,
          default_og_image: defaultOgImage || null,
          default_favicon_url: defaultFaviconUrl || null,
          default_affiliate_url: defaultAffiliateUrl || null,
        });

        if (error) throw error;

        toast({
          title: "成功",
          description: "帳號已成功創建！",
        });
      }

      setName("");
      setType("beauty");
      setDescription("");
      setAvatarUrl("");
      setDefaultOgTitle("");
      setDefaultOgDescription("");
      setDefaultOgImage("");
      setDefaultFaviconUrl("");
      setDefaultAffiliateUrl("");
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
          <DialogTitle>{editingAccount ? "編輯帳號" : "新增帳號"}</DialogTitle>
          <DialogDescription>
            {editingAccount
              ? "修改帳號資訊"
              : "建立一個新帳號來管理同類型的連結"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">帳號名稱 *</Label>
            <Input
              id="name"
              placeholder="例如：正妹帳號 - IG小模"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              方便識別這個帳號的用途
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">帳號類型 *</Label>
            <Select value={type} onValueChange={(value: AccountType) => setType(value)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="選擇帳號類型" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((accountType) => (
                  <SelectItem key={accountType.id} value={accountType.id}>
                    <div className="flex items-center gap-2">
                      <span>{accountType.icon}</span>
                      <span>{accountType.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {ACCOUNT_TYPES.find(t => t.id === type)?.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述（選填）</Label>
            <Textarea
              id="description"
              placeholder="例如：專門分享夏日穿搭的正妹帳號"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">頭像 URL（選填）</Label>
            <Input
              id="avatar"
              type="url"
              placeholder="https://i.imgur.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              帳號的頭像圖片連結
            </p>
          </div>

          {/* OG 模版設定區塊 */}
          <div className="pt-4 border-t space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">預設模版設定</h3>
              <p className="text-xs text-muted-foreground">
                設定此帳號的預設值，建立連結時會自動套入這些內容
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_og_title">預設 OG 標題</Label>
              <Input
                id="default_og_title"
                placeholder="例如：【正妹推薦】..."
                value={defaultOgTitle}
                onChange={(e) => setDefaultOgTitle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                分享到社群媒體時顯示的標題
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_og_description">預設 OG 描述</Label>
              <Textarea
                id="default_og_description"
                placeholder="例如：精選IG正妹穿搭分享..."
                value={defaultOgDescription}
                onChange={(e) => setDefaultOgDescription(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                分享到社群媒體時顯示的描述
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_og_image">預設 OG 預覽圖</Label>
              <Input
                id="default_og_image"
                type="url"
                placeholder="https://i.imgur.com/preview.jpg"
                value={defaultOgImage}
                onChange={(e) => setDefaultOgImage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                分享預覽圖（建議 1200x630px）
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_favicon">預設 Favicon</Label>
              <Input
                id="default_favicon"
                type="url"
                placeholder="https://i.imgur.com/icon.png"
                value={defaultFaviconUrl}
                onChange={(e) => setDefaultFaviconUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                瀏覽器分頁的小圖示
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_affiliate">預設蝦皮分潤連結</Label>
              <Input
                id="default_affiliate"
                type="url"
                placeholder="https://shope.ee/..."
                value={defaultAffiliateUrl}
                onChange={(e) => setDefaultAffiliateUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                預設的蝦皮分潤連結
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
              {editingAccount ? "更新帳號" : "創建帳號"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountForm;
