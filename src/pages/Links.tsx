import { useEffect, useState } from "react";
import { affiliateLinkApi, productApi } from "@/services/api";
import type { AffiliateLink, Product } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Link as LinkIcon,
  Copy,
  RefreshCw,
  Trash2,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export function Links() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [linksData, productsData] = await Promise.all([
        affiliateLinkApi.getAll(),
        productApi.getAll(),
      ]);
      setLinks(linksData);
      setProducts(productsData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load affiliate links"
      );
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    try {
      setGeneratingAll(true);
      const newLinks = await affiliateLinkApi.generateForAllProducts();
      if (newLinks.length > 0) {
        await loadData();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate links"
      );
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleGenerateSingle = async (productId: number) => {
    try {
      setGeneratingId(productId);
      await affiliateLinkApi.generateLink({ product_id: productId });
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate link"
      );
    } finally {
      setGeneratingId(null);
    }
  };

  const handleRefresh = async (linkId: number) => {
    try {
      setRefreshingId(linkId);
      await affiliateLinkApi.refreshLink(linkId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh link");
    } finally {
      setRefreshingId(null);
    }
  };

  const handleCopy = async (trackingUrl: string, linkId: number) => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopiedId(linkId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to copy link");
    }
  };

  const handleDelete = async (linkId: number) => {
    if (!confirm("Are you sure you want to delete this affiliate link?")) {
      return;
    }

    try {
      await affiliateLinkApi.deleteLink(linkId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete link");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "expired":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "invalid":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const productsWithoutLinks = products.filter(
    (product) => !links.some((link) => link.product_id === product.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Links</h1>
          <p className="text-muted-foreground">
            Generate and manage your affiliate tracking links
          </p>
        </div>
        <Button onClick={handleGenerateAll} disabled={generatingAll}>
          {generatingAll ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate All Links
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground" />
            <div className="text-muted-foreground">Loading links...</div>
          </div>
        </div>
      ) : links.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <LinkIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No affiliate links yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Generate affiliate links for your products to start earning
              commissions
            </p>
            <Button onClick={handleGenerateAll} disabled={generatingAll}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Links for All Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {links.map((link) => (
              <Card key={link.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {link.product_name}
                        {getStatusIcon(link.status)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                          {link.platform}
                        </span>
                        <span className="text-xs">•</span>
                        <span className="font-medium">{link.program_name}</span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">
                          {getStatusLabel(link.status)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {link.commission_rate && (
                        <div>
                          <span className="text-muted-foreground">
                            Commission:
                          </span>
                          <span className="ml-2 font-medium">
                            {(link.commission_rate * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                      {link.cookie_duration && (
                        <div>
                          <span className="text-muted-foreground">
                            Cookie Duration:
                          </span>
                          <span className="ml-2 font-medium">
                            {link.cookie_duration} days
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="rounded-md bg-muted p-3">
                      <div className="flex items-center justify-between gap-2">
                        <code className="flex-1 truncate text-xs">
                          {link.tracking_url}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            link.id && handleCopy(link.tracking_url, link.id)
                          }
                        >
                          {copiedId === link.id ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(link.destination_url, "_blank")
                        }
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Visit Program
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => link.id && handleRefresh(link.id)}
                        disabled={refreshingId === link.id}
                      >
                        {refreshingId === link.id ? (
                          <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-3 w-3" />
                        )}
                        Refresh
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => link.id && handleDelete(link.id)}
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </div>

                    {link.created_at && (
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(link.created_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {productsWithoutLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Products Without Links</CardTitle>
                <CardDescription>
                  Generate affiliate links for these products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {productsWithoutLinks.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.category}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => product.id && handleGenerateSingle(product.id)}
                        disabled={generatingId === product.id}
                      >
                        {generatingId === product.id ? (
                          <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-3 w-3" />
                        )}
                        Generate Link
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
