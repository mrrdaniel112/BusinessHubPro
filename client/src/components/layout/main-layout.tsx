import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";
import { cn } from "@/lib/utils";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

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
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <Sidebar />

      {/* Mobile navigation */}
      <MobileNav 
        opened={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        location={location}
      />

      {/* Mobile menu and content */}
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 md:hidden sticky top-0 pt-safe">
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 touch-target"
            onClick={() => setMobileMenuOpen(true)}
            onTouchStart={handleTouchStart}
            aria-label="Open menu"
            style={{ minHeight: '44px', minWidth: '44px' }} /* iOS accessibility standards */
          >
            <i className="ri-menu-line text-2xl"></i>
          </button>
          <div className="flex-1 flex justify-center px-2">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-lg font-semibold text-primary-600 truncate mobile-text-adjust">Business Platform</span>
            </div>
          </div>
          <div className="flex items-center pr-safe">
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="touch-target max-w-xs rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onTouchStart={handleTouchStart}
                  aria-label="Profile menu"
                  style={{ minHeight: '44px', minWidth: '44px' }} /* iOS accessibility standards */
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Profile"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content - with iOS and Android specific optimizations */}
        <main 
          className="flex-1 relative overflow-y-auto focus:outline-none pb-safe touch-scroll-content"
          onTouchStart={handleTouchStart}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className={`min-h-screen ios-specific android-specific ${isIOS() ? 'transform-gpu' : ''}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
