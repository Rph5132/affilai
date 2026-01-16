import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { credentialsApi } from "@/services/api";
import type { AffiliateCredential } from "@/types";
import { CheckCircle2, ExternalLink, Info } from "lucide-react";

export function Settings() {
  const [credentials, setCredentials] = useState<Record<string, Partial<AffiliateCredential>>>({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ platform: string; message: string } | null>(null);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const allCreds = await credentialsApi.getAll();
      const credsMap = allCreds.reduce((acc, cred) => {
        acc[cred.platform] = cred;
        return acc;
      }, {} as Record<string, AffiliateCredential>);
      setCredentials(credsMap);
    } catch (error) {
      console.error("Failed to load credentials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (platform: string, data: Partial<AffiliateCredential>) => {
    try {
      await credentialsApi.save({
        platform,
        affiliate_id: data.affiliate_id,
        shop_id: data.shop_id,
        account_name: data.account_name,
        notes: data.notes,
      });
      setSaveStatus({ platform, message: "Saved successfully!" });
      setTimeout(() => setSaveStatus(null), 3000);
      await loadCredentials();
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus({ platform, message: "Failed to save. Please try again." });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const updateCredential = (platform: string, field: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        platform,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Skeleton className="h-16 w-full" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Affiliate Settings</h1>
        <p className="text-lg text-muted-foreground">
          Configure your affiliate program credentials to generate working tracking links
        </p>
      </div>

      <Alert className="border-info/50 bg-info/10">
        <Info className="h-5 w-5 text-info" />
        <AlertDescription className="ml-2">
          <strong>Getting Started:</strong> Enter your affiliate IDs below. Don't have affiliate accounts yet?
          Scroll down in each tab for step-by-step signup instructions.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="amazon" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1 gap-1">
          <TabsTrigger value="amazon" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 dark:data-[state=active]:bg-orange-900/20 dark:data-[state=active]:text-orange-300">
            Amazon
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-pink-900/20 dark:data-[state=active]:text-pink-300">
            TikTok
          </TabsTrigger>
          <TabsTrigger value="instagram" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/20 dark:data-[state=active]:text-purple-300">
            Instagram
          </TabsTrigger>
          <TabsTrigger value="youtube" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700 dark:data-[state=active]:bg-red-900/20 dark:data-[state=active]:text-red-300">
            YouTube
          </TabsTrigger>
          <TabsTrigger value="pinterest" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700 dark:data-[state=active]:bg-red-900/20 dark:data-[state=active]:text-red-300">
            Pinterest
          </TabsTrigger>
        </TabsList>

        {/* Amazon Tab */}
        <TabsContent value="amazon" className="mt-8">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      Amazon Associates
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Configure your Amazon Associates affiliate credentials
                    </CardDescription>
                  </div>
                </div>
                {credentials.amazon?.affiliate_id && (
                  <Badge variant="success" className="gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Configured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amazon_tag" className="text-sm font-semibold">
                  Associate Tag (Tracking ID) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amazon_tag"
                  placeholder="yourname-20"
                  value={credentials.amazon?.affiliate_id || ""}
                  onChange={(e) => updateCredential("amazon", "affiliate_id", e.target.value)}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1.5">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  Found in your Amazon Associates dashboard (format: yourname-20)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amazon_name" className="text-sm font-semibold">Account Name</Label>
                <Input
                  id="amazon_name"
                  placeholder="My Amazon Associates Account"
                  value={credentials.amazon?.account_name || ""}
                  onChange={(e) => updateCredential("amazon", "account_name", e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amazon_notes" className="text-sm font-semibold">Notes</Label>
                <Textarea
                  id="amazon_notes"
                  placeholder="Personal notes about this account"
                  value={credentials.amazon?.notes || ""}
                  onChange={(e) => updateCredential("amazon", "notes", e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={() => handleSave("amazon", credentials.amazon || {})}
                className="w-full"
                size="lg"
              >
                Save Amazon Credentials
              </Button>

              {saveStatus?.platform === "amazon" && (
                <Alert className={saveStatus.message.includes("successfully") ? "border-success/50 bg-success/10" : "border-destructive/50 bg-destructive/10"}>
                  <AlertDescription className="flex items-center gap-2">
                    {saveStatus.message.includes("successfully") ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : null}
                    {saveStatus.message}
                  </AlertDescription>
                </Alert>
              )}

              <Card className="mt-6 border-dashed bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    Don't have an Amazon Associates account?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2.5 text-sm">
                    <li className="pl-2">
                      Visit{" "}
                      <a
                        href="https://affiliate-program.amazon.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                      >
                        affiliate-program.amazon.com
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </li>
                    <li className="pl-2">Sign up with your Amazon account (or create one)</li>
                    <li className="pl-2">Complete your profile and tax information</li>
                    <li className="pl-2">Wait for approval (usually 24-48 hours)</li>
                    <li className="pl-2">Once approved, find your Associate Tag in the dashboard</li>
                    <li className="pl-2">Copy your tag and paste it above</li>
                  </ol>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Requirements:</strong> Must be 18+, have a website or social media presence with content
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TikTok Tab */}
        <TabsContent value="tiktok" className="mt-8">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                    <span className="text-2xl">🎵</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">TikTok Shop</CardTitle>
                    <CardDescription className="text-base mt-1">Configure your TikTok Shop Creator/Affiliate credentials</CardDescription>
                  </div>
                </div>
                {credentials.tiktok?.shop_id && (
                  <Badge variant="success" className="gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Configured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="tiktok_shop_id">Shop ID *</Label>
                <Input
                  id="tiktok_shop_id"
                  placeholder="12345678"
                  value={credentials.tiktok?.shop_id || ""}
                  onChange={(e) => updateCredential("tiktok", "shop_id", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Found in TikTok Seller Center under Account Settings
                </p>
              </div>

              <div>
                <Label htmlFor="tiktok_creator_id">Creator/Affiliate ID (Optional)</Label>
                <Input
                  id="tiktok_creator_id"
                  placeholder="@yourcreatorname"
                  value={credentials.tiktok?.affiliate_id || ""}
                  onChange={(e) => updateCredential("tiktok", "affiliate_id", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="tiktok_notes">Notes (Optional)</Label>
                <Textarea
                  id="tiktok_notes"
                  placeholder="Personal notes about this account"
                  value={credentials.tiktok?.notes || ""}
                  onChange={(e) => updateCredential("tiktok", "notes", e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={() => handleSave("tiktok", credentials.tiktok || {})} className="w-full">
                Save TikTok Credentials
              </Button>

              {saveStatus?.platform === "tiktok" && (
                <Alert>
                  <AlertDescription>{saveStatus.message}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Setting up TikTok Shop:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Convert to TikTok Business Account in app settings</li>
                  <li>
                    Apply for TikTok Shop (
                    <a
                      href="https://seller.tiktok.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline inline-flex items-center gap-1"
                    >
                      seller.tiktok.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    )
                  </li>
                  <li>Join TikTok Shop Affiliate Program</li>
                  <li>Find your Shop ID in TikTok Seller Center</li>
                  <li>Add products to your shop catalog</li>
                </ol>
                <p className="mt-3 text-xs text-muted-foreground">
                  <strong>Requirements:</strong> Usually requires 1000+ followers, varies by region
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instagram Tab */}
        <TabsContent value="instagram" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Instagram Shopping
                {credentials.instagram?.shop_id && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>Configure your Instagram Shopping credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instagram_shop_id">Shop/Business ID *</Label>
                <Input
                  id="instagram_shop_id"
                  placeholder="1234567890"
                  value={credentials.instagram?.shop_id || ""}
                  onChange={(e) => updateCredential("instagram", "shop_id", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="instagram_notes">Notes (Optional)</Label>
                <Textarea
                  id="instagram_notes"
                  placeholder="Personal notes about this account"
                  value={credentials.instagram?.notes || ""}
                  onChange={(e) => updateCredential("instagram", "notes", e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={() => handleSave("instagram", credentials.instagram || {})} className="w-full">
                Save Instagram Credentials
              </Button>

              {saveStatus?.platform === "instagram" && (
                <Alert>
                  <AlertDescription>{saveStatus.message}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Setting up Instagram Shopping:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Convert to Instagram Business/Creator account</li>
                  <li>Connect to Meta Business Suite</li>
                  <li>Set up Instagram Shopping (requires product catalog)</li>
                  <li>Enable affiliate/creator tools in settings</li>
                  <li>Find your Business ID in Meta Business Suite settings</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* YouTube Tab */}
        <TabsContent value="youtube" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                YouTube Shopping
                {credentials.youtube?.affiliate_id && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>Configure your YouTube affiliate credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="youtube_channel_id">Channel ID *</Label>
                <Input
                  id="youtube_channel_id"
                  placeholder="UCxxxxxxxxxxxxxxxxx"
                  value={credentials.youtube?.affiliate_id || ""}
                  onChange={(e) => updateCredential("youtube", "affiliate_id", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Found in YouTube Studio under Customization → Basic info
                </p>
              </div>

              <div>
                <Label htmlFor="youtube_notes">Notes (Optional)</Label>
                <Textarea
                  id="youtube_notes"
                  placeholder="Personal notes about this account"
                  value={credentials.youtube?.notes || ""}
                  onChange={(e) => updateCredential("youtube", "notes", e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={() => handleSave("youtube", credentials.youtube || {})} className="w-full">
                Save YouTube Credentials
              </Button>

              {saveStatus?.platform === "youtube" && (
                <Alert>
                  <AlertDescription>{saveStatus.message}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Setting up YouTube Shopping:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Join YouTube Partner Program (requires 1000 subscribers, 4000 watch hours)</li>
                  <li>Enable monetization on your channel</li>
                  <li>Apply for Shopping features in YouTube Studio</li>
                  <li>Connect affiliate programs via YouTube Shopping</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pinterest Tab */}
        <TabsContent value="pinterest" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pinterest
                {credentials.pinterest?.affiliate_id && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>Configure your Pinterest affiliate credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pinterest_account_id">Account ID *</Label>
                <Input
                  id="pinterest_account_id"
                  placeholder="1234567890"
                  value={credentials.pinterest?.affiliate_id || ""}
                  onChange={(e) => updateCredential("pinterest", "affiliate_id", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="pinterest_notes">Notes (Optional)</Label>
                <Textarea
                  id="pinterest_notes"
                  placeholder="Personal notes about this account"
                  value={credentials.pinterest?.notes || ""}
                  onChange={(e) => updateCredential("pinterest", "notes", e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={() => handleSave("pinterest", credentials.pinterest || {})} className="w-full">
                Save Pinterest Credentials
              </Button>

              {saveStatus?.platform === "pinterest" && (
                <Alert>
                  <AlertDescription>{saveStatus.message}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Setting up Pinterest Affiliate:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Convert to Pinterest Business account</li>
                  <li>Apply for Pinterest Creator Rewards or verified merchant status</li>
                  <li>Set up product pins and catalogs</li>
                  <li>Find your Account ID in Pinterest Business Hub</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
