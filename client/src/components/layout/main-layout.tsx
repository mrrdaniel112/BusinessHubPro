import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import businessHubProLogo from "@assets/2 business hub pro 2logo .png";
import { ThemeToggle } from "@/components/theme-toggle";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  // Function to detect iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };
  
  // Handle touch events for iOS
  const handleTouchStart = (e: React.TouchEvent) => {
    // Allowing default behavior but ensuring it works on iOS
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-72 md:flex md:flex-col">
        <Sidebar />
      </div>

      {/* Mobile navigation */}
      <MobileNav 
        opened={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        location={location}
      />

      {/* Main content wrapper */}
      <div className="md:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden -m-2.5 p-2.5 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo - only show on mobile */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <img
                className="h-8 w-auto md:hidden"
                src={businessHubProLogo}
                alt="BusinessHubPro"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <ThemeToggle />
            <NotificationCenter />
          </div>
        </header>

        {/* Main content area */}
        <main className="min-h-screen py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
