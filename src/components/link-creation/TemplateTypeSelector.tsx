'use client';

import React, { useState } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LinkTemplateType, TEMPLATE_INFO } from '@/lib/template-types';
import TemplatePreviewDialog from './TemplatePreviewDialog';

interface TemplateTypeSelectorProps {
  onSelect: (type: LinkTemplateType) => void;
  onBack: () => void;
  selectedType?: LinkTemplateType;
}

export default function TemplateTypeSelector({
  onSelect,
  onBack,
  selectedType,
}: TemplateTypeSelectorProps) {
  const [previewType, setPreviewType] = useState<LinkTemplateType | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSelect = (type: LinkTemplateType) => {
    onSelect(type);
  };

  const handlePreview = (e: React.MouseEvent, type: LinkTemplateType) => {
    e.stopPropagation(); // 防止觸發卡片的點擊事件
    setPreviewType(type);
    setIsPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
    setPreviewType(null);
  };

  const handlePreviewConfirm = () => {
    if (previewType) {
      handleSelect(previewType);
    }
  };

  // 獲取所有模板選項
  const templateOptions = Object.entries(TEMPLATE_INFO).map(([type, info]) => ({
    type: type as LinkTemplateType,
    ...info,
  }));

  return (
    <>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">選擇模板類型</h2>
        </div>

        {/* Template Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templateOptions.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.type}
                className={cn(
                  "relative cursor-pointer transition-all duration-200",
                  "hover:shadow-lg hover:scale-[1.02] hover:border-primary/50",
                  "p-6 space-y-3",
                  selectedType === template.type && [
                    "border-primary border-2",
                    "shadow-md",
                    "bg-primary/5",
                  ]
                )}
                onClick={() => handleSelect(template.type)}
              >
                {/* Recommended Badge */}
                {template.isRecommended && (
                  <Badge
                    className="absolute top-3 right-3"
                    variant="default"
                  >
                    推薦
                  </Badge>
                )}

                {/* Icon */}
                <div className={`inline-flex p-3 rounded-lg ${template.color} bg-opacity-10`}>
                  <Icon className={`w-8 h-8 ${template.color.replace('bg-', 'text-')}`} />
                </div>

                {/* Template Name */}
                <h3 className="font-bold text-lg">
                  {template.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>

                {/* Preview Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={(e) => handlePreview(e, template.type)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  預覽效果
                </Button>

                {/* Selected Indicator */}
                {selectedType === template.type && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-3 left-3">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Helper Text */}
        <p className="text-sm text-muted-foreground text-center">
          選擇一個模板類型來開始創建您的偽裝連結，點擊「預覽效果」可查看模板範例
        </p>
      </div>

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        isOpen={isPreviewOpen}
        onClose={handlePreviewClose}
        templateType={previewType}
        onConfirm={handlePreviewConfirm}
      />
    </>
  );
}