import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '服務條款 - 蟑螂網',
  description: '蟑螂網服務條款與使用規範',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">服務條款</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-600 text-sm leading-relaxed">
          <p className="text-xs text-gray-400">最後更新日期：2025 年 1 月</p>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">1. 服務說明</h2>
            <p>
              本服務（以下稱「蟑螂網」或「本工具」）為輔助性質的短網址管理工具，旨在協助使用者進行聯盟行銷相關活動。本服務由 Classroo 提供技術支援。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">2. 服務可用性</h2>
            <p>
              本工具以「現況」提供服務。我們將盡力維護服務的穩定性與可用性，但不保證服務將永久持續運作、不中斷或無錯誤。服務內容、功能及可用性可能因技術維護、系統升級或其他因素而有所調整或變更，恕不另行通知。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">3. 收益免責聲明</h2>
            <p>
              本工具為行銷輔助工具，不保證使用者必然獲得任何特定收益或成果。聯盟行銷的實際收益取決於多種因素，包括但不限於：市場狀況、個人投入程度、內容品質、平台政策變動等。課程中提及的任何案例或數據僅供參考，不構成收益保證。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">4. 使用者責任</h2>
            <p>
              使用者應遵守各社群平台（包括但不限於 Threads、Instagram、Facebook）的服務條款及社群守則。因違反平台規定而導致的帳號限制、停權或其他後果，由使用者自行承擔。本服務不鼓勵亦不支持任何違反平台政策的行為。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">5. 智慧財產權</h2>
            <p>
              本服務及相關課程內容之智慧財產權歸 Classroo 及其授權方所有。使用者不得擅自複製、散布、修改或以任何方式侵害相關權利。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">6. 責任限制</h2>
            <p>
              在法律允許的最大範圍內，本服務提供者不對任何直接、間接、附帶、特殊或衍生性損害負責，包括但不限於利潤損失、數據遺失或業務中斷。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">7. 條款修改</h2>
            <p>
              本服務保留隨時修改本條款之權利。條款修改後，繼續使用本服務即表示您同意接受修改後的條款。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">8. 準據法</h2>
            <p>
              本條款之解釋與適用，以中華民國法律為準據法。
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
