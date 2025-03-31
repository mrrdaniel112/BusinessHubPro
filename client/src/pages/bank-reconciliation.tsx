import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Check,
  ArrowUpDown,
  Plus,
  Upload,
  Download,
  RefreshCw,
  Link as LinkIcon,
  Search,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  reconciled: boolean;
}

export default function BankReconciliation() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("accounts");
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankBalance, setBankBalance] = useState<string>('');
  const [bookBalance, setBookBalance] = useState<string>('');

  useEffect(() => {
    // Fetch transactions from API
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/bank-transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleReconcile = async (transactionId: number) => {
    try {
      const response = await fetch(`/api/bank-transactions/${transactionId}/reconcile`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchTransactions(); // Refresh transactions
      }
    } catch (error) {
      console.error('Error reconciling transaction:', error);
    }
  };

  const calculateDifference = () => {
    const bankNum = parseFloat(bankBalance) || 0;
    const bookNum = parseFloat(bookBalance) || 0;
    return (bankNum - bookNum).toFixed(2);
  };

  // Bank accounts data (unchanged from original)
  const { data: bankAccounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["/api/bank-accounts"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/bank-accounts");
        if (!res.ok) throw new Error("Failed to fetch bank accounts");
        return res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load bank accounts. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
  });


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h2>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$24,567.89</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  -3 since yesterday
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reconciled</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground">
                  +4% from last week
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Bank Accounts</CardTitle>
              <CardDescription>
                Manage and reconcile your connected bank accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAccounts ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : bankAccounts?.length > 0 ? (
                <div className="space-y-4">
                  {/* Bank account cards would go here */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Business Checking</h3>
                        <p className="text-sm text-muted-foreground">**** 1234</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$15,342.67</p>
                        <p className="text-sm text-green-600">Reconciled</p>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Savings Account</h3>
                        <p className="text-sm text-muted-foreground">**** 5678</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$9,225.22</p>
                        <p className="text-sm text-yellow-600">2 Pending Transactions</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <h3 className="mb-2 text-lg font-medium">No Bank Accounts Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your bank accounts to start reconciling transactions.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Bank Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>View and reconcile recent bank transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {transaction.reconciled ? 'Reconciled' : 'Pending'}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleReconcile(transaction.id)}
                          disabled={transaction.reconciled}
                          variant="outline"
                          size="sm"
                        >
                          Reconcile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reconciliation</CardTitle>
              <CardDescription>Match and reconcile your bank transactions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label>Bank Statement Balance</label>
                  <Input
                    type="number"
                    value={bankBalance}
                    onChange={(e) => setBankBalance(e.target.value)}
                    placeholder="Enter bank balance"
                  />
                </div>
                <div className="space-y-2">
                  <label>Book Balance</label>
                  <Input
                    type="number"
                    value={bookBalance}
                    onChange={(e) => setBookBalance(e.target.value)}
                    placeholder="Enter book balance"
                  />
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-medium">Difference</h3>
                <p className="text-2xl font-bold">${calculateDifference()}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}