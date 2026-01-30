/**
 * Centralized Site Configuration
 *
 * All brand names, URLs, and feature flags are read from environment variables
 * with sensible defaults for self-hosted deployments.
 */

export type DeploymentMode = 'self-hosted' | 'saas'

export interface SiteConfig {
  /** Site display name */
  name: string
  /** Site description */
  description: string
  /** Base URL (e.g. https://example.com) */
  url: string
  /** Deployment mode */
  deploymentMode: DeploymentMode
  /** Feature flags */
  features: {
    googleSheets: boolean
    pttScraper: boolean
    ettodayScraper: boolean
    youtubeSummary: boolean
  }
}

function getDeploymentMode(): DeploymentMode {
  const mode = process.env.DEPLOYMENT_MODE
  if (mode === 'saas') return 'saas'
  return 'self-hosted'
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'http://localhost:3000'
}

export const siteConfig: SiteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'LincLab',
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '聯盟行銷短連結管理平台',
  url: getBaseUrl(),
  deploymentMode: getDeploymentMode(),
  features: {
    googleSheets: !!process.env.GOOGLE_API_KEY,
    pttScraper: true,
    ettodayScraper: true,
    youtubeSummary: !!process.env.DEEPSEEK_API_KEY,
  },
}

/** Check if running in self-hosted mode */
export function isSelfHosted(): boolean {
  return getDeploymentMode() === 'self-hosted'
}
