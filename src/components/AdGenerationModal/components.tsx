import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  RefreshCw,
  Check,
  TrendingUp,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";
import type { MarketAnalysis, GeneratedAd } from "@/hooks/useAdGenerationModal";
import type { GeneratedAdCopy } from "@/services/adApi";

// Ad type options - matches Rust backend
export const AD_TYPES = [
  { value: "social_post", label: "Social Media Post" },
  { value: "story", label: "Story" },
  { value: "video_script", label: "Video Script" },
  { value: "carousel", label: "Carousel" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
] as const;

export type AdTypeValue = (typeof AD_TYPES)[number]["value"];

/**
 * Get human-readable label for ad type value
 */
export function getAdTypeLabel(value: string): string {
  return AD_TYPES.find((type) => type.value === value)?.label || value;
}

// --- MarketAnalysisCard ---
interface MarketAnalysisCardProps {
  isAnalyzing: boolean;
  analysis: MarketAnalysis | null;
}

export function MarketAnalysisCard({ isAnalyzing, analysis }: MarketAnalysisCardProps) {
  return (
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
        ) : analysis ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recommended Ad Type</span>
              </div>
              <Badge variant="success">
                {getAdTypeLabel(analysis.recommendedAdType)}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${analysis.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{analysis.confidence}%</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{analysis.reasoning}</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// --- AdTypeDropdown ---
interface AdTypeDropdownProps {
  selectedAdType: string;
  recommendedAdType?: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: AdTypeValue) => void;
}

export function AdTypeDropdown({
  selectedAdType,
  recommendedAdType,
  isOpen,
  onToggle,
  onSelect,
}: AdTypeDropdownProps) {
  return (
    <div className="space-y-2">
      <Label>Ad Type</Label>
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{getAdTypeLabel(selectedAdType)}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-white dark:bg-slate-900 p-1 shadow-lg">
            {AD_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => onSelect(type.value)}
                className={`w-full text-left rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground ${
                  selectedAdType === type.value ? "bg-accent" : ""
                }`}
              >
                {type.label}
                {recommendedAdType === type.value && (
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
  );
}

// --- GeneratedAdPreview ---
interface GeneratedAdPreviewProps {
  ad: GeneratedAd;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onSave: () => void;
}

export function GeneratedAdPreview({
  ad,
  isRegenerating,
  onRegenerate,
  onSave,
}: GeneratedAdPreviewProps) {
  return (
    <Card className="border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Generated Ad Preview</span>
          <Badge>{getAdTypeLabel(ad.adType)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Headline</Label>
          <p className="font-semibold mt-1">{ad.headline}</p>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Body</Label>
          <p className="text-sm mt-1 whitespace-pre-wrap">{ad.body}</p>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Call to Action</Label>
          <Badge variant="secondary" className="mt-1">
            {ad.cta}
          </Badge>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex-1"
          >
            {isRegenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Regenerate
          </Button>
          <Button onClick={onSave} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Done
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- SavedAdsSection ---
interface SavedAdsSectionProps {
  savedAds: GeneratedAdCopy[];
  isExpanded: boolean;
  onToggle: () => void;
}

export function SavedAdsSection({ savedAds, isExpanded, onToggle }: SavedAdsSectionProps) {
  if (savedAds.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <History className="h-4 w-4 text-muted-foreground" />
            Saved Ads ({savedAds.length})
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-3 pt-0">
          {savedAds.map((ad) => (
            <SavedAdItem key={ad.id} ad={ad} />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

// --- SavedAdItem (internal to SavedAdsSection) ---
interface SavedAdItemProps {
  ad: GeneratedAdCopy;
}

function SavedAdItem({ ad }: SavedAdItemProps) {
  const formattedDate = ad.created_at
    ? new Date(ad.created_at).toLocaleDateString()
    : "";

  return (
    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm truncate flex-1">
          {ad.headline}
        </span>
        <Badge variant="outline" className="ml-2 text-xs">
          {getAdTypeLabel(ad.ad_type || "social_post")}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {ad.body_text}
      </p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>CTA: {ad.cta}</span>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}
