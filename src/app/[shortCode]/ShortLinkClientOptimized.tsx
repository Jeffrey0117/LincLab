'use client';

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ExitIntentPopup from "@/components/strategies/ExitIntentPopup";
import BottomFixedBar from "@/components/strategies/BottomFixedBar";
import FloatingButton from "@/components/strategies/FloatingButton";
import CaptchaVerification from "@/components/strategies/CaptchaVerification";
import ContentUnlock from "@/components/strategies/ContentUnlock";
import ImageLink from "@/components/strategies/ImageLink";
import Adult18Plus from "@/components/strategies/Adult18Plus";
import CloudDrive from "@/components/strategies/CloudDrive";
import PreviewCard from "@/components/PreviewCard";
import TemplateRenderer from "./TemplateRenderer";
import { createClient } from "@supabase/supabase-js";

// 使用通用 Supabase client（避免 TypeScript 類型限制）
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import {
  CookieStrategyConfig,
  getStrategyConfig,
  DEFAULT_CONFIGS,
  TemplateType,
  TemplateConfig
} from "@/lib/strategy-types";
import type { LinkData, ClickInfo } from "@/lib/link-service";

interface ShortLinkClientOptimizedProps {
  shortCode: string;
  isPreview: boolean;
  initialLinkData: LinkData;
  initialClickInfo: ClickInfo | null;
}

/**
 * 取得或建立 Session ID（用於 Client-side click tracking）
 * 因為 Client-side 無法取得真實 IP，改用 localStorage session
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';

  const key = 'link_session_id';
  let sessionId = localStorage.getItem(key);

  if (!sessionId) {
    // 生成唯一 session ID
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(key, sessionId);
  }

  return sessionId;
}

/**
 * 優化後的 Client Component
 *
 * 成本優化重點：
 * 1. Click tracking 在 Client-side 執行（不觸發 Vercel Function）
 * 2. 直接呼叫 Supabase（從用戶瀏覽器，不經過 Vercel）
 * 3. 這樣整個短網址流程：
 *    - Server: 1 次 Edge Function (OG + 傳資料)
 *    - Client: 直接呼叫 Supabase (不計 Vercel 費用)
 */
export default function ShortLinkClientOptimized({
  shortCode,
  isPreview,
  initialLinkData,
  initialClickInfo,
}: ShortLinkClientOptimizedProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [hasConverted, setHasConverted] = useState(initialClickInfo?.is_converted || false);
  const hasTrackedClick = useRef(false);

  const linkData = initialLinkData;

  // Client-side click tracking（不經過 Vercel Function）
  useEffect(() => {
    if (isPreview || hasTrackedClick.current || !linkData.id) return;
    hasTrackedClick.current = true;

    const trackClick = async () => {
      try {
        // 直接從 Client 呼叫 Supabase（不經過 Vercel）
        // 這樣不會觸發 Function Invocation

        // 1. 檢查是否已點擊過
        const sessionId = getOrCreateSessionId();
        const { data: existingClick } = await supabaseClient
          .from('link_clicks')
          .select('converted')
          .eq('link_id', linkData.id)
          .eq('ip_address', sessionId)
          .single();

        if (existingClick) {
          // 已經點擊過，只更新 hasConverted 狀態
          setHasConverted(existingClick.converted || false);
          return;
        }

        // 2. 記錄新點擊（Client-side 無法取得真實 IP，用 session ID）
        await supabaseClient.from('link_clicks').insert({
          link_id: linkData.id,
          ip_address: sessionId, // 用 session ID 代替 IP
          converted: false
        });

        // 3. 增加點擊計數
        await supabaseClient.rpc('increment_click_count', {
          p_short_code: shortCode
        });

      } catch (err) {
        // 靜默失敗，不影響用戶體驗
        console.error('Click tracking failed:', err);
      }
    };

    trackClick();
  }, [shortCode, isPreview, linkData.id]);

  // Cookie 彈窗觸發邏輯
  useEffect(() => {
    if (!linkData || linkData.strategy !== 'cookie_popup' || hasTriggered || hasConverted || isPreview) return;

    const config = getStrategyConfig<CookieStrategyConfig>('cookie_popup', linkData.strategy_config as CookieStrategyConfig);
    const triggerType = config.triggerType || 'immediate';

    if (triggerType === 'immediate') {
      // 使用 setTimeout 避免同步 setState 導致的級聯渲染
      const timer = setTimeout(() => {
        setShowDialog(true);
        setHasTriggered(true);
      }, 0);
      return () => clearTimeout(timer);
    }

    if (triggerType === 'delay') {
      const delayMs = (config.delaySeconds || 3) * 1000;
      const timer = setTimeout(() => {
        setShowDialog(true);
        setHasTriggered(true);
      }, delayMs);
      return () => clearTimeout(timer);
    }

    if (triggerType === 'scroll') {
      const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = scrollHeight > 0
          ? (window.scrollY / scrollHeight) * 100
          : 0;

        if (scrollPercentage >= (config.scrollPercentage || 50)) {
          setShowDialog(true);
          setHasTriggered(true);
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    if (triggerType === 'scroll-bottom') {
      const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const clientHeight = window.innerHeight;

        if (scrollTop + clientHeight >= scrollHeight - 50) {
          setShowDialog(true);
          setHasTriggered(true);
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    if (triggerType === 'exit-intent') {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setShowDialog(true);
          setHasTriggered(true);
          document.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [linkData, hasTriggered, hasConverted, isPreview]);

  /**
   * 標記為已轉換（直接呼叫 Supabase，不經過 Vercel）
   */
  const markConversion = async () => {
    if (isPreview || hasConverted) return;

    try {
      const sessionId = getOrCreateSessionId();

      // 直接呼叫 Supabase（不經過 Vercel Function）
      await supabaseClient
        .from('link_clicks')
        .upsert(
          {
            link_id: linkData.id,
            ip_address: sessionId,
            converted: true
          },
          {
            onConflict: 'link_id,ip_address',
            ignoreDuplicates: false
          }
        );

      setHasConverted(true);
    } catch (err) {
      console.error('Failed to mark conversion:', err);
    }
  };

  const handleAccept = async () => {
    if (linkData) {
      if (!isPreview && linkData.affiliate_url) {
        window.open(linkData.affiliate_url, "_blank");
        await markConversion();
      }
      setShowDialog(false);
    }
  };

  const handleLater = async () => {
    if (linkData) {
      if (!isPreview && linkData.affiliate_url) {
        window.open(linkData.affiliate_url, "_blank");
        await markConversion();
      }
      setShowDialog(false);
    }
  };

  const renderStrategy = () => {
    if (hasConverted || isPreview) {
      return null;
    }

    const strategy = linkData.strategy || 'cookie_popup';

    switch (strategy) {
      case 'none':
        return null;

      case 'cookie_popup':
        const cookieConfig = getStrategyConfig<CookieStrategyConfig>('cookie_popup', linkData.strategy_config as CookieStrategyConfig);
        return (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent
              className="w-[calc(100%-2rem)] max-w-[425px] sm:max-w-md [&>button]:hidden p-4 sm:p-6"
              onInteractOutside={async (e) => {
                e.preventDefault();
                if (linkData && !isPreview && linkData.affiliate_url) {
                  window.open(linkData.affiliate_url, "_blank");
                  await markConversion();
                }
                setShowDialog(false);
              }}
              onEscapeKeyDown={async (e) => {
                e.preventDefault();
                if (linkData && !isPreview && linkData.affiliate_url) {
                  window.open(linkData.affiliate_url, "_blank");
                  await markConversion();
                }
                setShowDialog(false);
              }}
            >
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-base sm:text-lg">
                  {cookieConfig.title || DEFAULT_CONFIGS.cookie_popup.title}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {cookieConfig.description || DEFAULT_CONFIGS.cookie_popup.description}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={handleLater}
                  className="w-full sm:w-auto"
                >
                  {cookieConfig.declineText || DEFAULT_CONFIGS.cookie_popup.declineText}
                </Button>
                <Button
                  onClick={handleAccept}
                  className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto"
                >
                  {cookieConfig.acceptText || DEFAULT_CONFIGS.cookie_popup.acceptText}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );

      case 'exit_intent':
        return <ExitIntentPopup affiliateUrl={linkData.affiliate_url} />;

      case 'bottom_bar':
        return <BottomFixedBar affiliateUrl={linkData.affiliate_url} />;

      case 'floating_button':
        return <FloatingButton affiliateUrl={linkData.affiliate_url} />;

      case 'captcha_verification':
        return (
          <CaptchaVerification
            affiliateUrl={linkData.affiliate_url}
            config={linkData.strategy_config as any}
            onVerified={markConversion}
          />
        );

      case 'content_unlock':
        return (
          <ContentUnlock
            affiliateUrl={linkData.affiliate_url}
            config={linkData.strategy_config as any}
            onUnlocked={markConversion}
          />
        );

      case 'image_link':
        return (
          <ImageLink
            affiliateUrl={linkData.affiliate_url}
            config={linkData.strategy_config as any}
          />
        );

      case 'adult_18plus':
        return (
          <Adult18Plus
            affiliateUrl={linkData.affiliate_url}
            config={linkData.strategy_config as any}
            onVerified={markConversion}
          />
        );

      case 'cloud_drive':
        return (
          <CloudDrive
            affiliateUrl={linkData.affiliate_url}
            config={linkData.strategy_config as any}
          />
        );

      default:
        return null;
    }
  };

  // 模板模式
  if (linkData.content_mode === 'template' && linkData.template_type && linkData.template_config) {
    return (
      <>
        {isPreview && (
          <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black px-4 py-2 text-center font-semibold z-50">
            🔍 預覽模式 - 不會跳轉或計數點擊
          </div>
        )}
        <TemplateRenderer
          templateType={linkData.template_type as TemplateType}
          templateConfig={linkData.template_config as TemplateConfig}
          affiliateUrl={linkData.affiliate_url}
          ogTitle={linkData.og_title}
          ogDescription={linkData.og_description}
          ogImage={linkData.og_image}
          proxyContent={linkData.proxy_content}
        />
        {renderStrategy()}
      </>
    );
  }

  // 外部連結模式
  if (linkData.link_mode === 'proxy_preview' && linkData.target_url) {
    return (
      <>
        {isPreview && (
          <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black px-4 py-2 text-center font-semibold z-50">
            🔍 預覽模式 - 不會跳轉或計數點擊
          </div>
        )}
        <PreviewCard
          targetUrl={linkData.target_url}
          ogTitle={linkData.og_title}
          ogDescription={linkData.og_description}
          ogImage={linkData.og_image}
          proxyContent={linkData.proxy_content}
          affiliateUrl={linkData.affiliate_url}
        />
        {renderStrategy()}
      </>
    );
  }

  // 預設：HTML 內容模式
  return (
    <>
      {isPreview && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black px-4 py-2 text-center font-semibold z-50">
          🔍 預覽模式 - 不會跳轉或計數點擊
        </div>
      )}
      <div className="min-h-screen bg-background pb-20" style={isPreview ? { paddingTop: '3rem' } : {}}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <article
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: linkData.html_content || '' }}
          />
        </div>
      </div>
      {renderStrategy()}
    </>
  );
}
