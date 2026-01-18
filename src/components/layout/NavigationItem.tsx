import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Navigation item configuration type
 */
export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

/**
 * NavigationItem - Renders a single navigation link with active state styling.
 * Extracted from Sidebar.tsx to eliminate duplication between primary and secondary nav.
 */
interface NavigationItemProps {
  item: NavItem;
  onClick?: () => void;
}

export function NavigationItem({ item, onClick }: NavigationItemProps) {
  const location = useLocation();
  const isActive = location.pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 transition-transform duration-200",
          isActive ? "" : "group-hover:scale-110"
        )}
      />
      {item.name}
    </Link>
  );
}

/**
 * NavigationList - Renders a list of navigation items.
 * Can be used for both primary and secondary navigation.
 */
interface NavigationListProps {
  items: NavItem[];
  onItemClick?: () => void;
}

export function NavigationList({ items, onItemClick }: NavigationListProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <NavigationItem key={item.name} item={item} onClick={onItemClick} />
      ))}
    </div>
  );
}
