import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountCard from "@/components/AccountCard";
import { Account } from "@/lib/account-types";
import { cn } from "@/lib/utils";

interface AccountsSectionProps {
  accounts: Account[];
  selectedAccountId: string | null;
  linkCounts: Record<string, number>;
  onAccountSelect: (accountId: string | null) => void;
  onAddAccount: () => void;
  onAddLink: (accountId: string) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
}

const AccountsSection = ({
  accounts,
  selectedAccountId,
  linkCounts,
  onAccountSelect,
  onAddAccount,
  onAddLink,
  onEditAccount,
  onDeleteAccount,
}: AccountsSectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 滾動到選中的帳號
  useEffect(() => {
    if (selectedAccountId && scrollContainerRef.current) {
      const selectedIndex = accounts.findIndex(a => a.id === selectedAccountId);
      if (selectedIndex !== -1) {
        const scrollPosition = (selectedIndex + 1) * 196; // 180px width + 16px gap
        scrollContainerRef.current.scrollTo({
          left: scrollPosition - 200,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedAccountId, accounts]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-muted/30 rounded-lg p-6 mb-6">
      {/* 標題 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">帳號管理</h2>
          <p className="text-sm text-muted-foreground">
            選擇帳號來篩選連結，或點擊新增連結快速創建
          </p>
        </div>
        {accounts.length > 4 && (
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={scrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={scrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 帳號卡片容器 */}
      <div className="relative">
        {/* 左側漸變遮罩 */}
        {accounts.length > 4 && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
        )}

        {/* 右側漸變遮罩 */}
        {accounts.length > 4 && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />
        )}

        {/* 可滾動容器 */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex gap-4 overflow-x-auto scrollbar-hide pb-2",
            "scroll-smooth snap-x snap-mandatory"
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          } as React.CSSProperties}
        >
          {/* 新增帳號卡片 */}
          <div className="snap-start">
            <AccountCard
              isAddCard
              onAddAccount={onAddAccount}
            />
          </div>

          {/* 帳號卡片列表 */}
          {accounts.map((account) => (
            <div key={account.id} className="snap-start">
              <AccountCard
                account={account}
                linkCount={linkCounts[account.id] || 0}
                isSelected={selectedAccountId === account.id}
                onSelect={() => {
                  if (selectedAccountId === account.id) {
                    onAccountSelect(null); // 取消選擇
                  } else {
                    onAccountSelect(account.id); // 選擇帳號
                  }
                }}
                onAddLink={() => onAddLink(account.id)}
                onEdit={() => onEditAccount(account)}
                onDelete={() => onDeleteAccount(account.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 提示文字 */}
      {accounts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            還沒有帳號，點擊「新增帳號」開始創建
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountsSection;