import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

/**
 * Status badge configuration - data-driven approach replaces switch statements
 */
const STATUS_CONFIG = {
  active: {
    variant: "success" as const,
    icon: CheckCircle2,
    label: "Active",
  },
  expired: {
    variant: "warning" as const,
    icon: Clock,
    label: "Expired",
  },
  invalid: {
    variant: "destructive" as const,
    icon: XCircle,
    label: "Invalid",
  },
} as const;

/**
 * Platform badge configuration - data-driven approach replaces if-else chains
 */
const PLATFORM_CONFIG = {
  amazon: { variant: "amazon" as const, label: "Amazon" },
  tiktok: { variant: "tiktok" as const, label: "TikTok" },
  instagram: { variant: "instagram" as const, label: "Instagram" },
  youtube: { variant: "youtube" as const, label: "YouTube" },
  pinterest: { variant: "pinterest" as const, label: "Pinterest" },
} as const;

type StatusType = keyof typeof STATUS_CONFIG;
type PlatformType = keyof typeof PLATFORM_CONFIG;

/**
 * StatusBadge - Displays status with appropriate icon and color
 * Replaces switch statement pattern found in Links.tsx
 */
interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as StatusType];

  if (!config) {
    return <Badge variant="secondary">{status}</Badge>;
  }

  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

/**
 * PlatformBadge - Displays platform with brand-specific styling
 * Replaces if-else chain pattern found in Links.tsx
 */
interface PlatformBadgeProps {
  platform: string;
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const platformLower = platform.toLowerCase();

  // Find matching platform from config
  for (const [key, config] of Object.entries(PLATFORM_CONFIG)) {
    if (platformLower.includes(key)) {
      return <Badge variant={config.variant}>{config.label}</Badge>;
    }
  }

  // Fallback for unknown platforms
  return <Badge variant="secondary">{platform}</Badge>;
}

/**
 * Helper to check if a platform is configured
 */
export function isPlatformConfigured(platform: string): boolean {
  const platformLower = platform.toLowerCase();
  return Object.keys(PLATFORM_CONFIG).some((key) => platformLower.includes(key));
}

/**
 * Get all configured platform keys
 */
export function getConfiguredPlatforms(): PlatformType[] {
  return Object.keys(PLATFORM_CONFIG) as PlatformType[];
}
