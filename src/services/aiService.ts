// AdCreative.ai API Service Stubs
// Local-first architecture with external API fallback

import type { Product } from "@/types";

export interface AdCreativeConfig {
  apiKey?: string;
  baseUrl: string;
}

export interface AdCreativeRequest {
  productName: string;
  category: string;
  description?: string;
  targetAudience?: string;
  adType: "image" | "video" | "text";
  customInstructions?: string;
}

export interface AdCreativeResponse {
  id: string;
  headline: string;
  bodyText: string;
  cta: string;
  imageUrl?: string;
  videoUrl?: string;
  confidence: number;
  generatedAt: string;
}

const DEFAULT_CONFIG: AdCreativeConfig = {
  baseUrl: "https://api.adcreative.ai/v1",
};

/**
 * AdCreative.ai API client stub
 * Currently uses mock data; replace with real API calls when credentials available
 */
export const aiService = {
  config: { ...DEFAULT_CONFIG },

  /**
   * Configure API credentials
   */
  configure(config: Partial<AdCreativeConfig>): void {
    this.config = { ...this.config, ...config };
  },

  /**
   * Generate ad creative via AdCreative.ai API
   * Stub implementation - returns mock data
   */
  async generateCreative(request: AdCreativeRequest): Promise<AdCreativeResponse> {
    // TODO: Replace with actual AdCreative.ai API call when API key is configured
    // const response = await fetch(`${this.config.baseUrl}/generate`, {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Bearer ${this.config.apiKey}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(request),
    // });
    // if (!response.ok) throw new Error(`API error: ${response.status}`);
    // return response.json();

    // Mock implementation for local-first development
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      id: `ad_${Date.now()}`,
      headline: `Discover ${request.productName}`,
      bodyText: `Transform your ${request.category.toLowerCase()} routine with ${request.productName}. ${request.description || ""}`,
      cta: "Shop Now",
      confidence: 0.85,
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Analyze product for optimal ad type recommendation
   * Stub implementation - returns mock analysis based on category
   */
  async analyzeProduct(product: Product): Promise<{ adType: "image" | "video" | "text"; confidence: number; reasoning: string }> {
    // TODO: Replace with AdCreative.ai market analysis endpoint
    await new Promise((resolve) => setTimeout(resolve, 300));

    const category = product.category.toLowerCase();

    if (category.includes("tech") || category.includes("electronic") || category.includes("wearable")) {
      return { adType: "video", confidence: 0.87, reasoning: "Tech products perform best with video demonstrations" };
    }
    if (category.includes("beauty") || category.includes("fashion") || category.includes("skincare")) {
      return { adType: "image", confidence: 0.92, reasoning: "Visual products convert best with high-quality imagery" };
    }
    if (category.includes("health") || category.includes("fitness")) {
      return { adType: "video", confidence: 0.85, reasoning: "Fitness products benefit from action-oriented video content" };
    }
    return { adType: "text", confidence: 0.75, reasoning: "Text-based ads provide best ROI for this category" };
  },

  /**
   * Validate content for ethical guidelines
   * Ensures no misleading claims
   */
  validateContent(content: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    const misleadingPatterns = [
      { pattern: /guaranteed results/i, message: "Avoid guaranteeing specific results" },
      { pattern: /100% effective/i, message: "Avoid absolute effectiveness claims" },
      { pattern: /miracle cure/i, message: "Avoid miracle cure terminology" },
      { pattern: /lose \d+ pounds in \d+ days/i, message: "Avoid specific weight loss timeline claims" },
      { pattern: /get rich quick/i, message: "Avoid get-rich-quick language" },
      { pattern: /no side effects/i, message: "Avoid blanket safety claims" },
      { pattern: /doctor recommended/i, message: "Verify medical endorsement claims" },
    ];

    for (const { pattern, message } of misleadingPatterns) {
      if (pattern.test(content)) {
        issues.push(message);
      }
    }

    return { valid: issues.length === 0, issues };
  },

  /**
   * Check if API is configured and ready
   */
  isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  },
};
