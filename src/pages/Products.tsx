import { useEffect, useState } from "react";
import { productApi } from "@/services/api";
import type { Product } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Package, Edit, Trash2, TrendingUp, Sparkles } from "lucide-react";
import { ProductForm } from "@/components/ProductForm";
import { AdGenerationModal } from "@/components/AdGenerationModal";
import { toast } from "sonner";

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [selectedProductForAd, setSelectedProductForAd] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productApi.delete(id);
      await loadProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product");
    }
  };

  const handleFormSuccess = () => {
    loadProducts();
  };

  const handleGenerateAd = (product: Product) => {
    setSelectedProductForAd(product);
    setAdModalOpen(true);
  };

  const handleAdModalClose = (open: boolean) => {
    setAdModalOpen(open);
  };

  const handleAdSuccess = (ad: { headline: string; body: string; cta: string }) => {
    toast.success("Ad generated and saved!", {
      description: `Headline: ${ad.headline.substring(0, 50)}${ad.headline.length > 50 ? "..." : ""}`,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Products</h1>
          <p className="text-lg text-muted-foreground">
            Manage your trending affiliate products
          </p>
        </div>
        <Button onClick={handleAddProduct} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Product
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products by name, category, or audience..."
              className="w-full rounded-lg border-0 bg-muted/50 pl-10 pr-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-background transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="pt-2 flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={loadProducts} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center animate-fade-in">
            <div className="rounded-full bg-muted p-6 mb-4 inline-flex">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Get started by adding your first trending product to track and promote
            </p>
            <Button onClick={handleAddProduct} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-1.5 truncate">{product.name}</CardTitle>
                    <CardDescription className="text-sm">{product.category}</CardDescription>
                  </div>
                  {product.trending_score && product.trending_score > 0 && (
                    <Badge variant="warning" className="shrink-0 gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {product.trending_score}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {product.price_range && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Price Range</span>
                        <span className="font-semibold">{product.price_range}</span>
                      </div>
                    )}
                    {product.target_audience && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Target</span>
                        <span className="font-medium text-xs">{product.target_audience}</span>
                      </div>
                    )}
                  </div>

                  {/* Platform Badges */}
                  {(product.amazon_asin || product.tiktok_product_id || product.instagram_product_id) && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {product.amazon_asin && <Badge variant="amazon">Amazon</Badge>}
                      {product.tiktok_product_id && <Badge variant="tiktok">TikTok</Badge>}
                      {product.instagram_product_id && <Badge variant="instagram">Instagram</Badge>}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateAd(product)}
                      className="text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                      title="Generate Ad"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 group-hover:border-primary/50 transition-colors"
                    >
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => product.id && handleDeleteProduct(product.id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product Form Dialog */}
      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        onSuccess={handleFormSuccess}
      />

      {/* Ad Generation Modal */}
      <AdGenerationModal
        open={adModalOpen}
        onOpenChange={handleAdModalClose}
        product={selectedProductForAd}
        onSuccess={handleAdSuccess}
      />
    </div>
  );
}
