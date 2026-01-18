import { createContext, useContext, useState, ReactNode } from "react";

interface LayoutContextType {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const setSidebarOpen = (open: boolean) => setIsSidebarOpen(open);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <LayoutContext.Provider
      value={{ isSidebarOpen, setSidebarOpen, toggleSidebar }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
