import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Link as LinkIcon, Megaphone, TrendingUp, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        {/* Total Products Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">10</div>
            <p className="text-xs text-muted-foreground mt-1">
              Trending products tracked
            </p>
          </CardContent>
        </Card>

        {/* Active Links Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Links
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <LinkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Affiliate links created
            </p>
          </CardContent>
        </Card>

        {/* Campaigns Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Campaigns
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active campaigns
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Lifetime earnings
              <Badge variant="success" className="ml-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                New
              </Badge>
            </p>
          </CardContent>
        </Card>
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
                Get started with AffilAI in 4 simple steps
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Step 1 */}
            <div className="flex gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Browse Trending Products</h4>
                <p className="text-sm text-muted-foreground">
                  Visit the <strong>Products</strong> page to see our curated list of trending affiliate products
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Configure Your Credentials</h4>
                <p className="text-sm text-muted-foreground">
                  Go to <strong>Settings</strong> to add your affiliate IDs for each platform
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Generate Affiliate Links</h4>
                <p className="text-sm text-muted-foreground">
                  Head to the <strong>Links</strong> page and create optimized tracking links
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Track Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor your campaigns and earnings in <strong>Analytics</strong>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
