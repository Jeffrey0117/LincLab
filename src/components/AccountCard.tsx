import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Link } from "lucide-react";
import { Account, AccountType, ACCOUNT_TYPE_ICONS } from "@/lib/account-types";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  account?: Account;
  linkCount?: number;
  isSelected?: boolean;
  isAddCard?: boolean;
  onSelect?: () => void;
  onAddLink?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddAccount?: () => void;
}

// 帳號類型對應的漸層顏色
const getAccountGradient = (type?: AccountType): string => {
  if (!type) return "from-gray-50 to-gray-100";

  const gradientMap: Record<AccountType, string> = {
    beauty: "from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200",
    professional: "from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200",
    emotion: "from-red-50 to-red-100 hover:from-red-100 hover:to-red-200",
    curiosity: "from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200",
    lifestyle: "from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200",
    benefit: "from-green-50 to-green-100 hover:from-green-100 hover:to-green-200",
  };

  return gradientMap[type] || "from-gray-50 to-gray-100";
};

// 選中狀態的邊框顏色
const getSelectedBorderColor = (type?: AccountType): string => {
  if (!type) return "border-gray-400";

  const borderMap: Record<AccountType, string> = {
    beauty: "border-pink-400",
    professional: "border-blue-400",
    emotion: "border-red-400",
    curiosity: "border-purple-400",
    lifestyle: "border-yellow-400",
    benefit: "border-green-400",
  };

  return borderMap[type] || "border-gray-400";
};

const AccountCard = ({
  account,
  linkCount = 0,
  isSelected = false,
  isAddCard = false,
  onSelect,
  onAddLink,
  onEdit,
  onDelete,
  onAddAccount,
}: AccountCardProps) => {
  // 新增帳號卡片
  if (isAddCard) {
    return (
      <Card
        className={cn(
          "relative w-[180px] h-[220px] flex-shrink-0 p-5 cursor-pointer",
          "bg-gradient-to-br from-gray-50 to-gray-100",
          "hover:shadow-lg hover:-translate-y-1 transition-all duration-200",
          "border-2 border-dashed border-gray-300 hover:border-gray-400",
          "flex flex-col items-center justify-center"
        )}
        onClick={onAddAccount}
      >
        <div className="text-4xl mb-3">
          <Plus className="h-9 w-9 text-gray-400" />
        </div>
        <p className="text-base font-semibold text-gray-600">新增帳號</p>
        <p className="text-sm text-gray-500 mt-1">創建新的帳號分類</p>
      </Card>
    );
  }

  // 帳號卡片
  if (!account) return null;

  return (
    <Card
      className={cn(
        "relative w-[180px] h-[220px] flex-shrink-0 p-5 cursor-pointer",
        "bg-gradient-to-br transition-all duration-200",
        getAccountGradient(account.type),
        "hover:shadow-lg hover:-translate-y-1",
        "border-2",
        isSelected
          ? `${getSelectedBorderColor(account.type)} shadow-lg`
          : "border-transparent hover:border-gray-200",
      )}
      onClick={onSelect}
    >
      {/* 內容區域 */}
      <div className="flex flex-col h-full">
        {/* 圖標 */}
        <div className="text-center mb-3">
          <span className="text-4xl">{ACCOUNT_TYPE_ICONS[account.type]}</span>
        </div>

        {/* 帳號名稱 */}
        <h3 className="text-base font-semibold text-gray-800 text-center mb-2 line-clamp-1">
          {account.name}
        </h3>

        {/* 連結統計 */}
        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-4">
          <Link className="h-3.5 w-3.5" />
          <span>{linkCount} 個連結</span>
        </div>

        {/* 主要操作按鈕 */}
        <Button
          size="sm"
          className="w-full mb-3"
          variant="default"
          onClick={(e) => {
            e.stopPropagation();
            onAddLink?.();
          }}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          新增連結
        </Button>

        {/* 次要操作按鈕 */}
        <div className="flex justify-center gap-3 mt-auto">
          <Button
            size="sm"
            variant="ghost"
            className="text-xs px-2 py-1 h-auto"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <Pencil className="h-3 w-3 mr-1" />
            編輯
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs px-2 py-1 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            刪除
          </Button>
        </div>
      </div>

      {/* 選中狀態指示器 */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
      )}
    </Card>
  );
};

export default AccountCard;