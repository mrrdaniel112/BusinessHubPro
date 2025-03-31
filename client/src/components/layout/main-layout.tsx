import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "./sidebar";
import MobileNav from "./mobile-nav";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

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
          <div className="flex items-center space-x-2 pr-safe">
            {/* Notification Center */}
            <div className="relative">
              <NotificationCenter />
            </div>
            {/* User profile */}
            <div className="relative">
              <div>
                <button
                  type="button"
                  className="touch-target max-w-xs rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onTouchStart={handleTouchStart}
                  aria-label="Profile menu"
                  style={{ minHeight: '44px', minWidth: '44px' }} /* iOS accessibility standards */
                >
                  {user?.profilePicture ? (
                    <img 
                      className="h-8 w-8 rounded-full object-cover" 
                      src={user.profilePicture} 
                      alt="Profile" 
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
                      {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                    </div>
                  )}
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
