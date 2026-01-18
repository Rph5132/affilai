import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing dark/light theme toggle.
 * Extracted from Sidebar.tsx for reusability.
 *
 * Features:
 * - Syncs with document class and localStorage
 * - Can be used anywhere theme toggle is needed
 * - Handles initial state from system preferences
 */
export function useThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Check initial dark mode state from document class
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  // Toggle between dark and light mode
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const newValue = !prev;
      document.documentElement.classList.toggle("dark", newValue);
      localStorage.setItem("theme", newValue ? "dark" : "light");
      return newValue;
    });
  }, []);

  // Set specific theme
  const setTheme = useCallback((dark: boolean) => {
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, []);

  return {
    isDark,
    toggleTheme,
    setTheme,
  };
}
