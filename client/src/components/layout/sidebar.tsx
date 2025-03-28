import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

type NavItemProps = {
  href: string;
  icon: string;
  label: string;
  active: boolean;
};

const NavItem = ({ href, icon, label, active }: NavItemProps) => (
  <Link href={href}>
    <div
      className={cn(
        "flex items-center px-2 py-2 text-sm font-medium rounded-md group cursor-pointer",
        active
          ? "text-white bg-primary-600"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <i className={cn(`ri-${icon} mr-3 text-lg`, active ? "" : "text-gray-400")}></i>
      {label}
    </div>
  </Link>
);

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <span className="text-xl font-semibold text-primary-600">Business Platform</span>
          </div>
          <nav className="flex-1 px-2 space-y-1 bg-white">
            <NavItem
              href="/"
              icon="dashboard-line"
              label="Dashboard"
              active={isActive("/")}
            />
            <NavItem
              href="/financials"
              icon="money-dollar-circle-line"
              label="Financials"
              active={isActive("/financials")}
            />
            <NavItem
              href="/inventory"
              icon="store-2-line"
              label="Inventory"
              active={isActive("/inventory")}
            />
            <NavItem
              href="/contracts"
              icon="file-text-line"
              label="Contracts"
              active={isActive("/contracts")}
            />
            <NavItem
              href="/expenses"
              icon="receipt-line"
              label="Expenses"
              active={isActive("/expenses")}
            />
            <NavItem
              href="/invoices"
              icon="bill-line"
              label="Invoices"
              active={isActive("/invoices")}
            />
            <NavItem
              href="/ai-insights"
              icon="line-chart-line"
              label="AI Insights"
              active={isActive("/ai-insights")}
            />
          </nav>
          <div className="px-2 mt-6">
            <div className="p-4 rounded-lg bg-primary-50">
              <h3 className="text-sm font-medium text-primary-800">Your Trial</h3>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">10 days left</span>
                  <span className="text-xs font-medium text-primary-600">71%</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '71%' }}></div>
                </div>
                <button
                  onClick={() => {}}
                  className="mt-3 block w-full px-4 py-2 text-sm font-medium text-center text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
