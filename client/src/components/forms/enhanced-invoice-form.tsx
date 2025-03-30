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
  
  // Invoice templates
  const invoiceTemplates = {
    renovation: {
      title: "Residential Renovation",
      description: "Complete home renovation project",
      items: [
        { id: "ren1", description: "New bathroom installation and fixtures", quantity: 1, price: 15000 },
        { id: "ren2", description: "Kitchen expansion and remodeling", quantity: 1, price: 18500 },
        { id: "ren3", description: "Removal of load-bearing wall with structural support", quantity: 1, price: 8500 },
        { id: "ren4", description: "Hardwood flooring installation", quantity: 1, price: 12000 },
        { id: "ren5", description: "Electrical system upgrades", quantity: 1, price: 7500 },
        { id: "ren6", description: "Energy-efficient window installation", quantity: 1, price: 8500 },
        { id: "ren7", description: "Building permits and inspections", quantity: 1, price: 2000 },
        { id: "ren8", description: "Project management and supervision", quantity: 1, price: 3000 }
      ],
      notes: "Thank you for your business! This invoice covers all renovation services as outlined in our agreement. All work performed in compliance with local building codes and completed on schedule. Payment is due within 30 days of receipt."
    },
    default: {
      title: "Professional Services",
      description: "Default business services template",
      items: [
        { id: "def1", description: "Professional services and expert consultation", quantity: 1, price: 8500 },
        { id: "def2", description: "Strategic project management and oversight", quantity: 1, price: 5500 },
        { id: "def3", description: "Implementation and delivery of core deliverables", quantity: 1, price: 6500 },
        { id: "def4", description: "Technical architecture and system design", quantity: 1, price: 7500 },
        { id: "def5", description: "Custom development and specialized programming", quantity: 1, price: 7000 },
        { id: "def6", description: "Quality assurance and comprehensive testing", quantity: 1, price: 4500 },
        { id: "def7", description: "User experience design and optimization", quantity: 1, price: 5000 },
        { id: "def8", description: "Documentation and knowledge transfer", quantity: 1, price: 3500 },
        { id: "def9", description: "Performance optimization and system tuning", quantity: 1, price: 4000 },
        { id: "def10", description: "Post-implementation support and maintenance", quantity: 1, price: 4500 }
      ],
      notes: "Thank you for your business! Payment is due within 30 days of receipt. If you have any questions about this invoice, please contact us."
    },
    website: {
      title: "Website Development",
      description: "Complete website design and development",
      items: [
        { id: "web1", description: "Website design and strategic planning", quantity: 1, price: 7500 },
        { id: "web2", description: "Advanced frontend development with animations", quantity: 1, price: 8500 },
        { id: "web3", description: "Custom backend integration and APIs", quantity: 1, price: 9500 },
        { id: "web4", description: "Responsive design across all devices", quantity: 1, price: 5500 },
        { id: "web5", description: "Content management system customization", quantity: 1, price: 6500 },
        { id: "web6", description: "E-commerce functionality integration", quantity: 1, price: 7500 },
        { id: "web7", description: "SEO optimization and structured data", quantity: 1, price: 4500 },
        { id: "web8", description: "Performance optimization and caching", quantity: 1, price: 5000 },
        { id: "web9", description: "Security implementation and testing", quantity: 1, price: 6000 },
        { id: "web10", description: "Analytics setup and user tracking", quantity: 1, price: 4500 }
      ],
      notes: "Thank you for your business! This invoice covers all agreed website development services. Payment is due within 30 days of issue. We offer a 30-day support period for any questions or minor adjustments needed after delivery."
    },
    marketing: {
      title: "Marketing Campaign",
      description: "Strategic marketing and campaign management",
      items: [
        { id: "mkt1", description: "Comprehensive marketing strategy development and planning", quantity: 1, price: 8500 },
        { id: "mkt2", description: "Target audience research and persona development", quantity: 1, price: 5500 },
        { id: "mkt3", description: "Brand messaging and value proposition refinement", quantity: 1, price: 6000 },
        { id: "mkt4", description: "Premium content creation and copywriting", quantity: 5, price: 3500 },
        { id: "mkt5", description: "High-quality visual asset design and production", quantity: 1, price: 6500 },
        { id: "mkt6", description: "Multi-platform social media campaign setup", quantity: 1, price: 5500 },
        { id: "mkt7", description: "Search engine optimization and digital presence", quantity: 1, price: 5000 },
        { id: "mkt8", description: "Email marketing campaign development", quantity: 1, price: 4500 },
        { id: "mkt9", description: "Marketing automation workflow implementation", quantity: 1, price: 5000 },
        { id: "mkt10", description: "Advanced analytics and performance tracking", quantity: 1, price: 4500 }
      ],
      notes: "Thank you for your business! This invoice covers all marketing services as outlined in our agreement. Payment is due within 21 days. For questions regarding this invoice, please contact our accounting department."
    },
    consulting: {
      title: "Business Consulting",
      description: "Strategic business consulting and analysis",
      items: [
        { id: "con1", description: "Comprehensive initial business analysis and assessment", quantity: 1, price: 7500 },
        { id: "con2", description: "In-depth market research and competitor analysis", quantity: 1, price: 6500 },
        { id: "con3", description: "Executive strategy development workshops", quantity: 3, price: 5500 },
        { id: "con4", description: "Custom business growth roadmap creation", quantity: 1, price: 8000 },
        { id: "con5", description: "Financial modeling and projection analysis", quantity: 1, price: 7000 },
        { id: "con6", description: "Operational process optimization planning", quantity: 1, price: 6000 },
        { id: "con7", description: "Risk assessment and mitigation strategies", quantity: 1, price: 5500 },
        { id: "con8", description: "Detailed implementation planning and timelines", quantity: 1, price: 6500 },
        { id: "con9", description: "Comprehensive documentation and reporting", quantity: 1, price: 4500 },
        { id: "con10", description: "Follow-up review and adjustment sessions", quantity: 2, price: 3500 }
      ],
      notes: "Thank you for choosing our consulting services! This invoice covers all consulting services as outlined in our agreement. Payment terms: Net 15 days. Please include the invoice number with your payment."
    },
    software: {
      title: "Software Development",
      description: "Custom software development and implementation",
      items: [
        { id: "sw1", description: "Comprehensive requirements gathering and analysis", quantity: 1, price: 5500 },
        { id: "sw2", description: "Advanced software architecture and system design", quantity: 1, price: 7500 },
        { id: "sw3", description: "Core development and feature implementation", quantity: 1, price: 9000 },
        { id: "sw4", description: "Database design and data migration services", quantity: 1, price: 6500 },
        { id: "sw5", description: "API development and third-party integrations", quantity: 1, price: 7000 },
        { id: "sw6", description: "Frontend user interface development", quantity: 1, price: 6000 },
        { id: "sw7", description: "Comprehensive quality assurance and testing", quantity: 1, price: 5500 },
        { id: "sw8", description: "Security implementation and vulnerability testing", quantity: 1, price: 6000 },
        { id: "sw9", description: "Production deployment and system configuration", quantity: 1, price: 4000 },
        { id: "sw10", description: "Documentation and knowledge transfer sessions", quantity: 1, price: 4500 }
      ],
      notes: "Thank you for choosing us for your software development needs! This invoice covers all development services as outlined in our agreement. Payment is due within 30 days of receipt. We provide 60 days of post-deployment support to ensure a smooth transition."
    }
  };
  
  // Apply template to form
  const applyTemplate = (templateName: string) => {
    const template = invoiceTemplates[templateName as keyof typeof invoiceTemplates] || invoiceTemplates.default;
    setItems(template.items);
    setFormState(prev => ({
      ...prev,
      notes: template.notes
    }));
    
    toast({
      title: `${template.title} Template Applied`,
      description: `Applied the ${template.description} template to your invoice`,
    });
  };

  // Function to parse text into line items (like QuickBooks)
  const parseTextToLineItems = (text: string): InvoiceItem[] => {
    // Split the text by new lines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    return lines.map(line => {
      let description = line.trim();
      let quantity = 1;
      let price = 1500; // Default price
      
      // Try to extract quantity if format is like "5x Widget" or "5 Widget"
      const quantityMatch = description.match(/^(\d+)(?:x|\s+)/);
      if (quantityMatch) {
        quantity = parseInt(quantityMatch[1], 10);
        description = description.replace(quantityMatch[0], '').trim();
      }
      
      // Try to extract price if format is like "Widget - $500" or "Widget $500"
      const priceMatch = description.match(/[\s-]*\$(\d+(?:,\d+)*(?:\.\d+)?)/);
      if (priceMatch) {
        price = parseFloat(priceMatch[1].replace(/,/g, ''));
        description = description.replace(priceMatch[0], '').trim();
      }
      
      return {
        id: Math.random().toString(36).substring(2, 9),
        description,
        quantity,
        price
      };
    });
  };
  
  // Handle items parsed from Puter AI
  const handleParsedItems = (parsedItems: ParsedInvoiceItem[]) => {
    // Convert ParsedInvoiceItem[] to InvoiceItem[]
    const newItems = parsedItems.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      price: item.price
    }));
    
    // Add the parsed items to the existing items
    setItems([...items, ...newItems]);
    
    toast({
      title: "Items Added",
      description: `Successfully added ${parsedItems.length} items to your invoice`,
    });
  };

  // Generate invoice details with AI or fallback to text parsing
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
      // First try with AI
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
      
      // Fallback to parsing text when AI fails
      const parsedItems = parseTextToLineItems(projectDescription);
      
      if (parsedItems.length > 0) {
        setItems(parsedItems);
        
        toast({
          title: "Line Items Created",
          description: `Created ${parsedItems.length} invoice items from your description`,
        });
      } else {
        toast({
          title: "Processing Failed",
          description: "Could not generate invoice items. Please add them manually.",
          variant: "destructive"
        });
      }
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
          
          {/* Quick line item entry section */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ai-generation">
              <AccordionTrigger>
                <div className="flex items-center">
                  <i className="ri-text-wrap mr-2 text-primary-600"></i>
                  Quick Line Item Entry
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <FormLabel htmlFor="projectDescription">Enter line items (one per line)</FormLabel>
                    <Textarea
                      id="projectDescription"
                      placeholder="Enter one line item per line. Examples:
Website design $2500
10x Custom icons $50
Content creation - $1500
Logo redesign"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="min-h-[120px]"
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
                        <i className="ri-list-check-3 mr-2"></i>
                        Convert Text to Line Items
                      </>
                    )}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Template Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Invoice Templates</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(invoiceTemplates).map(([key, template]) => (
                <Card 
                  key={key} 
                  className={`cursor-pointer hover:border-primary transition-all duration-200 ${items.some(item => item.id.startsWith(key.substring(0, 3))) ? 'border-primary' : ''}`}
                  onClick={() => applyTemplate(key)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium">{template.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <p className="text-sm mt-1 font-medium">
                      {template.items.length} items - Total: ${template.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Invoice Items</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsParseDialogOpen(true)}
              >
                <i className="ri-magic-line mr-2"></i>
                Parse Items from Text
              </Button>
            </div>
            
            {/* Parse Items Dialog */}
            <ParseInvoiceItemsDialog
              open={isParseDialogOpen}
              onOpenChange={setIsParseDialogOpen}
              onItemsParsed={handleParsedItems}
            />
            
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
                {items.map((item) => {
                  // Calculate line totals with precision
                  const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                  const price = typeof item.price === 'number' ? item.price : 0;
                  const lineTotal = parseFloat((quantity * price).toFixed(2));
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{quantity}</TableCell>
                      <TableCell className="text-right">${price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${lineTotal.toFixed(2)}</TableCell>
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
                  );
                })}
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
                    ${(() => {
                      const quantity = typeof newItem.quantity === 'number' ? newItem.quantity : 0;
                      const price = typeof newItem.price === 'number' ? newItem.price : 0;
                      return parseFloat((quantity * price).toFixed(2)).toFixed(2);
                    })()}
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
        </DialogContent>
      </Dialog>
    );
}