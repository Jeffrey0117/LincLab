'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LinkTemplateType, TEMPLATE_INFO } from '@/lib/template-types';
import { getTemplateExample } from '@/lib/template-examples';
import { Eye, X } from 'lucide-react';

// 導入所有模板組件
import ImageLink from '@/components/templates/ImageLink';
import ExternalLink from '@/components/templates/ExternalLink';
import BeautyTemplate from '@/components/templates/BeautyTemplate';
import ArticleTemplate from '@/components/templates/ArticleTemplate';

interface TemplatePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  templateType: LinkTemplateType | null;
  onConfirm?: () => void;
}

const TemplatePreviewDialog: React.FC<TemplatePreviewDialogProps> = ({
  isOpen,
  onClose,
  templateType,
  onConfirm,
}) => {
  if (!templateType) return null;

  const templateInfo = TEMPLATE_INFO[templateType];
  const example = getTemplateExample(templateType);
  const Icon = templateInfo.icon;

  // 渲染預覽內容
  const renderPreview = () => {
    const previewData = example.data;

    switch (templateType) {
      case 'image':
        return <ImageLink config={previewData} />;
      case 'external_link':
        return <ExternalLink config={previewData} />;
      case 'beauty':
        return <BeautyTemplate config={previewData} />;
      case 'article':
        return <ArticleTemplate config={previewData} />;
      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>預覽暫不可用</p>
          </div>
        );
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${templateInfo.color} bg-opacity-10`}>
              <Icon className={`w-6 h-6 ${templateInfo.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <DialogTitle className="text-xl">{example.name} - 模板預覽</DialogTitle>
              <DialogDescription className="mt-1">
                {example.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="bg-gray-100 rounded-lg p-2">
            <div className="bg-white rounded-lg shadow-sm">
              <ScrollArea className="h-[500px] w-full">
                <div className="p-4">
                  {renderPreview()}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0">
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              <X className="w-4 h-4 mr-2" />
              關閉
            </Button>
            {onConfirm && (
              <Button
                onClick={handleConfirm}
                className="flex-1 sm:flex-none"
              >
                <Eye className="w-4 h-4 mr-2" />
                使用此模板
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewDialog;