import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { LayoutProvider, useLayout } from "@/contexts/LayoutContext";

interface LayoutProps {
  children: ReactNode;
}

// Inner component that consumes the context
function LayoutContent({ children }: LayoutProps) {
  const { isSidebarOpen } = useLayout();

  // Using inline styles for margin because Tailwind class merging
  // can be unreliable for dynamic layout shifts in Tauri webviews.
  // 256px = w-64 (16rem = 256px)
  const mainStyle = {
    marginLeft: isSidebarOpen ? 256 : 0,
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={mainStyle}
      >
        <div className="container mx-auto p-6 lg:p-8 pt-20 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// Main Layout component wraps children with the provider
export function Layout({ children }: LayoutProps) {
  return (
    <LayoutProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutProvider>
  );
}
