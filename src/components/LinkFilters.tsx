import { useState, useEffect } from "react";
import { Search, Filter, X, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Account, ACCOUNT_TYPE_ICONS } from "@/lib/account-types";

interface LinkFiltersProps {
  accounts: Account[];
  selectedAccountId: string | null;
  searchKeyword: string;
  selectedTags: string[];
  availableTags: string[];
  linkCounts: Record<string, number>;
  totalLinks: number;
  onAccountChange: (accountId: string | null) => void;
  onSearchChange: (keyword: string) => void;
  onTagsChange: (tags: string[]) => void;
}

const LinkFilters = ({
  accounts,
  selectedAccountId,
  searchKeyword,
  selectedTags,
  availableTags,
  linkCounts,
  totalLinks,
  onAccountChange,
  onSearchChange,
  onTagsChange,
}: LinkFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(searchKeyword);
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounce 搜尋輸入
  useEffect(() => {
    setLocalSearch(searchKeyword);
  }, [searchKeyword]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);

    // 清除之前的計時器
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    // 設置新的計時器 (300ms debounce)
    const timer = setTimeout(() => {
      onSearchChange(value);
    }, 300);

    setSearchTimer(timer);
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearAllFilters = () => {
    onAccountChange(null);
    onSearchChange("");
    onTagsChange([]);
    setLocalSearch("");
  };

  const hasActiveFilters = selectedAccountId || searchKeyword || selectedTags.length > 0;

  return (
    <div className="bg-background border rounded-lg p-4 mb-6 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 帳號篩選 */}
        <div className="flex-1 max-w-xs">
          <Select
            value={selectedAccountId || "all"}
            onValueChange={(value) => onAccountChange(value === "all" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="選擇帳號" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>全部連結</span>
                  <span className="ml-auto text-muted-foreground">
                    ({totalLinks})
                  </span>
                </div>
              </SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-lg">{ACCOUNT_TYPE_ICONS[account.type]}</span>
                    <span>{account.name}</span>
                    <span className="ml-auto text-muted-foreground">
                      ({linkCounts[account.id] || 0})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 搜尋框 */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋連結標題..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-9"
            />
            {localSearch && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => handleSearchChange("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 標籤篩選 */}
        {availableTags.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Hash className="h-4 w-4" />
                標籤篩選
                {selectedTags.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {selectedTags.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <div className="font-medium">選擇標籤</div>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full"
                    onClick={() => onTagsChange([])}
                  >
                    清除標籤篩選
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* 清除所有篩選 */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            清除篩選
          </Button>
        )}
      </div>

      {/* 活動篩選標籤 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">篩選條件：</span>

          {selectedAccountId && (
            <Badge variant="secondary" className="gap-1">
              {ACCOUNT_TYPE_ICONS[accounts.find(a => a.id === selectedAccountId)?.type || 'benefit']}
              {accounts.find(a => a.id === selectedAccountId)?.name}
              <Button
                size="icon"
                variant="ghost"
                className="h-3 w-3 ml-1 hover:bg-transparent"
                onClick={() => onAccountChange(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {searchKeyword && (
            <Badge variant="secondary" className="gap-1">
              搜尋: {searchKeyword}
              <Button
                size="icon"
                variant="ghost"
                className="h-3 w-3 ml-1 hover:bg-transparent"
                onClick={() => {
                  onSearchChange("");
                  setLocalSearch("");
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {selectedTags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              #{tag}
              <Button
                size="icon"
                variant="ghost"
                className="h-3 w-3 ml-1 hover:bg-transparent"
                onClick={() => handleTagToggle(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkFilters;