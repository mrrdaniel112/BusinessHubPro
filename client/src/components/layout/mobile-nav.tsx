import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import businessHubProLogo from "@assets/2 business hub pro 2logo .png";

type MobileNavProps = {
  opened: boolean;
  onClose: () => void;
  location: string;
};

const navigation = [
  { name: "Dashboard", href: "/", icon: "dashboard-line" },
  { name: "Financials", href: "/financials", icon: "money-dollar-circle-line" },
  { name: "Inventory", href: "/inventory", icon: "store-2-line" },
  { name: "Contracts", href: "/contracts", icon: "file-text-line" },
  { name: "Expenses", href: "/expenses", icon: "receipt-line" },
  { name: "Invoices", href: "/invoices", icon: "bill-line" },
  { name: "Tax Management", href: "/tax-management", icon: "tax-line" },
  { name: "Payroll", href: "/payroll-processing", icon: "payroll-line" },
  { name: "Time Tracking", href: "/time-tracking", icon: "time-line" },
  { name: "Bank Reconciliation", href: "/bank-reconciliation", icon: "bank-line" },
  { name: "Budget Planning", href: "/budget-planning", icon: "budget-line" },
  { name: "Client Management", href: "/client-management", icon: "client-line" },
  { name: "Employee Management", href: "/employee-management", icon: "employee-line" },
];

export default function MobileNav({ opened, onClose, location }: MobileNavProps) {
  const getIcon = (iconName: string) => {
    const IconMap: Record<string, React.ElementType> = {
      "dashboard-line": Icons.Home,
      "money-dollar-circle-line": Icons.DollarSign,
      "store-2-line": Icons.Package,
      "file-text-line": Icons.FileText,
      "receipt-line": Icons.Receipt,
      "bill-line": Icons.FileCheck,
      "tax-line": Icons.Receipt,
      "payroll-line": Icons.Users,
      "time-line": Icons.Clock,
      "bank-line": Icons.Building,
      "budget-line": Icons.PiggyBank,
      "client-line": Icons.Users,
      "employee-line": Icons.UserRound,
    };
    return IconMap[iconName] || Icons.CircleDot;
  };

  return (
    <Transition.Root show={opened} as={Fragment}>
      <Dialog as="div" className="relative z-50 md:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={onClose}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div className="flex flex-shrink-0 items-center px-4">
                <div className="h-14 w-auto bg-white rounded-md shadow-md p-1 mb-2 flex items-center justify-center">
                  <img
                    className="h-10 w-auto"
                    src={businessHubProLogo}
                    alt="BusinessHubPro"
                  />
                </div>
              </div>
              <div className="mt-2 h-0 flex-1 overflow-y-auto">
                <div className="px-3 mb-4">
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Icons.Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="search"
                      id="mobile-search"
                      className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500"
                      placeholder="Search..."
                    />
                  </div>
                </div>
                
                <div className="px-2 mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                    Main Menu
                  </h3>
                </div>
                
                <nav className="space-y-1 px-2 mb-6">
                  {navigation.slice(0, 6).map((item) => {
                    const Icon = getIcon(item.icon);
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex items-center px-3 py-2.5 text-base font-medium rounded-md",
                          isActive
                            ? "bg-primary-50 text-primary-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                        onClick={onClose}
                      >
                        <Icon
                          className={cn(
                            "mr-4 h-5 w-5 flex-shrink-0",
                            isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-500"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                
                <div className="px-2 mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                    Business Management
                  </h3>
                </div>
                
                <nav className="space-y-1 px-2 mb-6">
                  {navigation.slice(6).map((item) => {
                    const Icon = getIcon(item.icon);
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex items-center px-3 py-2.5 text-base font-medium rounded-md",
                          isActive
                            ? "bg-primary-50 text-primary-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                        onClick={onClose}
                      >
                        <Icon
                          className={cn(
                            "mr-4 h-5 w-5 flex-shrink-0",
                            isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-500"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                
                <div className="px-4 py-3 mt-auto">
                  <div className="bg-primary-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-primary-700 mb-2">Need help?</h4>
                    <p className="text-xs text-primary-600 mb-2">
                      Have questions or need assistance with your business operations?
                    </p>
                    <a 
                      href="/business-assistant" 
                      className="text-xs font-medium text-primary-700 flex items-center"
                      onClick={onClose}
                    >
                      <Icons.HelpCircle className="h-3.5 w-3.5 mr-1" />
                      Business Assistant
                      <Icons.ChevronRight className="h-3.5 w-3.5 ml-auto" />
                    </a>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
