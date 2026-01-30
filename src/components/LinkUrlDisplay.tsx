'use client';

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface LinkUrlDisplayProps {
  shortCode: string;
  onCopy: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

export default function LinkUrlDisplay({ shortCode, onCopy, onClick }: LinkUrlDisplayProps) {
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/${shortCode}` : `/${shortCode}`;

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 px-2.5 py-1.5 bg-muted/60 rounded-md text-xs font-mono truncate">
        {fullUrl}
      </code>
      <Button
        size="sm"
        className="bg-gradient-primary hover:opacity-90 shadow-md hover:shadow-lg transition-all font-semibold px-4 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(e);
          onCopy();
        }}
      >
        <Copy className="mr-2 h-4 w-4" />
        複製連結
      </Button>
    </div>
  );
}
