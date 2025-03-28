import { useState } from "react";
import { Link } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
        "flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer",
        active
          ? "text-white bg-primary-600"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
      onClick={onClick}
    >
      <i className={cn(`ri-${icon} mr-3 text-lg`, active ? "" : "text-gray-400")}></i>
      {label}
    </div>
  </Link>
);

export default function MobileNav({ opened, onClose, location }: MobileNavProps) {
  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <Dialog open={opened} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 max-h-[100dvh] inset-0 overflow-hidden">
        <div className="flex flex-col h-full bg-white">
          <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b">
            <div className="flex items-center flex-shrink-0">
              <span className="text-xl font-semibold text-primary-600">Business Platform</span>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={onClose}
              aria-label="Close menu"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2 pb-safe">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
