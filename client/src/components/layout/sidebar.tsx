import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { useAuth } from "@/context/auth-context";

type NavItemProps = {
  href: string;
  icon: string;
  label: string;
  active: boolean;
};

const getIcon = (iconName: string) => {
  const IconMap: Record<string, React.ElementType> = {
    "dashboard-line": Icons.Home,
    "money-dollar-circle-line": Icons.DollarSign,
    "store-2-line": Icons.Package,
    "file-text-line": Icons.FileText,
    "receipt-line": Icons.Receipt,
    "bill-line": Icons.FileCheck,
    "line-chart-line": Icons.BarChart,
    "robot-line": Icons.Bot,
    "logout-box-line": Icons.LogOut,
    "calendar-line": Icons.Calendar,
    "user-line": Icons.User,
    "shield-line": Icons.Shield,
    "tax-line": Icons.Receipt,
    "payroll-line": Icons.Users,
    "time-line": Icons.Clock,
    "bank-line": Icons.Building,
    "budget-line": Icons.PiggyBank,
    "inventory-cost-line": Icons.BarChart3,
  };
  
  const Icon = IconMap[iconName] || Icons.CircleDot;
  return Icon;
};

const NavItem = ({ href, icon, label, active, onClick }: NavItemProps & { onClick?: () => void }) => {
  const Icon = getIcon(icon);
  
  if (onClick) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex items-center px-2 py-2 text-sm font-medium rounded-md group cursor-pointer",
          active
            ? "text-white bg-primary-600"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <Icon className={cn("mr-3 h-5 w-5", active ? "text-white" : "text-gray-400")} />
        {label}
      </div>
    );
  }
  
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center px-2 py-2 text-sm font-medium rounded-md group cursor-pointer",
          active
            ? "text-white bg-primary-600"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <Icon className={cn("mr-3 h-5 w-5", active ? "text-white" : "text-gray-400")} />
        {label}
      </div>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };
  
  // Calculate days left in trial
  const getDaysLeft = () => {
    if (!user?.trialEndsAt) return 0;
    
    const today = new Date();
    const trialEnd = new Date(user.trialEndsAt);
    const diffTime = trialEnd.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };
  
  const daysLeft = getDaysLeft();
  const trialProgress = daysLeft > 0 ? ((14 - daysLeft) / 14) * 100 : 100;

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <span className="text-xl font-semibold text-primary-600">Business Platform</span>
          </div>
          
          {/* User profile section at top */}
          <div className="px-4 mb-5">
            <div className="flex items-center">
              <img 
                className="h-10 w-10 rounded-full" 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Profile" 
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name || "Premium User"}</p>
                <p className="text-xs text-gray-500">{user?.subscriptionStatus === 'active' ? 'Premium Subscription' : 'Trial Account'}</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-2 space-y-1 bg-white">
            {/* Main Navigation */}
            <NavItem
              href="/"
              icon="dashboard-line"
              label="Dashboard"
              active={isActive("/")}
            />
            
            {/* Financial Management */}
            <div className="py-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Financial Management
              </h3>
              <div className="space-y-1 mt-1">
                <NavItem
                  href="/financials"
                  icon="money-dollar-circle-line"
                  label="Financials"
                  active={isActive("/financials")}
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
                  href="/tax-management"
                  icon="tax-line"
                  label="Tax Management"
                  active={isActive("/tax-management")}
                />
                <NavItem
                  href="/bank-reconciliation"
                  icon="bank-line"
                  label="Bank Reconciliation"
                  active={isActive("/bank-reconciliation")}
                />
                <NavItem
                  href="/budget-planning"
                  icon="budget-line"
                  label="Budget Planning"
                  active={isActive("/budget-planning")}
                />
              </div>
            </div>
            
            {/* Inventory & Assets */}
            <div className="py-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Inventory & Assets
              </h3>
              <div className="space-y-1 mt-1">
                <NavItem
                  href="/inventory"
                  icon="store-2-line"
                  label="Inventory"
                  active={isActive("/inventory")}
                />
                <NavItem
                  href="/inventory-cost-analysis"
                  icon="inventory-cost-line"
                  label="Cost Analysis"
                  active={isActive("/inventory-cost-analysis")}
                />
              </div>
            </div>
            
            {/* HR & Projects */}
            <div className="py-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                HR & Projects
              </h3>
              <div className="space-y-1 mt-1">
                <NavItem
                  href="/contracts"
                  icon="file-text-line"
                  label="Contracts"
                  active={isActive("/contracts")}
                />
                <NavItem
                  href="/payroll-processing"
                  icon="payroll-line"
                  label="Payroll"
                  active={isActive("/payroll-processing")}
                />
                <NavItem
                  href="/time-tracking"
                  icon="time-line"
                  label="Time Tracking"
                  active={isActive("/time-tracking")}
                />
              </div>
            </div>
            
            {/* AI Tools */}
            <div className="py-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                AI Tools
              </h3>
              <div className="space-y-1 mt-1">
                <NavItem
                  href="/ai-insights"
                  icon="line-chart-line"
                  label="AI Insights"
                  active={isActive("/ai-insights")}
                />
                <NavItem
                  href="/business-assistant"
                  icon="robot-line"
                  label="Business Assistant"
                  active={isActive("/business-assistant")}
                />
              </div>
            </div>
            
            {user?.role === 'admin' && (
              <NavItem
                href="/admin"
                icon="shield-line"
                label="Admin Dashboard"
                active={isActive("/admin")}
              />
            )}
            
            <div className="pt-4 mt-4 border-t border-gray-200">
              <NavItem
                href="/calendar"
                icon="calendar-line"
                label="Calendar"
                active={isActive("/calendar")}
              />
              <NavItem
                href="/profile"
                icon="user-line"
                label="Profile"
                active={isActive("/profile")}
              />
              <NavItem
                href="#"
                icon="logout-box-line"
                label="Logout"
                active={false}
                onClick={logout}
              />
            </div>
          </nav>
          
          <div className="px-2 mt-6">
            <div className="p-4 rounded-lg bg-primary-50">
              <h3 className="text-sm font-medium text-primary-800">Your Trial</h3>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{daysLeft} days left</span>
                  <span className="text-xs font-medium text-primary-600">{Math.round(trialProgress)}%</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${trialProgress}%` }}></div>
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
