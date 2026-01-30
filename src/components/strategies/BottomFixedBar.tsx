import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BottomFixedBarProps {
  affiliateUrl: string;
  text?: string;
  enabled?: boolean;
}

const BottomFixedBar = ({
  affiliateUrl,
  text = "🎁 獨家優惠碼 - 立即領取",
  enabled = true,
}: BottomFixedBarProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    window.open(affiliateUrl, "_blank");
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 關閉也開連結，一個都跑不掉！
    window.open(affiliateUrl, "_blank");
    setIsVisible(false);
  };

  if (!enabled || !isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-primary text-white shadow-lg cursor-pointer animate-in slide-in-from-bottom duration-300"
      onClick={handleClick}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex-1 text-center font-semibold">
          {text}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BottomFixedBar;
