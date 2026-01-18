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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";

import { useAdGenerationModal, type GeneratedAd } from "@/hooks/useAdGenerationModal";
import {
  MarketAnalysisCard,
  AdTypeDropdown,
  GeneratedAdPreview,
  SavedAdsSection,
  type AdTypeValue,
} from "./components";

interface AdGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess?: (ad: GeneratedAd) => void;
}

/**
 * AdGenerationModal - Refactored for clarity
 *
 * Changes from original (468 lines → ~90 lines):
 * - Consolidated 11 useState calls into useAdGenerationModal hook with useReducer
 * - Extracted UI sections into focused sub-components
 * - Moved business logic (API calls, transformations) to custom hook
 * - Data-driven category analysis replaces nested if-else chains
 *
 * Behavior is identical to the original implementation.
 */
export function AdGenerationModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: AdGenerationModalProps) {
  const { state, actions } = useAdGenerationModal(product, open);

  const handleSave = () => {
    if (state.generatedAd && onSuccess) {
      onSuccess(state.generatedAd);
    }
    onOpenChange(false);
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
          {/* Market Analysis */}
          <MarketAnalysisCard
            isAnalyzing={state.isAnalyzing}
            analysis={state.marketAnalysis}
          />

          {/* Ad Type Selection */}
          <AdTypeDropdown
            selectedAdType={state.selectedAdType}
            recommendedAdType={state.marketAnalysis?.recommendedAdType}
            isOpen={state.dropdownOpen}
            onToggle={actions.toggleDropdown}
            onSelect={(value: AdTypeValue) => actions.setAdType(value)}
          />

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Add any specific requirements, tone preferences, or key messages to include..."
              value={state.customInstructions}
              onChange={(e) => actions.setCustomInstructions(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Generate Button */}
          {!state.generatedAd && (
            <Button
              onClick={actions.generateAd}
              disabled={state.isGenerating || state.isAnalyzing}
              className="w-full"
            >
              {state.isGenerating ? (
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
          {state.generatedAd && (
            <GeneratedAdPreview
              ad={state.generatedAd}
              isRegenerating={state.isGenerating}
              onRegenerate={actions.regenerateAd}
              onSave={handleSave}
            />
          )}

          {/* Saved Ads */}
          <SavedAdsSection
            savedAds={state.savedAds}
            isExpanded={state.showSavedAds}
            onToggle={actions.toggleSavedAds}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Re-export types for backwards compatibility
export type { GeneratedAd } from "@/hooks/useAdGenerationModal";
