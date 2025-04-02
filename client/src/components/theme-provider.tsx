"use client"

import * as React from "react"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: 'light' | 'dark' | 'system'
  storageKey?: string
}

export const ThemeContext = React.createContext({
  theme: 'light' as 'light' | 'dark',
  setTheme: (theme: 'light' | 'dark') => {},
});

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system',
  storageKey = 'theme'
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  // Initial setup
  React.useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as 'light' | 'dark' | 'system' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme: 'light' | 'dark';
    if (savedTheme === 'dark' || (savedTheme === 'system' && prefersDark) || (!savedTheme && defaultTheme === 'dark')) {
      initialTheme = 'dark';
    } else {
      initialTheme = 'light';
    }
    
    setTheme(initialTheme);
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [defaultTheme, storageKey]);

  const contextValue = React.useMemo(() => ({
    theme,
    setTheme: (newTheme: 'light' | 'dark') => {
      setTheme(newTheme);
      
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      localStorage.setItem(storageKey, newTheme);
    }
  }), [theme, storageKey]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Add a custom hook for easy usage
export const useTheme = () => React.useContext(ThemeContext); 