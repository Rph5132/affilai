import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { credentialsApi } from "@/services/api";
import type { AffiliateCredential } from "@/types";
import { CheckCircle2, ExternalLink } from "lucide-react";

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
      <div className="container mx-auto p-6">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Affiliate Settings</h1>
      <p className="text-muted-foreground mb-6">
        Configure your affiliate program credentials to generate working tracking links
      </p>

      <Alert className="mb-6">
        <AlertDescription>
          <strong>Getting Started:</strong> Enter your affiliate IDs below. Don't have affiliate accounts yet?
          Scroll down in each tab for step-by-step signup instructions.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="amazon" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="amazon">Amazon</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="pinterest">Pinterest</TabsTrigger>
        </TabsList>

        {/* Amazon Tab */}
        <TabsContent value="amazon" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Amazon Associates
                {credentials.amazon?.affiliate_id && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </CardTitle>
              <CardDescription>
                Configure your Amazon Associates affiliate credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amazon_tag">Associate Tag (Tracking ID) *</Label>
                <Input
                  id="amazon_tag"
                  placeholder="yourname-20"
                  value={credentials.amazon?.affiliate_id || ""}
                  onChange={(e) => updateCredential("amazon", "affiliate_id", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Found in your Amazon Associates dashboard (format: yourname-20)
                </p>
              </div>

              <div>
                <Label htmlFor="amazon_name">Account Name (Optional)</Label>
                <Input
                  id="amazon_name"
                  placeholder="My Amazon Associates Account"
                  value={credentials.amazon?.account_name || ""}
                  onChange={(e) => updateCredential("amazon", "account_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="amazon_notes">Notes (Optional)</Label>
                <Textarea
                  id="amazon_notes"
                  placeholder="Personal notes about this account"
                  value={credentials.amazon?.notes || ""}
                  onChange={(e) => updateCredential("amazon", "notes", e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={() => handleSave("amazon", credentials.amazon || {})} className="w-full">
                Save Amazon Credentials
              </Button>

              {saveStatus?.platform === "amazon" && (
                <Alert>
                  <AlertDescription>{saveStatus.message}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  Don't have an Amazon Associates account?
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    Visit{" "}
                    <a
                      href="https://affiliate-program.amazon.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline inline-flex items-center gap-1"
                    >
                      affiliate-program.amazon.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Sign up with your Amazon account (or create one)</li>
                  <li>Complete your profile and tax information</li>
                  <li>Wait for approval (usually 24-48 hours)</li>
                  <li>Once approved, find your Associate Tag in the dashboard</li>
                  <li>Copy your tag and paste it above</li>
                </ol>
                <p className="mt-3 text-xs text-muted-foreground">
                  <strong>Requirements:</strong> Must be 18+, have a website or social media presence with content
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TikTok Tab */}
        <TabsContent value="tiktok" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                TikTok Shop
                {credentials.tiktok?.shop_id && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              </CardTitle>
              <CardDescription>Configure your TikTok Shop Creator/Affiliate credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
