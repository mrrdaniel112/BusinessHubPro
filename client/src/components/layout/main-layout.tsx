import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import businessHubProLogo from "@assets/2 business hub pro 2logo .png";

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
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile navigation */}
      <MobileNav 
        opened={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        location={location}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 md:hidden sticky top-0 pt-safe shadow-sm">
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 touch-target"
            onClick={() => setMobileMenuOpen(true)}
            onTouchStart={handleTouchStart}
            aria-label="Open menu"
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <img
                className="h-8 w-auto"
                src={businessHubProLogo}
                alt="BusinessHubPro"
              />
            </div>
            <div className="flex items-center">
              <NotificationCenter />
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
