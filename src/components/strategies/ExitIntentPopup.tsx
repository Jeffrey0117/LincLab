import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExitIntentPopupProps {
  affiliateUrl: string;
  enabled?: boolean;
}

const ExitIntentPopup = ({ affiliateUrl, enabled = true }: ExitIntentPopupProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!enabled || hasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // 偵測滑鼠移出視窗頂部
      if (e.clientY <= 0) {
        setShowDialog(true);
        setHasShown(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enabled, hasShown]);

  const handleViewOffer = () => {
    window.open(affiliateUrl, "_blank");
    setShowDialog(false);
  };

  const handleLater = () => {
    window.open(affiliateUrl, "_blank");
    setShowDialog(false);
  };

  if (!enabled) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>等等！別錯過限時優惠 🎁</DialogTitle>
          <DialogDescription>
            我們為您準備了獨家優惠，現在查看立即享受特別折扣！
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleLater}>
            稍後再說
          </Button>
          <Button
            onClick={handleViewOffer}
            className="bg-gradient-primary hover:opacity-90"
          >
            立即查看優惠
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
