import { useState } from "react";
import { Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingButtonProps {
  affiliateUrl: string;
  text?: string;
  position?: "left" | "right";
  enabled?: boolean;
}

const FloatingButton = ({
  affiliateUrl,
  text = "限時優惠",
  position = "right",
  enabled = true,
}: FloatingButtonProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    window.open(affiliateUrl, "_blank");
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 關閉也開連結
    window.open(affiliateUrl, "_blank");
    setIsVisible(false);
  };

  if (!enabled || !isVisible) return null;

  const positionClass = position === "right" ? "right-4" : "left-4";

  return (
    <div
      className={`fixed ${positionClass} top-1/2 -translate-y-1/2 z-50 animate-in slide-in-from-${position} duration-500`}
    >
      <div className="relative group">
        <Button
          onClick={handleClick}
          className="bg-gradient-primary hover:opacity-90 shadow-glow h-auto py-4 px-3 flex flex-col items-center gap-2 rounded-lg"
        >
          <Tag className="h-5 w-5" />
          <span className="text-xs font-semibold whitespace-nowrap writing-mode-vertical">
            {text}
          </span>
        </Button>
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default FloatingButton;
