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
                <img
                  className="h-8 w-auto"
                  src={businessHubProLogo}
                  alt="BusinessHubPro"
                />
              </div>
              <div className="mt-5 h-0 flex-1 overflow-y-auto">
                <nav className="space-y-1 px-2">
                  {navigation.map((item) => {
                    const Icon = getIcon(item.icon);
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                          isActive
                            ? "bg-primary-50 text-primary-600"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                        onClick={onClose}
                      >
                        <Icon
                          className={cn(
                            "mr-4 h-6 w-6 flex-shrink-0",
                            isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-500"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
