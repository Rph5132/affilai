import { LucideIcon, Package, Link as LinkIcon, Megaphone, TrendingUp, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Stat card configuration
interface StatConfig {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: "orange" | "blue" | "purple" | "green";
  badge?: { text: string; icon?: LucideIcon };
}

const COLOR_CLASSES = {
  orange: {
    gradient: "from-orange-500/10",
    bg: "bg-orange-100 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  blue: {
    gradient: "from-blue-500/10",
    bg: "bg-blue-100 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  purple: {
    gradient: "from-purple-500/10",
    bg: "bg-purple-100 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  green: {
    gradient: "from-green-500/10",
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
  },
} as const;

const STATS_CONFIG: StatConfig[] = [
  {
    title: "Total Products",
    value: "10",
    subtitle: "Trending products tracked",
    icon: Package,
    color: "orange",
  },
  {
    title: "Active Links",
    value: "0",
    subtitle: "Affiliate links created",
    icon: LinkIcon,
    color: "blue",
  },
  {
    title: "Campaigns",
    value: "0",
    subtitle: "Active campaigns",
    icon: Megaphone,
    color: "purple",
  },
  {
    title: "Total Revenue",
    value: "$0.00",
    subtitle: "Lifetime earnings",
    icon: TrendingUp,
    color: "green",
    badge: { text: "New", icon: ArrowUpRight },
  },
];

// Quick start step configuration
interface QuickStartStep {
  title: string;
  description: string;
  highlightedWord: string;
}

const QUICK_START_STEPS: QuickStartStep[] = [
  {
    title: "Browse Trending Products",
    description: "Visit the {highlight} page to see our curated list of trending affiliate products",
    highlightedWord: "Products",
  },
  {
    title: "Configure Your Credentials",
    description: "Go to {highlight} to add your affiliate IDs for each platform",
    highlightedWord: "Settings",
  },
  {
    title: "Generate Affiliate Links",
    description: "Head to the {highlight} page and create optimized tracking links",
    highlightedWord: "Links",
  },
  {
    title: "Track Performance",
    description: "Monitor your campaigns and earnings in {highlight}",
    highlightedWord: "Analytics",
  },
];

// Reusable StatCard component
function StatCard({ stat }: { stat: StatConfig }) {
  const colors = COLOR_CLASSES[stat.color];
  const Icon = stat.icon;

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} to-transparent rounded-full -translate-y-16 translate-x-16`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
        <div className={`h-10 w-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stat.value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {stat.subtitle}
          {stat.badge && (
            <Badge variant="success" className="ml-1">
              {stat.badge.icon && <stat.badge.icon className="h-3 w-3 mr-0.5" />}
              {stat.badge.text}
            </Badge>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

// Reusable QuickStartStep component
function QuickStartStepCard({ step, stepNumber }: { step: QuickStartStep; stepNumber: number }) {
  // Parse description to insert highlighted word
  const parts = step.description.split("{highlight}");

  return (
    <div className="flex gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
        {stepNumber}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold mb-1">{step.title}</h4>
        <p className="text-sm text-muted-foreground">
          {parts[0]}
          <strong>{step.highlightedWord}</strong>
          {parts[1]}
        </p>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back! Here's an overview of your affiliate marketing campaigns
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger-children">
        {STATS_CONFIG.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      {/* Quick Start Section */}
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Quick Start Guide</CardTitle>
              <CardDescription>
                Get started with AffilAI in {QUICK_START_STEPS.length} simple steps
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {QUICK_START_STEPS.map((step, index) => (
              <QuickStartStepCard key={step.title} step={step} stepNumber={index + 1} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
