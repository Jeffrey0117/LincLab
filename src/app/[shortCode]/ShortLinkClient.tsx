'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import PreviewCard from "@/components/PreviewCard";
import { checkIfConverted, markAsConverted } from "@/app/actions/checkConversion";
import TemplateRenderer from "./TemplateRenderer";

import { StrategyConfig, CookieStrategyConfig, getStrategyConfig, DEFAULT_CONFIGS, TemplateType, TemplateConfig } from "@/lib/strategy-types";

interface LinkData {
  html_content: string;
  affiliate_url: string;
  strategy?: string;
  strategy_config?: StrategyConfig;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  favicon_url?: string;
  link_mode?: 'redirect' | 'proxy_preview' | 'proxy_ai';
  target_url?: string;
  proxy_content?: string;
  content_mode?: 'custom' | 'template';
  template_type?: TemplateType;
  template_config?: TemplateConfig;
}

export default function ShortLinkClient({
  shortCode,
  isPreview = false
}: {
  shortCode: string;
  isPreview?: boolean;
}) {
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [hasConverted, setHasConverted] = useState(false); // 是否已經轉換過

  useEffect(() => {
    const fetchLink = async () => {
      if (!shortCode) return;

      try {
        const { data, error } = await supabase
          .from("links")
          .select("*")
          .eq("short_code", shortCode)
          .eq("is_active", true)
          .single();

        if (error) throw error;

        const linkData = data as LinkData;
        setLinkData(linkData);

        // 檢查該 IP 是否已經轉換過（只在非預覽模式下檢查）
        if (!isPreview) {
          const converted = await checkIfConverted(shortCode);
          setHasConverted(converted);
        }
      } catch (error) {
        console.error("Error fetching link:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [shortCode, isPreview]);

  // Cookie 彈窗觸發邏輯（如果已轉換過或預覽模式，不觸發）
  useEffect(() => {
    if (!linkData || linkData.strategy !== 'cookie_popup' || hasTriggered || hasConverted || isPreview) return;

    const config = getStrategyConfig<CookieStrategyConfig>('cookie_popup', linkData.strategy_config as CookieStrategyConfig);
    const triggerType = config.triggerType || 'immediate';

    // 立即顯示
    if (triggerType === 'immediate') {
      setShowDialog(true);
      setHasTriggered(true);
      return;
    }

    // 延遲顯示
    if (triggerType === 'delay') {
      const delayMs = (config.delaySeconds || 3) * 1000;
      const timer = setTimeout(() => {
        setShowDialog(true);
        setHasTriggered(true);
      }, delayMs);
      return () => clearTimeout(timer);
    }

    // 滾動百分比
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

    // 滾動到底部
    if (triggerType === 'scroll-bottom') {
      const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const clientHeight = window.innerHeight;

        // 檢查是否到達底部（誤差範圍 50px）
        if (scrollTop + clientHeight >= scrollHeight - 50) {
          setShowDialog(true);
          setHasTriggered(true);
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    // 離開意圖
    if (triggerType === 'exit-intent') {
      const handleMouseLeave = (e: MouseEvent) => {
        // 只有當滑鼠從視窗頂部離開時觸發
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

  const handleAccept = async () => {
    if (linkData) {
      if (!isPreview) {
        window.open(linkData.affiliate_url, "_blank");
        // 標記該 IP 已經轉換
        await markAsConverted(shortCode);
        setHasConverted(true);
      }
      setShowDialog(false);
    }
  };

  const handleLater = async () => {
    if (linkData) {
      if (!isPreview) {
        window.open(linkData.affiliate_url, "_blank");
        // 標記該 IP 已經轉換
        await markAsConverted(shortCode);
        setHasConverted(true);
      }
      setShowDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground">連結不存在或已失效</p>
        </div>
      </div>
    );
  }

  const renderStrategy = () => {
    // 如果已經轉換過或是預覽模式，不顯示任何策略
    if (hasConverted || isPreview) {
      return null;
    }

    const strategy = linkData.strategy || 'cookie_popup';

    switch (strategy) {
      case 'none':
        // 無策略，不顯示任何轉換元件
        return null;

      case 'cookie_popup':
        const cookieConfig = getStrategyConfig<CookieStrategyConfig>('cookie_popup', linkData.strategy_config as CookieStrategyConfig);
        return (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent
              className="w-[calc(100%-2rem)] max-w-[425px] sm:max-w-md [&>button]:hidden p-4 sm:p-6"
              onInteractOutside={async (e) => {
                e.preventDefault();
                // 點擊視窗外面也跳分潤連結（預覽模式除外）
                if (linkData && !isPreview) {
                  window.open(linkData.affiliate_url, "_blank");
                  await markAsConverted(shortCode);
                  setHasConverted(true);
                  setShowDialog(false);
                }
              }}
              onEscapeKeyDown={async (e) => {
                e.preventDefault();
                // 按 ESC 也跳分潤連結（預覽模式除外）
                if (linkData && !isPreview) {
                  window.open(linkData.affiliate_url, "_blank");
                  await markAsConverted(shortCode);
                  setHasConverted(true);
                  setShowDialog(false);
                }
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
            onVerified={async () => {
              if (!isPreview) {
                await markAsConverted(shortCode);
                setHasConverted(true);
              }
            }}
          />
        );

      case 'content_unlock':
        return (
          <ContentUnlock
            affiliateUrl={linkData.affiliate_url}
            config={linkData.strategy_config as any}
            onUnlocked={async () => {
              if (!isPreview) {
                await markAsConverted(shortCode);
                setHasConverted(true);
              }
            }}
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
            onVerified={() => markAsConverted(linkData.affiliate_url)}
          />
        );

      default:
        return null;
    }
  };

  // 如果是模板模式
  if (linkData.content_mode === 'template' && linkData.template_type && linkData.template_config) {
    return (
      <>
        {isPreview && (
          <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black px-4 py-2 text-center font-semibold z-50">
            🔍 預覽模式 - 不會跳轉或計數點擊
          </div>
        )}
        <TemplateRenderer
          templateType={linkData.template_type}
          templateConfig={linkData.template_config}
          affiliateUrl={linkData.affiliate_url}
          ogTitle={linkData.og_title}
          ogDescription={linkData.og_description}
          ogImage={linkData.og_image}
          proxyContent={linkData.proxy_content}
        />
        {/* 模板模式也可以套用策略 */}
        {renderStrategy()}
      </>
    );
  }

  // 如果是外部連結模式（舊版相容），顯示預覽卡片 + 策略
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
        {/* 外部連結模式也可以套用策略 */}
        {renderStrategy()}
      </>
    );
  }

  // 預設：重定向模式，顯示 HTML 內容 + 策略
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
            dangerouslySetInnerHTML={{ __html: linkData.html_content }}
          />
        </div>
      </div>

      {/* 根據選擇的策略顯示對應招數（預覽模式下仍然顯示，但不會實際跳轉） */}
      {renderStrategy()}
    </>
  );
}
