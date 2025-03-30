import { useState } from "react";
import { Link } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

type MobileNavProps = {
  opened: boolean;
  onClose: () => void;
  location: string;
};

const MobileNavItem = ({ href, icon, label, active, onClick }: { 
  href: string; 
  icon: string; 
  label: string; 
  active: boolean;
  onClick: () => void;
}) => (
  <Link href={href}>
    <div
      className={cn(
        "flex items-center px-3 py-3 text-base font-medium rounded-md cursor-pointer touch-target",
        active
          ? "text-white bg-primary-600"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
      onClick={onClick}
    >
      <i className={cn(`ri-${icon} mr-3 text-xl`, active ? "" : "text-gray-400")}></i>
      <span className="mobile-text-adjust">{label}</span>
    </div>
  </Link>
);

export default function MobileNav({ opened, onClose, location }: MobileNavProps) {
  const { logout } = useAuth();
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <Dialog open={opened} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 max-h-[100dvh] inset-0 overflow-hidden pt-safe">
        <div className="flex flex-col h-full bg-white">
          <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b">
            <div className="flex items-center flex-shrink-0">
              <span className="text-xl font-semibold text-primary-600 mobile-text-adjust">Business Platform</span>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 touch-target"
              onClick={onClose}
              aria-label="Close menu"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1 pb-safe">
            <MobileNavItem
              href="/"
              icon="dashboard-line"
              label="Dashboard"
              active={isActive("/")}
              onClick={onClose}
            />
            <MobileNavItem
              href="/financials"
              icon="money-dollar-circle-line"
              label="Financials"
              active={isActive("/financials")}
              onClick={onClose}
            />
            <MobileNavItem
              href="/inventory"
              icon="store-2-line"
              label="Inventory"
              active={isActive("/inventory")}
              onClick={onClose}
            />
            <MobileNavItem
              href="/contracts"
              icon="file-text-line"
              label="Contracts"
              active={isActive("/contracts")}
              onClick={onClose}
            />
            <MobileNavItem
              href="/expenses"
              icon="receipt-line"
              label="Expenses"
              active={isActive("/expenses")}
              onClick={onClose}
            />
            <MobileNavItem
              href="/invoices"
              icon="bill-line"
              label="Invoices"
              active={isActive("/invoices")}
              onClick={onClose}
            />
            <MobileNavItem
              href="/ai-insights"
              icon="line-chart-line"
              label="AI Insights"
              active={isActive("/ai-insights")}
              onClick={onClose}
            />
            <MobileNavItem
              href="/business-assistant"
              icon="robot-line"
              label="Business Assistant"
              active={isActive("/business-assistant")}
              onClick={onClose}
            />
            
            {/* User profile menu items with divider */}
            <div className="border-t border-gray-200 mt-4 pt-4">
              <MobileNavItem
                href="/calendar"
                icon="calendar-line"
                label="Calendar"
                active={isActive("/calendar")}
                onClick={onClose}
              />
              <MobileNavItem
                href="/profile"
                icon="user-line"
                label="Profile"
                active={isActive("/profile")}
                onClick={onClose}
              />
              <div 
                className="flex items-center px-3 py-3 text-base font-medium rounded-md cursor-pointer touch-target text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => {
                  logout();
                  onClose();
                }}
              >
                <i className="ri-logout-box-line mr-3 text-xl text-gray-400"></i>
                <span className="mobile-text-adjust">Logout</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
