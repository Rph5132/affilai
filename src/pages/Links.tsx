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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Active</Badge>;
      case "expired":
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" />Expired</Badge>;
      case "invalid":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Invalid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlatformBadge = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes("amazon")) return <Badge variant="amazon">Amazon</Badge>;
    if (platformLower.includes("tiktok")) return <Badge variant="tiktok">TikTok</Badge>;
    if (platformLower.includes("instagram")) return <Badge variant="instagram">Instagram</Badge>;
    if (platformLower.includes("youtube")) return <Badge variant="youtube">YouTube</Badge>;
    if (platformLower.includes("pinterest")) return <Badge variant="pinterest">Pinterest</Badge>;
    return <Badge variant="secondary">{platform}</Badge>;
  };

  const productsWithoutLinks = products.filter(
    (product) => !links.some((link) => link.product_id === product.id)
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Affiliate Links</h1>
          <p className="text-lg text-muted-foreground">
            Generate and manage your affiliate tracking links
          </p>
        </div>
        <Button onClick={handleGenerateAll} disabled={generatingAll} size="lg">
          {generatingAll ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
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
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : links.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center animate-fade-in">
            <div className="rounded-full bg-muted p-6 mb-4 inline-flex">
              <LinkIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No affiliate links yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Generate affiliate links for your products to start earning
              commissions and tracking performance
            </p>
            <Button onClick={handleGenerateAll} disabled={generatingAll} size="lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Links for All Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 stagger-children">
            {links.map((link) => (
              <Card key={link.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl mb-2 truncate">
                        {link.product_name}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        {getPlatformBadge(link.platform)}
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm font-medium text-muted-foreground">{link.program_name}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(link.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(link.commission_rate || link.cookie_duration) && (
                      <div className="grid grid-cols-2 gap-6 pb-4 border-b">
                        {link.commission_rate && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Commission Rate</p>
                            <p className="text-lg font-bold text-success">
                              {(link.commission_rate * 100).toFixed(1)}%
                            </p>
                          </div>
                        )}
                        {link.cookie_duration && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Cookie Duration</p>
                            <p className="text-lg font-bold">
                              {link.cookie_duration} <span className="text-sm font-normal text-muted-foreground">days</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="rounded-lg bg-muted/50 p-4 border">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Tracking URL</p>
                          <code className="block truncate text-sm font-mono">
                            {link.tracking_url}
                          </code>
                        </div>
                        <Button
                          size="sm"
                          variant={copiedId === link.id ? "success" : "outline"}
                          onClick={() =>
                            link.id && handleCopy(link.tracking_url, link.id)
                          }
                          className="shrink-0"
                        >
                          {copiedId === link.id ? (
                            <>
                              <CheckCircle2 className="mr-1.5 h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1.5 h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(link.destination_url, "_blank")
                        }
                        className="hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <ExternalLink className="mr-1.5 h-4 w-4" />
                        Visit Program
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => link.id && handleRefresh(link.id)}
                        disabled={refreshingId === link.id}
                      >
                        {refreshingId === link.id ? (
                          <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-1.5 h-4 w-4" />
                        )}
                        Refresh
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => link.id && handleDelete(link.id)}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Delete
                      </Button>
                    </div>

                    {link.created_at && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                        <Clock className="h-3 w-3" />
                        <span>Created {new Date(link.created_at).toLocaleDateString()} at {new Date(link.created_at).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {productsWithoutLinks.length > 0 && (
            <Card className="border-dashed">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Products Without Links</CardTitle>
                    <CardDescription className="text-base">
                      {productsWithoutLinks.length} {productsWithoutLinks.length === 1 ? 'product needs' : 'products need'} affiliate links
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {productsWithoutLinks.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base mb-1 truncate">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.category}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => product.id && handleGenerateSingle(product.id)}
                        disabled={generatingId === product.id}
                        className="shrink-0 ml-4"
                      >
                        {generatingId === product.id ? (
                          <>
                            <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-1.5 h-4 w-4" />
                            Generate Link
                          </>
                        )}
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
