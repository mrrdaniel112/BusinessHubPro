import * as React from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Invoice } from "@shared/schema";
import { ParseInvoiceItemsDialog } from "./parse-invoice-items-dialog";
import { ParsedInvoiceItem } from "../ai/puter-invoice-parser";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface EnhancedInvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceToEdit?: Invoice;
}

export function EnhancedInvoiceForm({ open, onOpenChange, invoiceToEdit }: EnhancedInvoiceFormProps) {
  const { toast } = useToast();
  const [issueDateOpen, setIssueDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [includeTax, setIncludeTax] = useState(false);
  const [taxRate, setTaxRate] = useState(10); // Default tax rate 10%
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState<InvoiceItem>({
    id: Math.random().toString(36).substring(2, 9),
    description: "",
    quantity: 1,
    price: 1500 // Set default price to $1,500 (more reasonable default)
  });
  const [notesType, setNotesType] = useState('manual'); // 'manual' or 'ai'
  const [projectDescription, setProjectDescription] = useState("");
  const [sendOptions, setSendOptions] = useState({
    sendEmail: false,
    emailAddress: ""
  });
  const [isParseDialogOpen, setIsParseDialogOpen] = useState(false); // State for parse dialog
  
  const isEditing = !!invoiceToEdit;
  
  // Initial form state
  const [formState, setFormState] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    clientName: "",
    amount: "0.00",
    status: "draft",
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    notes: "",
    items: "[]"
  });
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (isEditing && invoiceToEdit) {
        // Parse the items from the stored JSON
        const parsedItems = JSON.parse(invoiceToEdit.items || "[]");
        setItems(parsedItems);
        
        // Set form state from existing invoice
        setFormState({
          invoiceNumber: invoiceToEdit.invoiceNumber,
          clientName: invoiceToEdit.clientName,
          amount: String(invoiceToEdit.amount),
          status: invoiceToEdit.status,
          issueDate: new Date(invoiceToEdit.issueDate),
          dueDate: new Date(invoiceToEdit.dueDate),
          notes: invoiceToEdit.notes || "",
          items: invoiceToEdit.items
        });
      } else {
        // Reset for new invoice
        setItems([]);
        setFormState({
          invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          clientName: "",
          amount: "0.00",
          status: "draft",
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          notes: "",
          items: "[]"
        });
      }
      setProjectDescription("");
      setNewItem({
        id: Math.random().toString(36).substring(2, 9),
        description: "",
        quantity: 1,
        price: 1500 // Set default price to $1,500 (more reasonable default)
      });
    }
  }, [open, isEditing, invoiceToEdit]);
  
  // Mutation for creating/updating invoice
  const invoiceMutation = useMutation({
    mutationFn: async (invoice: any) => {
      // Format dates for API
      const formattedInvoice = {
        ...invoice,
        issueDate: invoice.issueDate instanceof Date ? invoice.issueDate.toISOString() : invoice.issueDate,
        dueDate: invoice.dueDate instanceof Date ? invoice.dueDate.toISOString() : invoice.dueDate
      };
      
      console.log("Sending invoice data to API:", formattedInvoice);
      
      try {
        if (isEditing && invoiceToEdit) {
          const res = await apiRequest('PATCH', `/api/invoices/${invoiceToEdit.id}`, formattedInvoice);
          return await res.json();
        } else {
          const res = await apiRequest('POST', '/api/invoices', formattedInvoice);
          return await res.json();
        }
      } catch (error) {
        console.error("Error with invoice:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Success",
        description: isEditing ? "Invoice updated successfully" : "Invoice created successfully",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} invoice. Please try again.`,
        variant: "destructive",
      });
    }
  });
  
  // Calculate totals with safe handling for invalid values
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      const price = typeof item.price === 'number' ? item.price : 0;
      
      // Ensure we're using precise calculation for each line item
      const lineItemTotal = parseFloat((quantity * price).toFixed(2));
      return sum + lineItemTotal;
    }, 0);
  };
  
  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const rate = typeof taxRate === 'number' ? taxRate : 0;
    // Use toFixed to ensure proper decimal calculation and convert back to number
    return includeTax ? parseFloat((subtotal * (rate / 100)).toFixed(2)) : 0;
  };
  
  const calculateTotal = () => {
    // Use toFixed to ensure proper decimal precision for the final total
    return parseFloat((calculateSubtotal() + calculateTax()).toFixed(2));
  };
  
  // Update amount when items change
  useEffect(() => {
    // Force the recalculation of total after items are updated
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    
    // Use the calculateTotal function to ensure consistent calculations
    const total = calculateTotal();
    
    // Format with 2 decimal places
    const formattedTotal = total.toFixed(2);
    
    console.log("Calculated total:", { 
      subtotal: subtotal.toFixed(2), 
      tax: tax.toFixed(2), 
      total: formattedTotal,
      items: items.length
    });
    
    setFormState(prev => ({
      ...prev,
      amount: formattedTotal,
      items: JSON.stringify(items)
    }));
  }, [items, includeTax, taxRate]);
  
  // Handle adding items
  const addItem = () => {
    if (newItem.description && newItem.quantity > 0) {
      setItems([...items, newItem]);
      setNewItem({
        id: Math.random().toString(36).substring(2, 9),
        description: "",
        quantity: 1,
        price: 1500 // Set default price to $1,500 (more reasonable default)
      });
    } else {
      toast({
        title: "Validation Error",
        description: "Please enter item description and quantity",
        variant: "destructive"
      });
    }
  };
  
  // Handle removing items
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!formState.clientName) {
      toast({
        title: "Validation Error",
        description: "Please enter client name",
        variant: "destructive"
      });
      return;
    }

    invoiceMutation.mutate({
      ...formState,
      userId: 1, // This would be replaced with authenticated user ID in a real scenario
      sendOptions
    });
  };
  
  // Handle receipt of parsed items
  const handleParsedItems = (parsedItems: ParsedInvoiceItem[]) => {
    if (parsedItems && parsedItems.length > 0) {
      setItems(parsedItems.map(item => ({
        ...item,
        quantity: item.quantity || 1, // Ensure quantity is set
        price: item.price || 1500 // Ensure price is set with default
      })));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] w-[95vw] overflow-y-scroll" style={{WebkitOverflowScrolling: 'touch'}}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Create'} Enhanced Invoice</DialogTitle>
          <DialogDescription>
            Create a detailed, professional invoice with AI assistance
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="invoiceNumber">Invoice #</FormLabel>
              <Input
                id="invoiceNumber"
                value={formState.invoiceNumber}
                onChange={(e) => setFormState({ ...formState, invoiceNumber: e.target.value })}
              />
            </div>
            <div>
              <FormLabel htmlFor="clientName">Client</FormLabel>
              <Input
                id="clientName"
                value={formState.clientName}
                onChange={(e) => setFormState({ ...formState, clientName: e.target.value })}
                placeholder="Client name or company"
              />
            </div>
          </div>
          
          {/* Dates and Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FormLabel>Issue Date</FormLabel>
              <Popover open={issueDateOpen} onOpenChange={setIssueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <i className="ri-calendar-line mr-2"></i>
                    {formState.issueDate ? format(formState.issueDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formState.issueDate}
                    onSelect={(date) => {
                      setFormState({ ...formState, issueDate: date || new Date() });
                      setIssueDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <FormLabel>Due Date</FormLabel>
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <i className="ri-calendar-line mr-2"></i>
                    {formState.dueDate ? format(formState.dueDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formState.dueDate}
                    onSelect={(date) => {
                      setFormState({ ...formState, dueDate: date || new Date() });
                      setDueDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <FormLabel htmlFor="status">Status</FormLabel>
              <Select
                value={formState.status}
                onValueChange={(value) => setFormState({ ...formState, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Line Items</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsParseDialogOpen(true)}
                >
                  <i className="ri-ai-generate mr-1"></i>
                  Parse Items
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right w-[100px]">Quantity</TableHead>
                    <TableHead className="text-right w-[120px]">Price</TableHead>
                    <TableHead className="text-right w-[120px]">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    // Calculate line totals with precision
                    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                    const price = typeof item.price === 'number' ? item.price : 0;
                    const lineTotal = parseFloat((quantity * price).toFixed(2));
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${lineTotal.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                          >
                            <i className="ri-delete-bin-line text-destructive"></i>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            <div className="grid grid-cols-[1fr,100px,120px,120px,50px] gap-2 items-end">
              <div>
                <Input
                  placeholder="Item description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
              <div>
                <Input
                  type="number"
                  min={1}
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                />
              </div>
              <div>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                />
              </div>
              <div className="text-right font-medium pt-2">
                ${(newItem.quantity * newItem.price).toFixed(2)}
              </div>
              <div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={addItem}
                >
                  <i className="ri-add-line"></i>
                </Button>
              </div>
            </div>
            
            {/* Tax Settings */}
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={includeTax}
                  onCheckedChange={setIncludeTax}
                  id="tax-toggle"
                />
                <label
                  htmlFor="tax-toggle"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include Tax
                </label>
              </div>
              
              {includeTax && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    className="w-[80px]"
                    value={taxRate}
                    min={0}
                    max={100}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                  />
                  <span>%</span>
                </div>
              )}
            </div>
            
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              
              {includeTax && (
                <div className="flex justify-between">
                  <span className="font-medium">Tax ({taxRate}%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t border-b py-2">
                <span className="font-bold">Total:</span>
                <span className="font-bold">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Two-column layout for Notes and Totals/Sending Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Notes Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Notes</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={notesType === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNotesType('manual')}
                  >
                    Manual
                  </Button>
                  <Button
                    variant={notesType === 'ai' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNotesType('ai')}
                  >
                    AI-Generated
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={formState.notes}
                onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                placeholder="Additional notes for the client"
                className="min-h-[100px]"
              />
            </div>
            
            {/* Totals Summary and Sending Options Column */}
            <div className="space-y-4">
              {/* Invoice Total Summary Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Invoice Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    
                    {includeTax && (
                      <div className="flex justify-between">
                        <span className="font-medium">Tax ({taxRate}%):</span>
                        <span>${calculateTax().toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between border-t border-b py-2 mt-2">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-lg">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Sending Options */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="sending-options">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <i className="ri-mail-send-line mr-2 text-primary-600"></i>
                      Sending Options
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={sendOptions.sendEmail}
                          onCheckedChange={(checked) => 
                            setSendOptions({ ...sendOptions, sendEmail: checked })}
                          id="email-toggle"
                        />
                        <label
                          htmlFor="email-toggle"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Send via Email
                        </label>
                      </div>
                      
                      {sendOptions.sendEmail && (
                        <div>
                          <FormLabel htmlFor="emailAddress">Email Address</FormLabel>
                          <Input
                            id="emailAddress"
                            type="email"
                            value={sendOptions.emailAddress}
                            onChange={(e) => setSendOptions({ ...sendOptions, emailAddress: e.target.value })}
                            placeholder="client@example.com"
                          />
                        </div>
                      )}
                      
                      {/* SMS functionality has been removed as requested */}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={invoiceMutation.isPending}
            >
              {invoiceMutation.isPending ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-1"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="ri-save-line mr-1"></i>
                  {isEditing ? 'Update' : 'Create'} Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
        
        {/* AI Parse Invoice Items Dialog */}
        <ParseInvoiceItemsDialog
          open={isParseDialogOpen}
          onOpenChange={setIsParseDialogOpen}
          onItemsParsed={handleParsedItems}
        />
      </DialogContent>
    </Dialog>
  );
}