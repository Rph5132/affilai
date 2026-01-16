import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { productApi } from "@/services/api";
import type { Product, CreateProductInput } from "@/types";
import { ExternalLink } from "lucide-react";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
}

export function ProductForm({ open, onOpenChange, product, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateProductInput>({
    name: product?.name || "",
    category: product?.category || "",
    description: product?.description || "",
    price_range: product?.price_range || "",
    target_audience: product?.target_audience || "",
    trending_score: product?.trending_score || 50,
    notes: product?.notes || "",
    image_url: product?.image_url || "",

    // Affiliate platform identifiers
    amazon_asin: product?.amazon_asin || "",
    tiktok_product_id: product?.tiktok_product_id || "",
    instagram_product_id: product?.instagram_product_id || "",
    youtube_video_id: product?.youtube_video_id || "",
    pinterest_pin_id: product?.pinterest_pin_id || "",
    product_url: product?.product_url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (product?.id) {
        await productApi.update(product.id, formData);
      } else {
        await productApi.create(formData);
      }
      onSuccess();
      onOpenChange(false);
      // Reset form
      setFormData({
        name: "",
        category: "",
        description: "",
        price_range: "",
        target_audience: "",
        trending_score: 50,
        notes: "",
        image_url: "",
        amazon_asin: "",
        tiktok_product_id: "",
        instagram_product_id: "",
        youtube_video_id: "",
        pinterest_pin_id: "",
        product_url: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof CreateProductInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product
              ? "Update product details and affiliate identifiers"
              : "Add a new product to your affiliate catalog"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Product Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g., LANEIGE Water Sleeping Mask"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="e.g., Beauty & Skincare"
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_range">Price Range</Label>
                <Input
                  id="price_range"
                  placeholder="e.g., $20-$30"
                  value={formData.price_range}
                  onChange={(e) => updateField("price_range", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="trending_score">Trending Score (0-100)</Label>
                <Input
                  id="trending_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.trending_score}
                  onChange={(e) => updateField("trending_score", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input
                id="target_audience"
                placeholder="e.g., Age 20-35, female, skincare enthusiasts"
                value={formData.target_audience}
                onChange={(e) => updateField("target_audience", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Demographics help optimize platform selection (age, gender, interests)
              </p>
            </div>

            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                placeholder="https://example.com/product-image.jpg"
                value={formData.image_url}
                onChange={(e) => updateField("image_url", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Internal notes about this product..."
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Affiliate Platform Details - Collapsible */}
          <Accordion type="single" collapsible className="border rounded-lg px-4">
            <AccordionItem value="affiliate-ids" className="border-0">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Affiliate Platform Details</span>
                  <span className="text-xs text-muted-foreground">(Optional - for generating working links)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <div className="p-3 bg-muted rounded-md text-sm">
                    <p className="text-muted-foreground">
                      Add platform-specific product identifiers to generate real affiliate links.
                      These IDs will be combined with your affiliate credentials from Settings.
                    </p>
                  </div>

                  {/* Amazon ASIN */}
                  <div>
                    <Label htmlFor="amazon_asin" className="flex items-center gap-2">
                      Amazon ASIN
                      <a
                        href="https://www.amazon.com/gp/help/customer/display.html?nodeId=G200141420"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Label>
                    <Input
                      id="amazon_asin"
                      placeholder="B08N5WRWNW"
                      value={formData.amazon_asin}
                      onChange={(e) => updateField("amazon_asin", e.target.value)}
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      10-character product identifier found in Amazon product URL (e.g., amazon.com/dp/<strong>B08N5WRWNW</strong>)
                    </p>
                  </div>

                  {/* Product URL - Universal fallback */}
                  <div>
                    <Label htmlFor="product_url">Product URL (All Platforms)</Label>
                    <Input
                      id="product_url"
                      placeholder="https://example.com/product-page"
                      value={formData.product_url}
                      onChange={(e) => updateField("product_url", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Generic product page URL - used as fallback for platforms without specific IDs
                    </p>
                  </div>

                  {/* TikTok Product ID */}
                  <div>
                    <Label htmlFor="tiktok_product_id">TikTok Product ID</Label>
                    <Input
                      id="tiktok_product_id"
                      placeholder="1234567890"
                      value={formData.tiktok_product_id}
                      onChange={(e) => updateField("tiktok_product_id", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Product ID from your TikTok Shop catalog
                    </p>
                  </div>

                  {/* Instagram Product ID */}
                  <div>
                    <Label htmlFor="instagram_product_id">Instagram Product ID</Label>
                    <Input
                      id="instagram_product_id"
                      placeholder="1234567890"
                      value={formData.instagram_product_id}
                      onChange={(e) => updateField("instagram_product_id", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Product ID from Instagram Shopping catalog (via Meta Commerce Manager)
                    </p>
                  </div>

                  {/* YouTube Video ID */}
                  <div>
                    <Label htmlFor="youtube_video_id">YouTube Video ID</Label>
                    <Input
                      id="youtube_video_id"
                      placeholder="dQw4w9WgXcQ"
                      value={formData.youtube_video_id}
                      onChange={(e) => updateField("youtube_video_id", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      YouTube video showcasing this product (11-character ID from video URL)
                    </p>
                  </div>

                  {/* Pinterest Pin ID */}
                  <div>
                    <Label htmlFor="pinterest_pin_id">Pinterest Pin ID</Label>
                    <Input
                      id="pinterest_pin_id"
                      placeholder="1234567890"
                      value={formData.pinterest_pin_id}
                      onChange={(e) => updateField("pinterest_pin_id", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Pin ID for this product on Pinterest
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
