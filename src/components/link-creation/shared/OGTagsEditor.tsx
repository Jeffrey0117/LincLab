"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageIcon, Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OGTagsEditorProps {
  ogTitle: string;
  setOgTitle: (value: string) => void;
  ogDescription: string;
  setOgDescription: (value: string) => void;
  ogImage: string;
  setOgImage: (value: string) => void;
  faviconUrl: string;
  setFaviconUrl: (value: string) => void;
}

export default function OGTagsEditor({
  ogTitle,
  setOgTitle,
  ogDescription,
  setOgDescription,
  ogImage,
  setOgImage,
  faviconUrl,
  setFaviconUrl,
}: OGTagsEditorProps) {
  const [editingImage, setEditingImage] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [editingFavicon, setEditingFavicon] = useState(false);
  const [tempImage, setTempImage] = useState(ogImage);
  const [tempTitle, setTempTitle] = useState(ogTitle);
  const [tempDescription, setTempDescription] = useState(ogDescription);
  const [tempFavicon, setTempFavicon] = useState(faviconUrl);

  const handleImageEdit = () => {
    setTempImage(ogImage);
    setEditingImage(true);
  };

  const handleTextEdit = () => {
    setTempTitle(ogTitle);
    setTempDescription(ogDescription);
    setEditingText(true);
  };

  const handleFaviconEdit = () => {
    setTempFavicon(faviconUrl);
    setEditingFavicon(true);
  };

  const saveImage = () => {
    setOgImage(tempImage);
    setEditingImage(false);
  };

  const saveText = () => {
    setOgTitle(tempTitle);
    setOgDescription(tempDescription);
    setEditingText(false);
  };

  const saveFavicon = () => {
    setFaviconUrl(tempFavicon);
    setEditingFavicon(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">社群分享外觀設置</h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFaviconEdit}
        >
          <Settings2 className="h-4 w-4 mr-1" />
          網站圖示
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        這些資訊會顯示在 Facebook、LINE 等社群平台的分享預覽中（點擊即可編輯）
      </p>

      {/* 所見即所得預覽卡片 */}
      <div className="border rounded-lg overflow-hidden bg-background hover:shadow-md transition-shadow">
        {/* 圖片區域 - 可點擊編輯 */}
        <div
          className="relative group cursor-pointer"
          onClick={handleImageEdit}
        >
          {ogImage ? (
            <img
              src={ogImage}
              alt="預覽圖片"
              className="w-full aspect-[1200/630] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'%3E%3Crect fill='%23f0f0f0' width='1200' height='630'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24'%3E點擊上傳圖片%3C/text%3E%3C/svg%3E";
              }}
            />
          ) : (
            <div className="w-full aspect-[1200/630] bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-16 w-16 mx-auto mb-2" />
                <p className="text-sm">點擊設置圖片</p>
                <p className="text-xs">建議尺寸：1200x630px</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-white text-center">
              <ImageIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">點擊編輯圖片</p>
            </div>
          </div>
        </div>

        {/* 文字區域 - 可點擊編輯 */}
        <div
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={handleTextEdit}
        >
          <h4 className="font-semibold text-base mb-1 line-clamp-2">
            {ogTitle || "點擊輸入標題"}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {ogDescription || "點擊輸入描述"}
          </p>
          {!ogTitle && !ogDescription && (
            <p className="text-xs text-primary mt-2">點擊此區域編輯標題和描述</p>
          )}
        </div>
      </div>

      {/* 編輯圖片對話框 */}
      <Dialog open={editingImage} onOpenChange={setEditingImage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯分享圖片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editOgImage">
                圖片網址 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editOgImage"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={tempImage}
                onChange={(e) => setTempImage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                建議尺寸：1200x630px，會顯示在社群分享卡片中
              </p>
            </div>

            {tempImage && (
              <div className="border rounded p-2">
                <p className="text-xs text-muted-foreground mb-2">預覽：</p>
                <img
                  src={tempImage}
                  alt="預覽"
                  className="w-full h-32 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingImage(false)}
              >
                取消
              </Button>
              <Button type="button" onClick={saveImage}>
                確定
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 編輯文字對話框 */}
      <Dialog open={editingText} onOpenChange={setEditingText}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯標題和描述</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editOgTitle">
                分享標題 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editOgTitle"
                placeholder="例如：iPhone 16 Pro 開箱評測 - 最值得購買的手機"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                會顯示在社群分享卡片的標題，建議 40-60 字
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editOgDescription">
                分享描述 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="editOgDescription"
                placeholder="簡短描述這個推薦的內容，吸引用戶點擊..."
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                會顯示在標題下方，建議 80-120 字
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingText(false)}
              >
                取消
              </Button>
              <Button type="button" onClick={saveText}>
                確定
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 編輯網站圖示對話框 */}
      <Dialog open={editingFavicon} onOpenChange={setEditingFavicon}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>設定網站圖示</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFavicon">網站圖示網址（選填）</Label>
              <Input
                id="editFavicon"
                type="url"
                placeholder="https://example.com/favicon.ico"
                value={tempFavicon}
                onChange={(e) => setTempFavicon(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                會顯示在瀏覽器分頁標籤上
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingFavicon(false)}
              >
                取消
              </Button>
              <Button type="button" onClick={saveFavicon}>
                確定
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
