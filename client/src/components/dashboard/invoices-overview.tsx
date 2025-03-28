import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export type Invoice = {
  id: number;
  invoiceNumber: string;
  clientName: string;
  amount: string | number;
  status: InvoiceStatus;
};

export type InvoiceStats = {
  pending: number;
  pendingAmount: number;
  overdue: number;
  overdueAmount: number;
  paid: number;
  paidAmount: number;
};

interface InvoicesOverviewProps {
  invoices: Invoice[];
  stats: InvoiceStats;
  isLoading?: boolean;
}

const formatCurrency = (value: string | number) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
};

const getStatusColor = (status: InvoiceStatus) => {
  switch (status) {
    case 'paid':
      return "bg-success-100 text-success-800";
    case 'pending':
      return "bg-warning-100 text-warning-800";
    case 'overdue':
      return "bg-danger-100 text-danger-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusDisplay = (status: InvoiceStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const InvoiceItem = ({ invoice }: { invoice: Invoice }) => (
  <li className="flex justify-between items-center p-3 bg-gray-50 rounded">
    <div>
      <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
      <p className="text-xs text-gray-500">{invoice.clientName} • {formatCurrency(invoice.amount)}</p>
    </div>
    <div className="flex items-center">
      <span className={cn("px-2 py-1 text-xs rounded", getStatusColor(invoice.status))}>
        {getStatusDisplay(invoice.status)}
      </span>
      <button className="ml-2 text-gray-400 hover:text-gray-500">
        <i className="ri-more-2-fill"></i>
      </button>
    </div>
  </li>
);

const InvoiceSkeleton = () => (
  <li className="flex justify-between items-center p-3 bg-gray-50 rounded">
    <div>
      <div className="h-4 bg-gray-200 animate-pulse w-24 mb-2 rounded"></div>
      <div className="h-3 bg-gray-200 animate-pulse w-36 rounded"></div>
    </div>
    <div className="flex items-center">
      <div className="h-6 bg-gray-200 animate-pulse w-16 rounded"></div>
      <div className="ml-2 h-6 w-6 bg-gray-200 animate-pulse rounded"></div>
    </div>
  </li>
);

export default function InvoicesOverview({ invoices, stats, isLoading = false }: InvoicesOverviewProps) {
  const [activeTab, setActiveTab] = useState<'invoices' | 'contracts'>('invoices');

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-gray-200 flex items-center">
        <div className="flex-grow">
          <CardTitle className="text-lg font-medium leading-6 text-gray-900">Overview</CardTitle>
        </div>
        <div className="ml-auto flex">
          <button
            type="button"
            className={cn(
              "text-sm font-medium px-3 py-1 border-b-2",
              activeTab === 'invoices'
                ? "text-gray-600 border-primary-600"
                : "text-gray-400 border-transparent hover:text-gray-600"
            )}
            onClick={() => setActiveTab('invoices')}
          >
            Invoices
          </button>
          <button
            type="button"
            className={cn(
              "text-sm font-medium px-3 py-1 border-b-2",
              activeTab === 'contracts'
                ? "text-gray-600 border-primary-600"
                : "text-gray-400 border-transparent hover:text-gray-600"
            )}
            onClick={() => setActiveTab('contracts')}
          >
            Contracts
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Invoice Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Pending</p>
            <div className="flex items-baseline">
              {isLoading ? (
                <>
                  <div className="h-8 bg-gray-200 animate-pulse w-6 rounded mr-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse w-16 rounded"></div>
                </>
              ) : (
                <>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                  <p className="text-sm ml-2 text-gray-500">{formatCurrency(stats.pendingAmount)}</p>
                </>
              )}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Overdue</p>
            <div className="flex items-baseline">
              {isLoading ? (
                <>
                  <div className="h-8 bg-gray-200 animate-pulse w-6 rounded mr-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse w-16 rounded"></div>
                </>
              ) : (
                <>
                  <p className="text-2xl font-semibold text-danger-600">{stats.overdue}</p>
                  <p className="text-sm ml-2 text-gray-500">{formatCurrency(stats.overdueAmount)}</p>
                </>
              )}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Paid</p>
            <div className="flex items-baseline">
              {isLoading ? (
                <>
                  <div className="h-8 bg-gray-200 animate-pulse w-6 rounded mr-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse w-16 rounded"></div>
                </>
              ) : (
                <>
                  <p className="text-2xl font-semibold text-success-600">{stats.paid}</p>
                  <p className="text-sm ml-2 text-gray-500">{formatCurrency(stats.paidAmount)}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Actions */}
        <div className="flex space-x-3">
          <Button className="flex-1">
            <i className="ri-add-line mr-1"></i> Create Invoice
          </Button>
          <Button variant="outline" className="flex-1">
            <i className="ri-send-plane-line mr-1"></i> Send Reminders
          </Button>
        </div>

        {/* Recent Invoices */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Invoices</h4>
          <ul className="space-y-2">
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <InvoiceSkeleton key={index} />
              ))
            ) : invoices.length > 0 ? (
              invoices.map((invoice) => (
                <InvoiceItem key={invoice.id} invoice={invoice} />
              ))
            ) : (
              <li className="p-3 bg-gray-50 rounded text-center text-gray-500">
                No invoices found
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
