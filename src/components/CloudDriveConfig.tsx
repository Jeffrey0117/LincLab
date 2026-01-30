'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CloudDriveConfig as CloudDriveConfigType } from '@/lib/strategy-types';

interface CloudDriveConfigProps {
  config: CloudDriveConfigType;
  onChange: (config: CloudDriveConfigType) => void;
}

export default function CloudDriveConfig({ config, onChange }: CloudDriveConfigProps) {
  const [extractCode, setExtractCode] = useState(config.extractCode || '8888');
  const [fileContent, setFileContent] = useState(config.fileContent || '感謝您的下載！\n\n這是您的專屬內容。');
  const [fileName, setFileName] = useState(config.fileName || '分享資料.txt');

  useEffect(() => {
    onChange({
      extractCode,
      fileContent,
      fileName,
    });
  }, [extractCode, fileContent, fileName]);

  // Sync with external config changes
  useEffect(() => {
    if (config.extractCode !== undefined) setExtractCode(config.extractCode);
    if (config.fileContent !== undefined) setFileContent(config.fileContent);
    if (config.fileName !== undefined) setFileName(config.fileName);
  }, [config]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>☁️</span>
          嘟嘟網盤設定
        </CardTitle>
        <CardDescription>
          設定提取碼和下載內容
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 提取碼 */}
        <div className="space-y-2">
          <Label htmlFor="extractCode">提取碼</Label>
          <Input
            id="extractCode"
            type="text"
            value={extractCode}
            onChange={(e) => setExtractCode(e.target.value)}
            placeholder="8888"
            maxLength={8}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            使用者需要輸入正確的提取碼才能下載內容（預設：8888）
          </p>
        </div>

        {/* 檔案名稱 */}
        <div className="space-y-2">
          <Label htmlFor="fileName">下載檔案名稱</Label>
          <Input
            id="fileName"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="分享資料.txt"
          />
          <p className="text-xs text-muted-foreground">
            使用者下載時顯示的檔案名稱
          </p>
        </div>

        {/* 檔案內容 */}
        <div className="space-y-2">
          <Label htmlFor="fileContent">下載內容</Label>
          <Textarea
            id="fileContent"
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            placeholder="輸入使用者下載後會看到的內容..."
            rows={6}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            使用者下載的 .txt 檔案內容
          </p>
        </div>

        {/* 預覽提示 */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>運作方式：</strong>使用者輸入正確提取碼後，會同時開啟分潤連結並顯示下載彈窗。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
