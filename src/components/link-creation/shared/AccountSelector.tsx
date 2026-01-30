import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Account, ACCOUNT_TYPE_ICONS } from "@/lib/account-types";

interface AccountSelectorProps {
  accountId: string;
  setAccountId: (value: string) => void;
  defaultAccountId?: string | null;
}

export default function AccountSelector({
  accountId,
  setAccountId,
  defaultAccountId,
}: AccountSelectorProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setAccounts(data);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="account">所屬帳號（選填）</Label>
      <Select
        value={accountId}
        onValueChange={setAccountId}
        disabled={!!defaultAccountId}
      >
        <SelectTrigger id="account">
          <SelectValue placeholder="選擇帳號（不選則不分類）" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">不選擇帳號</span>
            </div>
          </SelectItem>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{ACCOUNT_TYPE_ICONS[account.type]}</span>
                <span>{account.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {defaultAccountId
          ? "已自動選擇帳號"
          : "選擇帳號後可以批量管理同類型連結"}
      </p>
    </div>
  );
}
