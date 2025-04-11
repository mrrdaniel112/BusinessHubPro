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
          <div className="flex-1 px-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-10 w-auto bg-white rounded-md shadow-sm p-1 border border-gray-100 flex items-center justify-center">
                <img
                  className="h-7 w-auto"
                  src={businessHubProLogo}
                  alt="BusinessHubPro"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Quick add button */}
              <button 
                type="button" 
                className="bg-primary-50 p-2 rounded-full text-primary-500 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Quick actions"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              
              {/* Search button */}
              <button 
                type="button" 
                className="bg-gray-100 p-2 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
              
              <NotificationCenter />
              
              {/* User profile icon */}
              {user?.profilePicture ? (
                <button className="h-8 w-8 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <img 
                    src={user.profilePicture} 
                    alt="User profile" 
                    className="h-full w-full object-cover"
                  />
                </button>
              ) : (
                <button className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  {user?.username ? user.username.substring(0, 1).toUpperCase() : "U"}
                </button>
              )}
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
