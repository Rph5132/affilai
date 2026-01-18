import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

// Status badge configuration
type StatusType = "active" | "expired" | "invalid";

interface StatusBadgeConfig {
  variant: "success" | "warning" | "destructive" | "secondary";
  icon: typeof CheckCircle2;
  label: string;
}

const STATUS_CONFIG: Record<StatusType, StatusBadgeConfig> = {
  active: { variant: "success", icon: CheckCircle2, label: "Active" },
  expired: { variant: "warning", icon: Clock, label: "Expired" },
  invalid: { variant: "destructive", icon: XCircle, label: "Invalid" },
};

export function getStatusBadge(status: string) {
  const config = STATUS_CONFIG[status as StatusType];

  if (config) {
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  }

  return <Badge variant="secondary">{status}</Badge>;
}

// Platform badge configuration
type PlatformType = "amazon" | "tiktok" | "instagram" | "youtube" | "pinterest";

interface PlatformBadgeConfig {
  variant: "amazon" | "tiktok" | "instagram" | "youtube" | "pinterest";
  label: string;
  keywords: string[];
}

const PLATFORM_CONFIG: PlatformBadgeConfig[] = [
  { variant: "amazon", label: "Amazon", keywords: ["amazon"] },
  { variant: "tiktok", label: "TikTok", keywords: ["tiktok"] },
  { variant: "instagram", label: "Instagram", keywords: ["instagram"] },
  { variant: "youtube", label: "YouTube", keywords: ["youtube"] },
  { variant: "pinterest", label: "Pinterest", keywords: ["pinterest"] },
];

export function getPlatformBadge(platform: string) {
  const platformLower = platform.toLowerCase();

  for (const config of PLATFORM_CONFIG) {
    if (config.keywords.some(keyword => platformLower.includes(keyword))) {
      return <Badge variant={config.variant}>{config.label}</Badge>;
    }
  }

  return <Badge variant="secondary">{platform}</Badge>;
}

// Export types for external use
export type { StatusType, PlatformType };
