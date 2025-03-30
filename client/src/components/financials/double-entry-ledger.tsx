import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Download, ArrowUpDown, FileText, DollarSign } from "lucide-react";

interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  referenceNumber?: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  status: "reconciled" | "pending" | "unreconciled";
}

interface AccountBalance {
  accountName: string;
  accountType: "asset" | "liability" | "equity" | "revenue" | "expense";
  balance: number;
  normalBalance: "debit" | "credit";
}

// Sample chart of accounts
const chartOfAccounts: AccountBalance[] = [
  { accountName: "Cash", accountType: "asset", balance: 25000, normalBalance: "debit" },
  { accountName: "Accounts Receivable", accountType: "asset", balance: 12500, normalBalance: "debit" },
  { accountName: "Office Equipment", accountType: "asset", balance: 8000, normalBalance: "debit" },
  { accountName: "Accumulated Depreciation", accountType: "asset", balance: -2000, normalBalance: "credit" },
  { accountName: "Accounts Payable", accountType: "liability", balance: 5000, normalBalance: "credit" },
  { accountName: "Loans Payable", accountType: "liability", balance: 15000, normalBalance: "credit" },
  { accountName: "Owner's Equity", accountType: "equity", balance: 20000, normalBalance: "credit" },
  { accountName: "Revenue", accountType: "revenue", balance: 35000, normalBalance: "credit" },
  { accountName: "Rent Expense", accountType: "expense", balance: 2500, normalBalance: "debit" },
  { accountName: "Utilities Expense", accountType: "expense", balance: 1000, normalBalance: "debit" },
  { accountName: "Salaries Expense", accountType: "expense", balance: 28000, normalBalance: "debit" },
];

// Sample general ledger entries
const sampleLedgerEntries: LedgerEntry[] = [
  {
    id: "1",
    date: "2025-03-25",
    description: "Client payment received for invoice #1045",
    referenceNumber: "PMT-1045",
    debitAccount: "Cash",
    creditAccount: "Accounts Receivable",
    amount: 2500,
    status: "reconciled"
  },
  {
    id: "2",
    date: "2025-03-24",
    description: "Monthly rent payment",
    referenceNumber: "EXP-103",
    debitAccount: "Rent Expense",
    creditAccount: "Cash",
    amount: 1500,
    status: "reconciled"
  },
  {
    id: "3",
    date: "2025-03-22",
    description: "Office supplies purchase",
    referenceNumber: "PO-289",
    debitAccount: "Office Supplies Expense",
    creditAccount: "Accounts Payable",
    amount: 350,
    status: "pending"
  },
  {
    id: "4",
    date: "2025-03-20",
    description: "Client invoice issued #1046",
    referenceNumber: "INV-1046",
    debitAccount: "Accounts Receivable",
    creditAccount: "Revenue",
    amount: 3500,
    status: "unreconciled"
  },
  {
    id: "5",
    date: "2025-03-18",
    description: "Employee salary payment",
    referenceNumber: "PAY-3045",
    debitAccount: "Salaries Expense",
    creditAccount: "Cash",
    amount: 4500,
    status: "reconciled"
  },
  {
    id: "6",
    date: "2025-03-15",
    description: "Utility bill payment",
    referenceNumber: "UTIL-128",
    debitAccount: "Utilities Expense",
    creditAccount: "Cash",
    amount: 250,
    status: "reconciled"
  },
  {
    id: "7",
    date: "2025-03-10",
    description: "Equipment purchase",
    referenceNumber: "CAP-056",
    debitAccount: "Office Equipment",
    creditAccount: "Cash",
    amount: 1800,
    status: "reconciled"
  }
];

export const DoubleEntryLedger = () => {
  const [activeTab, setActiveTab] = useState<string>("transactions");
  
  // In a real application, we would fetch these from the API
  const { data: ledgerEntries = sampleLedgerEntries, isLoading: isLoadingEntries } = useQuery<LedgerEntry[]>({
    queryKey: ['/api/ledger-entries'],
    enabled: false, // Disabled because we're using sample data
  });
  
  const { data: accounts = chartOfAccounts, isLoading: isLoadingAccounts } = useQuery<AccountBalance[]>({
    queryKey: ['/api/chart-of-accounts'],
    enabled: false, // Disabled because we're using sample data
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reconciled": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "unreconciled": return "bg-slate-100 text-slate-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "asset": return "bg-blue-100 text-blue-800";
      case "liability": return "bg-purple-100 text-purple-800";
      case "equity": return "bg-indigo-100 text-indigo-800";
      case "revenue": return "bg-green-100 text-green-800";
      case "expense": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Double-Entry Accounting</h2>
          <p className="text-muted-foreground">Manage your transactions with professional double-entry accounting.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">
            <FileText className="h-4 w-4 mr-2" />
            General Ledger
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <DollarSign className="h-4 w-4 mr-2" />
            Chart of Accounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all double-entry transactions in your general ledger.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[300px]">Description</TableHead>
                      <TableHead className="w-[130px]">Reference #</TableHead>
                      <TableHead>Debit Account</TableHead>
                      <TableHead>Credit Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerEntries.map((entry: LedgerEntry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.date}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.referenceNumber || "-"}</TableCell>
                        <TableCell>{entry.debitAccount}</TableCell>
                        <TableCell>{entry.creditAccount}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.amount)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={getStatusColor(entry.status)}>
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>All accounts in your accounting system with current balances.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Normal Balance</TableHead>
                      <TableHead className="text-right">Current Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account: AccountBalance, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{account.accountName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getAccountTypeColor(account.accountType)}>
                            {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{account.normalBalance}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(account.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoubleEntryLedger;