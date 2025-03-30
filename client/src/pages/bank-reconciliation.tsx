import { useState } from "react";
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
  ShieldCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function BankReconciliation() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("accounts");
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isImportTransactionsOpen, setIsImportTransactionsOpen] = useState(false);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<number | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<'direct' | 'import'>('direct');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  
  // Bank accounts data
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
  
  // Bank transactions data
  const { data: bankTransactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/bank-transactions"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/bank-transactions");
        if (!res.ok) throw new Error("Failed to fetch bank transactions");
        return res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load bank transactions. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
  });
  
  // Add bank account mutation
  const addBankAccountMutation = useMutation({
    mutationFn: async (bankAccount: any) => {
      const res = await apiRequest("POST", "/api/bank-accounts", bankAccount);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bank account added successfully.",
      });
      setIsAddBankModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add bank account. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Import transactions mutation
  const importTransactionsMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/bank-transactions/import", {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error("Failed to import transactions");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `${data.count} transactions imported successfully.`,
      });
      setIsImportTransactionsOpen(false);
      setCsvFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/bank-transactions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to import transactions. Please check your file format and try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handlers
  const handleAddBankAccount = (data: any) => {
    addBankAccountMutation.mutate(data);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };
  
  const handleImportTransactions = () => {
    if (!csvFile || !selectedBankAccountId) {
      toast({
        title: "Error",
        description: "Please select a bank account and a CSV file.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("bankAccountId", selectedBankAccountId.toString());
    
    importTransactionsMutation.mutate(formData);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Bank Account
        </Button>
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
              <CardDescription>
                View and reconcile recent bank transactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <h3 className="mb-2 text-lg font-medium">Transactions Feature Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're currently working on implementing the transactions view.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reconciliation</CardTitle>
              <CardDescription>
                Match and reconcile your bank transactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <h3 className="mb-2 text-lg font-medium">Reconciliation Feature Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're currently working on implementing the reconciliation feature.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}