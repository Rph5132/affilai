import { useState, useEffect, ReactNode } from "react";
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

// Platform configuration types
interface PlatformField {
  key: "affiliate_id" | "shop_id" | "account_name" | "notes";
  label: string;
  placeholder: string;
  helpText?: string;
  required?: boolean;
  type?: "input" | "textarea";
}

interface SetupStep {
  text: string;
  link?: { url: string; label: string };
}

interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  tabClassName: string;
  configuredField: "affiliate_id" | "shop_id";
  fields: PlatformField[];
  setupTitle: string;
  setupSteps: SetupStep[];
  requirements?: string;
}

// Platform configurations - single source of truth
const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: "amazon",
    name: "Amazon Associates",
    icon: "📦",
    description: "Configure your Amazon Associates affiliate credentials",
    tabClassName: "data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 dark:data-[state=active]:bg-orange-900/20 dark:data-[state=active]:text-orange-300",
    configuredField: "affiliate_id",
    fields: [
      {
        key: "affiliate_id",
        label: "Associate Tag (Tracking ID)",
        placeholder: "yourname-20",
        helpText: "Found in your Amazon Associates dashboard (format: yourname-20)",
        required: true,
      },
      {
        key: "account_name",
        label: "Account Name",
        placeholder: "My Amazon Associates Account",
      },
      {
        key: "notes",
        label: "Notes",
        placeholder: "Personal notes about this account",
        type: "textarea",
      },
    ],
    setupTitle: "Don't have an Amazon Associates account?",
    setupSteps: [
      { text: "Visit", link: { url: "https://affiliate-program.amazon.com", label: "affiliate-program.amazon.com" } },
      { text: "Sign up with your Amazon account (or create one)" },
      { text: "Complete your profile and tax information" },
      { text: "Wait for approval (usually 24-48 hours)" },
      { text: "Once approved, find your Associate Tag in the dashboard" },
      { text: "Copy your tag and paste it above" },
    ],
    requirements: "Must be 18+, have a website or social media presence with content",
  },
  {
    id: "tiktok",
    name: "TikTok Shop",
    icon: "🎵",
    description: "Configure your TikTok Shop Creator/Affiliate credentials",
    tabClassName: "data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-pink-900/20 dark:data-[state=active]:text-pink-300",
    configuredField: "shop_id",
    fields: [
      {
        key: "shop_id",
        label: "Shop ID",
        placeholder: "12345678",
        helpText: "Found in TikTok Seller Center under Account Settings",
        required: true,
      },
      {
        key: "affiliate_id",
        label: "Creator/Affiliate ID (Optional)",
        placeholder: "@yourcreatorname",
      },
      {
        key: "notes",
        label: "Notes (Optional)",
        placeholder: "Personal notes about this account",
        type: "textarea",
      },
    ],
    setupTitle: "Setting up TikTok Shop:",
    setupSteps: [
      { text: "Convert to TikTok Business Account in app settings" },
      { text: "Apply for TikTok Shop (", link: { url: "https://seller.tiktok.com", label: "seller.tiktok.com" } },
      { text: "Join TikTok Shop Affiliate Program" },
      { text: "Find your Shop ID in TikTok Seller Center" },
      { text: "Add products to your shop catalog" },
    ],
    requirements: "Usually requires 1000+ followers, varies by region",
  },
  {
    id: "instagram",
    name: "Instagram Shopping",
    icon: "📸",
    description: "Configure your Instagram Shopping credentials",
    tabClassName: "data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/20 dark:data-[state=active]:text-purple-300",
    configuredField: "shop_id",
    fields: [
      {
        key: "shop_id",
        label: "Shop/Business ID",
        placeholder: "1234567890",
        required: true,
      },
      {
        key: "notes",
        label: "Notes (Optional)",
        placeholder: "Personal notes about this account",
        type: "textarea",
      },
    ],
    setupTitle: "Setting up Instagram Shopping:",
    setupSteps: [
      { text: "Convert to Instagram Business/Creator account" },
      { text: "Connect to Meta Business Suite" },
      { text: "Set up Instagram Shopping (requires product catalog)" },
      { text: "Enable affiliate/creator tools in settings" },
      { text: "Find your Business ID in Meta Business Suite settings" },
    ],
  },
  {
    id: "youtube",
    name: "YouTube Shopping",
    icon: "▶️",
    description: "Configure your YouTube affiliate credentials",
    tabClassName: "data-[state=active]:bg-red-100 data-[state=active]:text-red-700 dark:data-[state=active]:bg-red-900/20 dark:data-[state=active]:text-red-300",
    configuredField: "affiliate_id",
    fields: [
      {
        key: "affiliate_id",
        label: "Channel ID",
        placeholder: "UCxxxxxxxxxxxxxxxxx",
        helpText: "Found in YouTube Studio under Customization → Basic info",
        required: true,
      },
      {
        key: "notes",
        label: "Notes (Optional)",
        placeholder: "Personal notes about this account",
        type: "textarea",
      },
    ],
    setupTitle: "Setting up YouTube Shopping:",
    setupSteps: [
      { text: "Join YouTube Partner Program (requires 1000 subscribers, 4000 watch hours)" },
      { text: "Enable monetization on your channel" },
      { text: "Apply for Shopping features in YouTube Studio" },
      { text: "Connect affiliate programs via YouTube Shopping" },
    ],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "📌",
    description: "Configure your Pinterest affiliate credentials",
    tabClassName: "data-[state=active]:bg-red-100 data-[state=active]:text-red-700 dark:data-[state=active]:bg-red-900/20 dark:data-[state=active]:text-red-300",
    configuredField: "affiliate_id",
    fields: [
      {
        key: "affiliate_id",
        label: "Account ID",
        placeholder: "1234567890",
        required: true,
      },
      {
        key: "notes",
        label: "Notes (Optional)",
        placeholder: "Personal notes about this account",
        type: "textarea",
      },
    ],
    setupTitle: "Setting up Pinterest Affiliate:",
    setupSteps: [
      { text: "Convert to Pinterest Business account" },
      { text: "Apply for Pinterest Creator Rewards or verified merchant status" },
      { text: "Set up product pins and catalogs" },
      { text: "Find your Account ID in Pinterest Business Hub" },
    ],
  },
];

// Reusable component for platform credentials card
interface PlatformCredentialsCardProps {
  config: PlatformConfig;
  credentials: Partial<AffiliateCredential>;
  saveStatus: { platform: string; message: string } | null;
  onSave: (platform: string, data: Partial<AffiliateCredential>) => void;
  onFieldChange: (platform: string, field: string, value: string) => void;
}

function PlatformCredentialsCard({
  config,
  credentials,
  saveStatus,
  onSave,
  onFieldChange,
}: PlatformCredentialsCardProps) {
  const isConfigured = Boolean(credentials[config.configuredField]);
  const showStatus = saveStatus?.platform === config.id;
  const isSuccess = saveStatus?.message.includes("successfully");

  const renderSetupStep = (step: SetupStep, index: number): ReactNode => {
    if (step.link) {
      return (
        <li key={index} className="pl-2">
          {step.text}{" "}
          <a
            href={step.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            {step.link.label}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {step.text.endsWith("(") && ")"}
        </li>
      );
    }
    return <li key={index} className="pl-2">{step.text}</li>;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-2xl">{config.icon}</span>
            </div>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {config.name}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {config.description}
              </CardDescription>
            </div>
          </div>
          {isConfigured && (
            <Badge variant="success" className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Configured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {config.fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={`${config.id}_${field.key}`} className="text-sm font-semibold">
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {field.type === "textarea" ? (
              <Textarea
                id={`${config.id}_${field.key}`}
                placeholder={field.placeholder}
                value={credentials[field.key] || ""}
                onChange={(e) => onFieldChange(config.id, field.key, e.target.value)}
                rows={3}
                className="resize-none"
              />
            ) : (
              <Input
                id={`${config.id}_${field.key}`}
                placeholder={field.placeholder}
                value={credentials[field.key] || ""}
                onChange={(e) => onFieldChange(config.id, field.key, e.target.value)}
                className="h-11"
              />
            )}
            {field.helpText && (
              <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1.5">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                {field.helpText}
              </p>
            )}
          </div>
        ))}

        <Button
          onClick={() => onSave(config.id, credentials)}
          className="w-full"
          size="lg"
        >
          Save {config.name.split(" ")[0]} Credentials
        </Button>

        {showStatus && (
          <Alert className={isSuccess ? "border-success/50 bg-success/10" : "border-destructive/50 bg-destructive/10"}>
            <AlertDescription className="flex items-center gap-2">
              {isSuccess && <CheckCircle2 className="h-4 w-4 text-success" />}
              {saveStatus.message}
            </AlertDescription>
          </Alert>
        )}

        <Card className="mt-6 border-dashed bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              {config.setupTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2.5 text-sm">
              {config.setupSteps.map(renderSetupStep)}
            </ol>
            {config.requirements && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Requirements:</strong> {config.requirements}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

// Loading skeleton component
function SettingsSkeleton() {
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
    return <SettingsSkeleton />;
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
          {PLATFORM_CONFIGS.map((config) => (
            <TabsTrigger
              key={config.id}
              value={config.id}
              className={config.tabClassName}
            >
              {config.name.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {PLATFORM_CONFIGS.map((config) => (
          <TabsContent key={config.id} value={config.id} className="mt-8">
            <PlatformCredentialsCard
              config={config}
              credentials={credentials[config.id] || {}}
              saveStatus={saveStatus}
              onSave={handleSave}
              onFieldChange={updateCredential}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
