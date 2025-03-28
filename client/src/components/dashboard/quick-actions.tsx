import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

interface ActionItem {
  icon: string;
  label: string;
  href: string;
}

export default function QuickActions() {
  const actions: ActionItem[] = [
    { 
      icon: "file-add-line",
      label: "Create Invoice",
      href: "/invoices"
    },
    { 
      icon: "receipt-line",
      label: "Scan Receipt",
      href: "/expenses"
    },
    { 
      icon: "file-text-line",
      label: "New Contract",
      href: "/contracts"
    },
    { 
      icon: "user-add-line",
      label: "Add Client",
      href: "/financials"
    },
    { 
      icon: "store-2-line",
      label: "Add Inventory",
      href: "/inventory"
    },
    { 
      icon: "line-chart-line",
      label: "Financial Report",
      href: "/financials"
    }
  ];

  return (
    <Card>
      <CardHeader className="px-5 py-4">
        <CardTitle className="text-lg font-medium text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="p-4 bg-gray-50 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                <i className={`${action.icon} text-2xl text-primary-600 mb-2`}></i>
                <span className="text-xs text-gray-500 text-center">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
