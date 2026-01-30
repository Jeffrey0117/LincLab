'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ChevronRight, Image, Globe, Settings2, Edit2, X, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BasicInfoData {
  title: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  faviconUrl: string
}

interface BasicInfoEditorProps {
  onNext: (data: BasicInfoData) => void
  onSkip: () => void
  initialData?: Partial<BasicInfoData>
  onChange?: (data: BasicInfoData) => void
}

export default function BasicInfoEditor({
  onNext,
  onSkip,
  initialData = {},
  onChange
}: BasicInfoEditorProps) {
  const [formData, setFormData] = useState<BasicInfoData>({
    title: initialData.title || '',
    ogTitle: initialData.ogTitle || '',
    ogDescription: initialData.ogDescription || '',
    ogImage: initialData.ogImage || '',
    faviconUrl: initialData.faviconUrl || '',
  })

  // Sync with initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || '',
        ogTitle: initialData.ogTitle || '',
        ogDescription: initialData.ogDescription || '',
        ogImage: initialData.ogImage || '',
        faviconUrl: initialData.faviconUrl || '',
      })
    }
  }, [initialData?.title, initialData?.ogTitle]) // Only update when key fields change

  // Notify parent of changes (for edit mode) - debounced
  useEffect(() => {
    if (onChange) {
      // Only notify if data is different from initialData (avoid circular updates)
      const hasChanges =
        formData.title !== (initialData.title || '') ||
        formData.ogTitle !== (initialData.ogTitle || '') ||
        formData.ogDescription !== (initialData.ogDescription || '') ||
        formData.ogImage !== (initialData.ogImage || '') ||
        formData.faviconUrl !== (initialData.faviconUrl || '')

      if (hasChanges) {
        // Use a timeout to debounce
        const timeoutId = setTimeout(() => {
          onChange(formData)
        }, 100)

        return () => clearTimeout(timeoutId)
      }
    }
  }, [formData.title, formData.ogTitle, formData.ogDescription, formData.ogImage, formData.faviconUrl, onChange, initialData])

  // Dialog states
  const [editingText, setEditingText] = useState(false)
  const [editingImage, setEditingImage] = useState(false)
  const [editingFavicon, setEditingFavicon] = useState(false)

  // Temp states for dialogs
  const [tempOgTitle, setTempOgTitle] = useState('')
  const [tempOgDescription, setTempOgDescription] = useState('')
  const [tempOgImage, setTempOgImage] = useState('')
  const [tempFaviconUrl, setTempFaviconUrl] = useState('')

  const handleTextEdit = () => {
    setTempOgTitle(formData.ogTitle)
    setTempOgDescription(formData.ogDescription)
    setEditingText(true)
  }

  const handleImageEdit = () => {
    setTempOgImage(formData.ogImage)
    setEditingImage(true)
  }

  const handleFaviconEdit = () => {
    setTempFaviconUrl(formData.faviconUrl)
    setEditingFavicon(true)
  }

  const saveText = () => {
    setFormData(prev => ({
      ...prev,
      ogTitle: tempOgTitle,
      ogDescription: tempOgDescription
    }))
    setEditingText(false)
  }

  const saveImage = () => {
    setFormData(prev => ({ ...prev, ogImage: tempOgImage }))
    setEditingImage(false)
  }

  const saveFavicon = () => {
    setFormData(prev => ({ ...prev, faviconUrl: tempFaviconUrl }))
    setEditingFavicon(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">基本資訊設定</h2>
        <p className="text-muted-foreground">
          設定連結標題與社群分享外觀（選填）
        </p>
      </div>

      {/* Link Title Input */}
      <div className="space-y-2">
        <Label htmlFor="link-title" className="flex items-center gap-2">
          <span className="text-lg">🦗</span>
          連結標題
        </Label>
        <Input
          id="link-title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="例如：黑色星期五促銷活動"
        />
        <p className="text-xs text-muted-foreground">
          用於後台管理識別此連結，不會顯示給訪客
        </p>
      </div>

      {/* OG Preview Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">分享卡片設定</h3>
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
          設定在 Facebook、LINE 等社群平台分享時顯示的卡片（點擊卡片即可編輯）
        </p>

        {/* Visual Preview Card */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          {/* Image Area */}
          <div
            className="relative h-48 bg-muted flex items-center justify-center cursor-pointer group"
            onClick={handleImageEdit}
          >
            {formData.ogImage ? (
              <>
                <img
                  src={formData.ogImage}
                  alt="OG Image Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit2 className="h-6 w-6 text-white" />
                </div>
              </>
            ) : (
              <div className="text-center">
                <Image className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">點擊設定預覽圖片</p>
              </div>
            )}
          </div>

          {/* Text Content */}
          <div
            className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={handleTextEdit}
          >
            <h4 className="font-semibold line-clamp-1 mb-1">
              {formData.ogTitle || '點擊設定標題'}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {formData.ogDescription || '點擊設定描述文字'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {formData.faviconUrl && (
                <span className="inline-flex items-center gap-1">
                  <img src={formData.faviconUrl} alt="" className="w-4 h-4" />
                  你的網站名稱
                </span>
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
        >
          跳過此步驟
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-gradient-primary hover:opacity-90"
        >
          下一步
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Edit Dialogs */}
      {/* Text Dialog */}
      <Dialog open={editingText} onOpenChange={setEditingText}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯分享文字</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="og-title">分享標題</Label>
              <Input
                id="og-title"
                value={tempOgTitle}
                onChange={(e) => setTempOgTitle(e.target.value)}
                placeholder="吸引人的標題"
              />
            </div>
            <div>
              <Label htmlFor="og-description">分享描述</Label>
              <Textarea
                id="og-description"
                value={tempOgDescription}
                onChange={(e) => setTempOgDescription(e.target.value)}
                placeholder="簡短的描述文字"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingText(false)}>
                取消
              </Button>
              <Button onClick={saveText}>
                儲存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={editingImage} onOpenChange={setEditingImage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯預覽圖片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="og-image">圖片網址</Label>
              <Input
                id="og-image"
                type="url"
                value={tempOgImage}
                onChange={(e) => setTempOgImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                建議尺寸：1200x630 像素
              </p>
            </div>
            {tempOgImage && (
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={tempOgImage}
                  alt="Preview"
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingImage(false)}>
                取消
              </Button>
              <Button onClick={saveImage}>
                儲存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Favicon Dialog */}
      <Dialog open={editingFavicon} onOpenChange={setEditingFavicon}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯網站圖示</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="favicon">網站圖示網址</Label>
              <Input
                id="favicon"
                type="url"
                value={tempFaviconUrl}
                onChange={(e) => setTempFaviconUrl(e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />
              <p className="text-xs text-muted-foreground mt-1">
                顯示在瀏覽器標籤和書籤中的小圖示
              </p>
            </div>
            {tempFaviconUrl && (
              <div className="flex items-center gap-2">
                <img
                  src={tempFaviconUrl}
                  alt="Favicon"
                  className="w-8 h-8"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <span className="text-sm text-muted-foreground">預覽</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingFavicon(false)}>
                取消
              </Button>
              <Button onClick={saveFavicon}>
                儲存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}