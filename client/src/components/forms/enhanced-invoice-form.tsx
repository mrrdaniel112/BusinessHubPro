import * as React from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Invoice } from "@shared/schema";

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
    price: 15000 // Set high default price of $15,000
  });
  const [notesType, setNotesType] = useState('manual'); // 'manual' or 'ai'
  const [projectDescription, setProjectDescription] = useState("");
  const [sendOptions, setSendOptions] = useState({
    sendEmail: false,
    emailAddress: ""
  });
  
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
        price: 15000 // Set high default price of $15,000
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
      return sum + (quantity * price);
    }, 0);
  };
  
  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const rate = typeof taxRate === 'number' ? taxRate : 0;
    return includeTax ? (subtotal * (rate / 100)) : 0;
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };
  
  // Update amount when items change
  useEffect(() => {
    // Force the recalculation of total after items are updated
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const total = subtotal + tax;
    
    // Format with 2 decimal places
    const formattedTotal = total.toFixed(2);
    
    console.log("Calculated total:", { subtotal, tax, total, formattedTotal });
    
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
        price: 15000 // Set high default price of $15,000
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
  
  // Generate invoice details with AI
  const generateAIInvoiceDetails = async () => {
    if (!projectDescription) {
      toast({
        title: "Missing Info",
        description: "Please provide a project description for AI to generate content",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingAI(true);
    
    try {
      const res = await apiRequest('POST', '/api/ai/generate-invoice', {
        projectDescription,
        clientName: formState.clientName
      });
      
      if (res.ok) {
        const aiData = await res.json();
        
        if (aiData.items && Array.isArray(aiData.items)) {
          setItems(aiData.items.map((item: any) => ({
            ...item,
            id: Math.random().toString(36).substring(2, 9)
          })));
        }
        
        if (aiData.notes) {
          setFormState(prev => ({
            ...prev,
            notes: aiData.notes
          }));
        }
        
        toast({
          title: "AI Generation Complete",
          description: "Invoice details have been generated based on your project description",
        });
      } else {
        throw new Error("Failed to generate AI content");
      }
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast({
        title: "AI Generation Failed",
        description: "Could not generate invoice details. Please try again or enter manually.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!formState.clientName) {
      toast({
        title: "Validation Error",
        description: "Please enter a client name",
        variant: "destructive"
      });
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item to the invoice",
        variant: "destructive"
      });
      return;
    }
    
    // Create the invoice with all the data including notification options
    invoiceMutation.mutate({
      ...formState,
      // Include the notification options directly in the API request
      sendEmail: sendOptions.sendEmail,
      emailAddress: sendOptions.emailAddress,
      sendSMS: false, // SMS functionality has been removed
      phoneNumber: "", // SMS functionality has been removed
      // Add the notification info to notes for reference
      notes: formState.notes + (sendOptions.sendEmail ? 
        `\n\nSend to: ${sendOptions.emailAddress}` : '')
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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
              <FormLabel htmlFor="clientName">Client Name *</FormLabel>
              <Input
                id="clientName"
                value={formState.clientName}
                onChange={(e) => setFormState({ ...formState, clientName: e.target.value })}
                placeholder="Client name"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="issueDate">Issue Date</FormLabel>
              <Popover open={issueDateOpen} onOpenChange={setIssueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <i className="ri-calendar-line mr-2"></i>
                    {formState.issueDate ? format(formState.issueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
              <FormLabel htmlFor="dueDate">Due Date</FormLabel>
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <i className="ri-calendar-line mr-2"></i>
                    {formState.dueDate ? format(formState.dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* AI-powered invoice generation */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ai-generation">
              <AccordionTrigger>
                <div className="flex items-center">
                  <i className="ri-robot-line mr-2 text-primary-600"></i>
                  AI-Powered Invoice Generation
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <FormLabel htmlFor="projectDescription">Describe your project</FormLabel>
                    <Textarea
                      id="projectDescription"
                      placeholder="Describe the project, services provided, or work completed. AI will generate line items and descriptions."
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button 
                    onClick={generateAIInvoiceDetails}
                    disabled={isGeneratingAI || !projectDescription}
                  >
                    {isGeneratingAI ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Generating...
                      </>
                    ) : (
                      <>
                        <i className="ri-magic-line mr-2"></i>
                        Generate Invoice Items & Description
                      </>
                    )}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Invoice Items</h3>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px] text-right">Quantity</TableHead>
                  <TableHead className="w-[150px] text-right">Price</TableHead>
                  <TableHead className="w-[150px] text-right">Total</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}</TableCell>
                    <TableCell className="text-right">${typeof item.price === 'number' && typeof item.quantity === 'number' ? (item.quantity * item.price).toFixed(2) : '0.00'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeItem(item.id)}
                      >
                        <i className="ri-delete-bin-line text-red-500"></i>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <Input
                      placeholder="Item description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    ${typeof newItem.quantity === 'number' && typeof newItem.price === 'number' ? (newItem.quantity * newItem.price).toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addItem}
                    >
                      <i className="ri-add-line"></i>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            {/* Tax calculation */}
            <div className="flex justify-end space-x-4 items-center">
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
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-[80px]"
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
          
          {/* Notes */}
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
      </DialogContent>
    </Dialog>
  );
}