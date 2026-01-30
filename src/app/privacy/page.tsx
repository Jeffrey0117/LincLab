import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隱私權政策 - 蟑螂網',
  description: '蟑螂網隱私權政策',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">隱私權政策</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-600 text-sm leading-relaxed">
          <p className="text-xs text-gray-400">最後更新日期：2025 年 1 月</p>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">1. 資料蒐集</h2>
            <p>
              本服務可能蒐集以下資料：電子郵件地址（用於帳號註冊與驗證）、使用紀錄（用於服務優化）、連結點擊數據（用於統計分析）。我們僅蒐集提供服務所必要之資料。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">2. 資料使用</h2>
            <p>
              蒐集之資料僅用於：提供及改善本服務、驗證會員資格、發送服務相關通知。我們不會將您的個人資料出售給第三方。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">3. 資料保護</h2>
            <p>
              我們採用業界標準的安全措施保護您的資料，包括加密傳輸及安全儲存。然而，網路傳輸無法保證百分之百安全，請妥善保管您的帳號資訊。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">4. Cookie 使用</h2>
            <p>
              本服務使用 Cookie 及類似技術以提供更好的使用體驗、記住您的偏好設定及進行流量分析。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">5. 第三方服務</h2>
            <p>
              本服務可能整合第三方服務（如 Google Sheets）。使用這些功能時，請同時參閱該第三方服務之隱私權政策。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">6. 您的權利</h2>
            <p>
              您有權要求存取、更正或刪除您的個人資料。如需行使相關權利，請透過 Classroo 平台聯繫我們。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">7. 政策更新</h2>
            <p>
              本政策可能不定期更新。重大變更時，我們將透過適當方式通知您。
            </p>
          </section>

          <div className="pt-6 border-t text-xs text-gray-400">
            <p>如有任何疑問，請透過 Classroo 平台聯繫我們。</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/sales" className="text-sm text-orange-600 hover:underline">
            ← 返回首頁
          </a>
        </div>
      </div>
    </main>
  );
}
