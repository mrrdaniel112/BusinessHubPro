import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@shared/schema";

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'sent':
        return <Badge variant="secondary">Sent</Badge>;
      case 'paid':
        return <Badge variant="success" className="bg-success-100 text-success-800 hover:bg-success-100">Paid</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInvoiceStatusCounts = () => {
    const counts = { 
      draft: 0, 
      sent: 0, 
      paid: 0, 
      overdue: 0,
      total: 0,
      pendingAmount: 0,
      overdueAmount: 0
    };
    
    invoices.forEach(invoice => {
      counts.total++;
      
      if (invoice.status in counts) {
        counts[invoice.status as keyof typeof counts]++;
      }
      
      // Calculate pending and overdue amounts
      const amount = typeof invoice.amount === 'string' ? parseFloat(invoice.amount) : invoice.amount;
      
      if (invoice.status === 'sent') {
        counts.pendingAmount += amount;
      } else if (invoice.status === 'overdue') {
        counts.overdueAmount += amount;
      }
    });
    
    return counts;
  };

  const statusCounts = getInvoiceStatusCounts();

  return (
    <div>
      {/* Page header */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-semibold text-gray-900">Invoice Management</h1>
          <Button>
            <i className="ri-add-line mr-1"></i> Create Invoice
          </Button>
        </div>
      </div>

      {/* Invoice stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-primary-50">
                  <i className="ri-file-list-3-line text-xl text-primary-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Total Invoices</h3>
              <p className="text-2xl font-bold">{isLoading ? "..." : statusCounts.total}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-warning-50">
                  <i className="ri-time-line text-xl text-warning-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Pending</h3>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold">{isLoading ? "..." : statusCounts.sent}</p>
                <p className="ml-2 text-sm text-gray-500">
                  {isLoading ? "..." : formatCurrency(statusCounts.pendingAmount)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-danger-50">
                  <i className="ri-alarm-warning-line text-xl text-danger-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Overdue</h3>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold">{isLoading ? "..." : statusCounts.overdue}</p>
                <p className="ml-2 text-sm text-gray-500">
                  {isLoading ? "..." : formatCurrency(statusCounts.overdueAmount)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-success-50">
                  <i className="ri-check-double-line text-xl text-success-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Paid</h3>
              <p className="text-2xl font-bold">{isLoading ? "..." : statusCounts.paid}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <div className="flex flex-wrap gap-3">
          <Button>
            <i className="ri-add-line mr-1"></i> Create Invoice
          </Button>
          <Button variant="outline">
            <i className="ri-send-plane-line mr-1"></i> Send Reminders
          </Button>
          <Button variant="outline">
            <i className="ri-download-line mr-1"></i> Export
          </Button>
        </div>
      </div>

      {/* Invoices list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8 mb-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 items-start sm:items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Input
                type="search"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="w-full h-20 bg-gray-100 animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : filteredInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-gray-500">Invoice #</th>
                      <th className="pb-2 font-medium text-gray-500">Client</th>
                      <th className="pb-2 font-medium text-gray-500">Issue Date</th>
                      <th className="pb-2 font-medium text-gray-500">Due Date</th>
                      <th className="pb-2 font-medium text-gray-500 text-right">Amount</th>
                      <th className="pb-2 font-medium text-gray-500">Status</th>
                      <th className="pb-2 font-medium text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b">
                        <td className="py-3 font-medium">{invoice.invoiceNumber}</td>
                        <td className="py-3">{invoice.clientName}</td>
                        <td className="py-3">{formatDate(invoice.issueDate)}</td>
                        <td className="py-3">{formatDate(invoice.dueDate)}</td>
                        <td className="py-3 text-right font-medium">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="py-3">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm">
                            <i className="ri-more-2-fill"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="ri-file-list-3-line text-4xl text-gray-300"></i>
                <p className="mt-2 text-gray-500">No invoices found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
