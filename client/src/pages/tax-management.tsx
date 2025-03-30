import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, Plus, Filter } from "lucide-react";
import { useAuth } from "@/context/auth-context";

// Types
type TaxItem = {
  id: number;
  userId: number;
  description: string;
  category: string;
  amount: string;
  taxYear: number;
  quarter: number;
  dueDate: string;
  datePaid?: string;
  status: "pending" | "paid" | "overdue";
  notes?: string;
  createdAt: string;
};

export default function TaxManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TaxItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Form state for new tax item
  const [formData, setFormData] = useState({
    description: "",
    category: "income",
    amount: "",
    taxYear: new Date().getFullYear(),
    quarter: 1,
    dueDate: "",
    status: "pending",
    notes: ""
  });

  // Query tax items
  const { data: taxItems, isLoading } = useQuery({
    queryKey: ["/api/tax-items", selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/tax-items/year/${selectedYear}`);
      if (!res.ok) throw new Error("Failed to fetch tax items");
      return res.json();
    }
  });

  // Add tax item mutation
  const addTaxItemMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/tax-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax-items"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Tax item added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add tax item: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update tax item mutation
  const updateTaxItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<TaxItem> }) => {
      const res = await fetch(`/api/tax-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax-items"] });
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      toast({
        title: "Success",
        description: "Tax item updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update tax item: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTaxItemMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    updateTaxItemMutation.mutate({
      id: selectedItem.id,
      data: {
        description: selectedItem.description,
        category: selectedItem.category,
        amount: selectedItem.amount,
        taxYear: selectedItem.taxYear,
        quarter: selectedItem.quarter,
        dueDate: selectedItem.dueDate,
        datePaid: selectedItem.datePaid,
        status: selectedItem.status,
        notes: selectedItem.notes,
      }
    });
  };

  const resetForm = () => {
    setFormData({
      description: "",
      category: "income",
      amount: "",
      taxYear: new Date().getFullYear(),
      quarter: 1,
      dueDate: "",
      status: "pending",
      notes: ""
    });
  };

  const handleEditItem = (item: TaxItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleEditItemChange = (name: string, value: any) => {
    if (!selectedItem) return;
    setSelectedItem({ ...selectedItem, [name]: value });
  };

  // Calculate summary
  const calculateSummary = () => {
    if (!taxItems) return { income: 0, expense: 0, pending: 0, paid: 0 };
    
    return {
      income: taxItems
        .filter((item: TaxItem) => item.category === "income")
        .reduce((sum: number, item: TaxItem) => sum + parseFloat(item.amount), 0),
      expense: taxItems
        .filter((item: TaxItem) => item.category === "expense")
        .reduce((sum: number, item: TaxItem) => sum + parseFloat(item.amount), 0),
      pending: taxItems
        .filter((item: TaxItem) => item.status === "pending")
        .reduce((sum: number, item: TaxItem) => sum + parseFloat(item.amount), 0),
      paid: taxItems
        .filter((item: TaxItem) => item.status === "paid")
        .reduce((sum: number, item: TaxItem) => sum + parseFloat(item.amount), 0),
    };
  };

  const summary = calculateSummary();

  const getStatusClass = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100 px-2 py-1 rounded-full";
      case "pending":
        return "text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full";
      case "overdue":
        return "text-red-600 bg-red-100 px-2 py-1 rounded-full";
      default:
        return "";
    }
  };

  // Get available years for filtering
  const availableYears: number[] = taxItems?.map((item: TaxItem) => item.taxYear) || [new Date().getFullYear()];
  const years = [...new Set(availableYears)].sort((a: number, b: number) => b - a);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tax Management</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tax Item
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Income Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.income.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tax Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.expense.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.pending.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.paid.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tax Items</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year: number) => (
                    <SelectItem key={year.toString()} value={year.toString()}>
                      {year.toString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription>
            Manage your tax items for {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">Loading tax items...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxItems && taxItems.length > 0 ? (
                  taxItems.map((item: TaxItem) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="capitalize">{item.category}</TableCell>
                      <TableCell>${parseFloat(item.amount).toFixed(2)}</TableCell>
                      <TableCell>{item.taxYear}</TableCell>
                      <TableCell>Q{item.quarter}</TableCell>
                      <TableCell>{format(new Date(item.dueDate), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <span className={getStatusClass(item.status)}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditItem(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No tax items found for {selectedYear}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Add Tax Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Tax Item</DialogTitle>
            <DialogDescription>
              Enter the details for the new tax item
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="deduction">Deduction</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="taxYear" className="text-right">
                  Tax Year
                </Label>
                <Input
                  id="taxYear"
                  name="taxYear"
                  type="number"
                  value={formData.taxYear}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quarter" className="text-right">
                  Quarter
                </Label>
                <Select
                  value={formData.quarter.toString()}
                  onValueChange={(value) => handleSelectChange("quarter", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1</SelectItem>
                    <SelectItem value="2">Q2</SelectItem>
                    <SelectItem value="3">Q3</SelectItem>
                    <SelectItem value="4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addTaxItemMutation.isPending}>
                {addTaxItemMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Tax Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Tax Item</DialogTitle>
            <DialogDescription>
              Update the details for this tax item
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="edit-description"
                    value={selectedItem.description}
                    onChange={(e) => handleEditItemChange("description", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={selectedItem.category}
                    onValueChange={(value) => handleEditItemChange("category", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="deduction">Deduction</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={selectedItem.amount}
                    onChange={(e) => handleEditItemChange("amount", e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={selectedItem.status}
                    onValueChange={(value) => handleEditItemChange("status", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-datePaid" className="text-right">
                    Date Paid
                  </Label>
                  <Input
                    id="edit-datePaid"
                    type="date"
                    value={selectedItem.datePaid || ""}
                    onChange={(e) => handleEditItemChange("datePaid", e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-notes" className="text-right">
                    Notes
                  </Label>
                  <Input
                    id="edit-notes"
                    value={selectedItem.notes || ""}
                    onChange={(e) => handleEditItemChange("notes", e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateTaxItemMutation.isPending}>
                  {updateTaxItemMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}