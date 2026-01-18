import { useState, useEffect } from "react";
import type { Product } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Save,
  TrendingUp,
  Target,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import { adApi, type AdType as ApiAdType, type AdGenerationResult } from "@/services/adApi";

// Ad type options - matches Rust backend
const AD_TYPES = [
  { value: "social_post", label: "Social Media Post" },
  { value: "story", label: "Story" },
  { value: "video_script", label: "Video Script" },
  { value: "carousel", label: "Carousel" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
] as const;

type AdType = ApiAdType;

// Market analysis result type
interface MarketAnalysis {
  recommendedAdType: string;
  confidence: number;
  reasoning: string;
}

// Generated ad content type
interface GeneratedAd {
  headline: string;
  body: string;
  cta: string;
  adType: string;
}

interface AdGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess?: (ad: GeneratedAd) => void;
}

export function AdGenerationModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: AdGenerationModalProps) {
  const [selectedAdType, setSelectedAdType] = useState<AdType>("social_post");
  const [customInstructions, setCustomInstructions] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
  const [apiResult, setApiResult] = useState<AdGenerationResult | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Reset state when modal opens with a new product
  useEffect(() => {
    if (open && product) {
      setGeneratedAd(null);
      setCustomInstructions("");
      setMarketAnalysis(null);
      setApiResult(null);
      analyzeMarket();
    }
  }, [open, product?.id]);

  // Get market analysis by generating a preview ad
  const analyzeMarket = async () => {
    if (!product || !product.id) return;

    setIsAnalyzing(true);
    try {
      // Use the API to get market analysis (it returns analysis with generation)
      const result = await adApi.generateForProduct(product.id);
      setApiResult(result);

      // Transform backend analysis to our format
      const analysis: MarketAnalysis = {
        recommendedAdType: result.market_analysis.recommended_ad_type,
        confidence: Math.round(result.market_analysis.estimated_engagement_score * 100),
        reasoning: `${result.market_analysis.suggested_tone} tone recommended for ${result.market_analysis.target_demographic}. Competition level: ${result.market_analysis.competition_level}. Key selling points: ${result.market_analysis.key_selling_points.slice(0, 2).join(", ")}.`,
      };
      setMarketAnalysis(analysis);
      setSelectedAdType(result.market_analysis.recommended_ad_type as AdType);

      // Set the generated ad from the API response
      setGeneratedAd({
        headline: result.ad_copy.headline,
        body: result.ad_copy.body_text || "",
        cta: result.ad_copy.cta || "Shop Now",
        adType: result.ad_copy.ad_type || result.market_analysis.recommended_ad_type,
      });
    } catch (error) {
      console.error("Error analyzing market:", error);
      // Fallback to local analysis if API fails
      const analysis = getLocalMarketAnalysis(product);
      setMarketAnalysis(analysis);
      setSelectedAdType(analysis.recommendedAdType as AdType);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Local fallback market analysis
  const getLocalMarketAnalysis = (product: Product): MarketAnalysis => {
    const category = product.category.toLowerCase();

    if (category.includes("tech") || category.includes("electronic")) {
      return {
        recommendedAdType: "video_script",
        confidence: 87,
        reasoning: "Tech products perform best with video demonstrations showing features and benefits.",
      };
    } else if (category.includes("beauty") || category.includes("skincare")) {
      return {
        recommendedAdType: "story",
        confidence: 92,
        reasoning: "Beauty products see highest conversion through stories and authentic testimonials.",
      };
    } else if (category.includes("fitness") || category.includes("health")) {
      return {
        recommendedAdType: "social_post",
        confidence: 85,
        reasoning: "Health and fitness products thrive on social platforms with community engagement.",
      };
    } else if (category.includes("home") || category.includes("kitchen")) {
      return {
        recommendedAdType: "carousel",
        confidence: 78,
        reasoning: "Home products convert well through carousels showcasing multiple angles and use cases.",
      };
    } else {
      return {
        recommendedAdType: "social_post",
        confidence: 75,
        reasoning: "Social media posts provide broad reach and best ROI for this category.",
      };
    }
  };

  // Generate ad content via API
  const handleGenerateAd = async () => {
    if (!product || !product.id) return;

    setIsGenerating(true);
    try {
      const result = await adApi.generateForProduct(
        product.id,
        selectedAdType,
        customInstructions || undefined
      );
      setApiResult(result);

      setGeneratedAd({
        headline: result.ad_copy.headline,
        body: result.ad_copy.body_text || "",
        cta: result.ad_copy.cta || "Shop Now",
        adType: result.ad_copy.ad_type || selectedAdType,
      });
    } catch (error) {
      console.error("Error generating ad:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle save
  const handleSave = () => {
    if (generatedAd && onSuccess) {
      onSuccess(generatedAd);
    }
    onOpenChange(false);
  };

  // Handle regenerate
  const handleRegenerate = () => {
    handleGenerateAd();
  };

  const getAdTypeLabel = (value: string): string => {
    return AD_TYPES.find((type) => type.value === value)?.label || value;
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Ad for {product.name}
          </DialogTitle>
          <DialogDescription>
            <Badge variant="secondary" className="mt-1">
              {product.category}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Market Analysis Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-primary" />
                Market Analysis
              </div>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing market trends...
                </div>
              ) : marketAnalysis ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Recommended Ad Type</span>
                    </div>
                    <Badge variant="success">
                      {getAdTypeLabel(marketAnalysis.recommendedAdType)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${marketAnalysis.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{marketAnalysis.confidence}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{marketAnalysis.reasoning}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Ad Type Selection */}
          <div className="space-y-2">
            <Label>Ad Type</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{getAdTypeLabel(selectedAdType)}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-white dark:bg-slate-900 p-1 shadow-lg">
                  {AD_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setSelectedAdType(type.value);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground ${
                        selectedAdType === type.value ? "bg-accent" : ""
                      }`}
                    >
                      {type.label}
                      {marketAnalysis?.recommendedAdType === type.value && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Recommended
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Add any specific requirements, tone preferences, or key messages to include..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Generate Button */}
          {!generatedAd && (
            <Button
              onClick={handleGenerateAd}
              disabled={isGenerating || isAnalyzing}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Ad...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Ad
                </>
              )}
            </Button>
          )}

          {/* Generated Ad Preview */}
          {generatedAd && (
            <Card className="border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Generated Ad Preview</span>
                  <Badge>{getAdTypeLabel(generatedAd.adType)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Headline</Label>
                  <p className="font-semibold mt-1">{generatedAd.headline}</p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Body</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{generatedAd.body}</p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Call to Action</Label>
                  <Badge variant="secondary" className="mt-1">
                    {generatedAd.cta}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Regenerate
                  </Button>
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Save Ad
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
