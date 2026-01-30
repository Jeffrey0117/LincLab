'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from './CopyButton';
import { AutomationStrategy } from '@/lib/automation-data';
import {
  ArrowLeft,
  Link,
  FileText,
  Eye,
  Copy,
  CheckCircle,
  Share2,
  BarChart,
  MousePointer
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StrategyDetailProps {
  strategy: AutomationStrategy;
}

export function StrategyDetail({ strategy }: StrategyDetailProps) {
  const router = useRouter();
  const [isUsed, setIsUsed] = useState(false);

  const handleCopyAll = async () => {
    const fullText = `${strategy.content}\n\n${strategy.shortLink}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setIsUsed(true);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/automation')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{strategy.icon}</span>
            <h1 className="text-2xl font-bold">{strategy.title}</h1>
            {isUsed && (
              <Badge className="bg-green-500">已使用</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{strategy.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <BarChart className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">使用次數</p>
              <p className="text-2xl font-bold">{strategy.useCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <MousePointer className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">總點擊數</p>
              <p className="text-2xl font-bold">{strategy.clickCount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            貼文文案
          </CardTitle>
          <CardDescription>
            字數：{strategy.content.length} 字
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm">
            {strategy.content}
          </div>
          <div className="flex gap-2 mt-4">
            <CopyButton
              text={strategy.content}
              label="複製文案"
              variant="outline"
            />
            <div className="flex flex-wrap gap-1">
              {strategy.hashtags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Short Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            短連結
          </CardTitle>
          <CardDescription>
            點擊複製連結到剪貼簿
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted/50 rounded-lg px-4 py-2 font-mono text-sm">
              {strategy.shortLink}
            </div>
            <CopyButton
              text={strategy.shortLink}
              label="複製連結"
              variant="outline"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            社群分享預覽
          </CardTitle>
          <CardDescription>
            在社群平台上的顯示效果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-32 flex items-center justify-center">
              <span className="text-6xl">{strategy.icon}</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{strategy.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
              <p className="text-xs text-muted-foreground mt-2">{strategy.shortLink}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
        <Button
          size="lg"
          className="flex-1"
          onClick={handleCopyAll}
        >
          <Copy className="mr-2 h-5 w-5" />
          複製文案與連結
        </Button>
        <Button
          size="lg"
          variant={isUsed ? "secondary" : "outline"}
          onClick={() => setIsUsed(!isUsed)}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          {isUsed ? '已標記使用' : '標記為已使用'}
        </Button>
        <Button
          size="lg"
          variant="outline"
        >
          <Share2 className="mr-2 h-5 w-5" />
          分享
        </Button>
      </div>
    </div>
  );
}