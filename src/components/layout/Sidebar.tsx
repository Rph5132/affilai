import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Link as LinkIcon,
  Megaphone,
  BarChart3,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { NavigationList, type NavItem } from "./NavigationItem";

/**
 * Navigation configuration
 */
const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Links", href: "/links", icon: LinkIcon },
  { name: "Campaigns", href: "/campaigns", icon: Megaphone },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const secondaryNav: NavItem[] = [
  { name: "Settings", href: "/settings", icon: Settings },
];

/**
 * Sidebar - Refactored for clarity
 *
 * Changes:
 * - Extracted useThemeToggle hook for theme management
 * - Extracted NavigationList component to eliminate duplication
 * - Cleaner separation of navigation data from rendering
 */
export function Sidebar() {
  const { isSidebarOpen, setSidebarOpen, toggleSidebar } = useLayout();
  const { isDark, toggleTheme } = useThemeToggle();

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-[60] lg:hidden bg-white dark:bg-slate-900 shadow-lg border-border"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 flex h-full w-64 flex-col border-r bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none lg:z-0",
          isSidebarOpen ? "translate-x-0 z-50" : "-translate-x-full"
        )}
      >
        {/* Logo/Header */}
        <div className="flex h-20 items-center gap-3 border-b px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <LinkIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AffilAI</h1>
            <p className="text-xs text-muted-foreground">Affiliate Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          {/* Primary Navigation */}
          <NavigationList items={navigation} onItemClick={closeSidebar} />

          {/* Divider */}
          <div className="my-4 border-t" />

          {/* Secondary Navigation */}
          <NavigationList items={secondaryNav} onItemClick={closeSidebar} />
        </nav>

        {/* Footer with dark mode toggle */}
        <div className="space-y-4 border-t p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start gap-2"
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                Dark Mode
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            AffilAI v0.1.0
          </p>
        </div>
      </div>

      {/* Click-outside area to close sidebar on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-y-0 left-64 right-0 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
