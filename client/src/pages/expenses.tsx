import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Transaction } from "@shared/schema";

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("expenses");

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: receipts = [], isLoading: receiptsLoading } = useQuery<Receipt[]>({
    queryKey: ['/api/receipts'],
  });

  // Filter only expense transactions
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReceipts = receipts.filter(receipt => 
    receipt.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (receipt.notes && receipt.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  // Calculate expense metrics
  const calculateTotalExpenses = () => {
    return expenses.reduce((sum, expense) => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      return sum + amount;
    }, 0);
  };

  const calculateExpensesByCategory = () => {
    const categories: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      if (categories[expense.category]) {
        categories[expense.category] += amount;
      } else {
        categories[expense.category] = amount;
      }
    });
    
    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const topCategories = calculateExpensesByCategory().slice(0, 3);
  const totalExpenses = calculateTotalExpenses();

  return (
    <div>
      {/* Page header */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-semibold text-gray-900">Expense Management</h1>
          <div className="flex space-x-2">
            <Button>
              <i className="ri-add-line mr-1"></i> Add Expense
            </Button>
            <Button variant="outline">
              <i className="ri-camera-line mr-1"></i> Scan Receipt
            </Button>
          </div>
        </div>
      </div>

      {/* Expense stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-danger-50">
                  <i className="ri-shopping-bag-line text-xl text-danger-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Total Expenses</h3>
              <p className="text-2xl font-bold">
                {transactionsLoading ? "..." : formatCurrency(totalExpenses)}
              </p>
            </CardContent>
          </Card>
          
          {topCategories.map((category, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 rounded-md bg-primary-50">
                    <i className="ri-price-tag-3-line text-xl text-primary-600"></i>
                  </div>
                </div>
                <h3 className="text-sm text-gray-500">Top: {category.category}</h3>
                <p className="text-2xl font-bold">{formatCurrency(category.amount)}</p>
              </CardContent>
            </Card>
          ))}
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-success-50">
                  <i className="ri-receipt-line text-xl text-success-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Receipts Saved</h3>
              <p className="text-2xl font-bold">{receiptsLoading ? "..." : receipts.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Expenses and Receipts tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8 mb-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 items-start sm:items-center justify-between">
            <CardTitle>Expense Tracking</CardTitle>
            <Input
              type="search"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="expenses" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="receipts">Receipts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="expenses">
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="w-full h-16 bg-gray-100 animate-pulse rounded-md"></div>
                    ))}
                  </div>
                ) : filteredExpenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 font-medium text-gray-500">Description</th>
                          <th className="pb-2 font-medium text-gray-500">Category</th>
                          <th className="pb-2 font-medium text-gray-500">Date</th>
                          <th className="pb-2 font-medium text-gray-500 text-right">Amount</th>
                          <th className="pb-2 font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenses.map((expense) => (
                          <tr key={expense.id} className="border-b">
                            <td className="py-3">{expense.description}</td>
                            <td className="py-3">
                              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                {expense.category}
                              </span>
                            </td>
                            <td className="py-3">{formatDate(expense.date)}</td>
                            <td className="py-3 text-right font-medium text-danger-600">
                              {formatCurrency(expense.amount)}
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
                    <p className="mt-2 text-gray-500">No expenses found</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="receipts">
                {receiptsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="w-full h-48 bg-gray-100 animate-pulse rounded-md"></div>
                    ))}
                  </div>
                ) : filteredReceipts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReceipts.map((receipt) => (
                      <Card key={receipt.id}>
                        <CardContent className="p-0">
                          <div className="p-4 border-b">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{receipt.vendor}</h3>
                                <p className="text-sm text-gray-500">{formatDate(receipt.date)}</p>
                              </div>
                              <span className="font-medium text-danger-600">
                                {formatCurrency(receipt.amount)}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <i className="ri-price-tag-3-line mr-1"></i>
                              <span>{receipt.category}</span>
                            </div>
                            {receipt.notes && (
                              <p className="text-sm text-gray-600 mt-2">{receipt.notes}</p>
                            )}
                            {receipt.imageData && (
                              <div className="mt-3 border rounded overflow-hidden">
                                <img 
                                  src={receipt.imageData.startsWith('data:') 
                                    ? receipt.imageData 
                                    : `data:image/jpeg;base64,${receipt.imageData}`} 
                                  alt="Receipt" 
                                  className="w-full h-32 object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="ri-receipt-line text-4xl text-gray-300"></i>
                    <p className="mt-2 text-gray-500">No receipts found</p>
                    <Button variant="outline" className="mt-4">
                      <i className="ri-camera-line mr-1"></i> Scan a Receipt
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
