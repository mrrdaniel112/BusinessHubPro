import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InventoryItem } from "@shared/schema";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Cpu, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const inventoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number"),
  price: z.string().min(1, "Price is required"),
  category: z.string().optional(),
  lowStockThreshold: z.coerce.number().min(0, "Threshold must be a positive number").optional(),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

const defaultValues: Partial<InventoryFormValues> = {
  name: "",
  description: "",
  quantity: 0,
  price: "",
  category: "",
  lowStockThreshold: 5,
};

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit?: InventoryItem;
}

// Type definition for AI recommendations
interface AiRecommendations {
  suggestedPrice: number;
  suggestedCategory: string;
  suggestedLowStockThreshold: number;
  relatedItems: string[];
  insights: string;
}

export function InventoryForm({ open, onOpenChange, itemToEdit }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = React.useState(false);
  const [recommendations, setRecommendations] = React.useState<AiRecommendations | null>(null);
  const [recommendationError, setRecommendationError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>("form");
  const isEditing = !!itemToEdit;

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: isEditing 
      ? {
          name: itemToEdit.name,
          description: itemToEdit.description || "",
          quantity: itemToEdit.quantity,
          price: String(itemToEdit.price),
          category: itemToEdit.category || "",
          lowStockThreshold: itemToEdit.lowStockThreshold || 5,
        }
      : defaultValues,
  });

  // Reset form when itemToEdit changes or dialog opens/closes
  React.useEffect(() => {
    if (open) {
      if (isEditing) {
        form.reset({
          name: itemToEdit.name,
          description: itemToEdit.description || "",
          quantity: itemToEdit.quantity,
          price: String(itemToEdit.price),
          category: itemToEdit.category || "",
          lowStockThreshold: itemToEdit.lowStockThreshold || 5,
        });
      } else {
        form.reset(defaultValues);
      }
      // Reset AI recommendations state
      setRecommendations(null);
      setRecommendationError(null);
      setActiveTab("form");
    }
  }, [open, itemToEdit, form, isEditing]);

  // Function to get AI recommendations based on item details
  const getAiRecommendations = async () => {
    const itemData = form.getValues();
    
    // Check if we have at least a name to base recommendations on
    if (!itemData.name) {
      toast({
        title: "Missing Information",
        description: "Please enter at least the item name to get AI recommendations.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoadingRecommendations(true);
      setRecommendationError(null);
      
      // Call the API endpoint to get AI recommendations
      const response = await apiRequest(
        "POST", 
        "/api/inventory/recommendations", 
        itemData
      );
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
        setActiveTab("ai");
        
        // Optional: Update form with some of the recommendations
        if (data.suggestedCategory && !itemData.category) {
          form.setValue("category", data.suggestedCategory);
        }
        
        if (data.suggestedPrice && (!itemData.price || itemData.price === "0" || itemData.price === "0.00")) {
          form.setValue("price", String(data.suggestedPrice));
        }
        
        if (data.suggestedLowStockThreshold && (!itemData.lowStockThreshold || itemData.lowStockThreshold === 0)) {
          form.setValue("lowStockThreshold", data.suggestedLowStockThreshold);
        }
      } else {
        const errorData = await response.json();
        setRecommendationError(errorData.message || "Failed to get AI recommendations");
      }
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      setRecommendationError(
        error instanceof Error 
          ? error.message 
          : "Failed to get AI recommendations"
      );
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  async function onSubmit(data: InventoryFormValues) {
    try {
      setIsSubmitting(true);
      console.log("Sending inventory data to API:", data);

      let response;
      if (isEditing) {
        // Update existing item
        response = await apiRequest("PATCH", `/api/inventory/${itemToEdit.id}`, data);
      } else {
        // Create new item
        response = await apiRequest("POST", "/api/inventory", data);
      }

      if (response.ok) {
        // Reset form and close dialog
        form.reset();
        onOpenChange(false);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });

        toast({
          title: isEditing ? "Item updated" : "Item added",
          description: isEditing 
            ? "Your inventory item has been updated successfully." 
            : "Your inventory item has been added successfully.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'add'} inventory item`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} inventory item:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'add'} inventory item`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Add'} Inventory Item</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the details of your inventory item' 
              : 'Enter the details for your new inventory item'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="form">Item Details</TabsTrigger>
            <TabsTrigger value="ai" disabled={isSubmitting}>
              <div className="flex items-center gap-1">
                <Cpu className="w-4 h-4" /> AI Recommendations
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="mt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter item name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter description (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter category (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lowStockThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Low Stock Threshold</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={getAiRecommendations}
                    disabled={isLoadingRecommendations || isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isLoadingRecommendations ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Getting recommendations...
                      </>
                    ) : (
                      <>
                        <Cpu className="h-4 w-4" />
                        Get AI Recommendations
                      </>
                    )}
                  </Button>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : (isEditing ? "Update Item" : "Save Item")}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="ai" className="mt-0 space-y-4">
            {recommendationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {recommendationError}
                </AlertDescription>
              </Alert>
            )}

            {isLoadingRecommendations ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-center text-muted-foreground">
                  Analyzing your product data and generating smart recommendations...
                </p>
              </div>
            ) : recommendations ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Smart Pricing & Classification</CardTitle>
                    <CardDescription>
                      AI-powered recommendations for your inventory item
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col p-3 border rounded-md">
                        <span className="text-sm text-muted-foreground">Suggested Price</span>
                        <span className="text-xl font-medium">${recommendations.suggestedPrice.toFixed(2)}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-1"
                          onClick={() => form.setValue("price", String(recommendations.suggestedPrice))}
                        >
                          Use this
                        </Button>
                      </div>
                      
                      <div className="flex flex-col p-3 border rounded-md">
                        <span className="text-sm text-muted-foreground">Suggested Category</span>
                        <span className="text-xl font-medium">{recommendations.suggestedCategory}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-1"
                          onClick={() => form.setValue("category", recommendations.suggestedCategory)}
                        >
                          Use this
                        </Button>
                      </div>
                      
                      <div className="flex flex-col p-3 border rounded-md">
                        <span className="text-sm text-muted-foreground">Low Stock Alert At</span>
                        <span className="text-xl font-medium">{recommendations.suggestedLowStockThreshold} units</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-1"
                          onClick={() => form.setValue("lowStockThreshold", recommendations.suggestedLowStockThreshold)}
                        >
                          Use this
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Related Items</CardTitle>
                    <CardDescription>
                      Items that are often purchased together
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.relatedItems.map((item, index) => (
                        <Badge key={index} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Business Insights</CardTitle>
                    <CardDescription>
                      AI-generated business insights for this item
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{recommendations.insights}</p>
                  </CardContent>
                </Card>

                <div className="flex justify-between items-center pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("form")}
                  >
                    Back to Form
                  </Button>

                  <Button 
                    type="button" 
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : (isEditing ? "Update Item" : "Save Item")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <Cpu className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
                <p className="text-center text-muted-foreground mb-4">
                  Fill in your item details and click "Get AI Recommendations" 
                  to receive intelligent suggestions for your inventory.
                </p>
                <Button 
                  onClick={() => setActiveTab("form")}
                  variant="outline"
                >
                  Back to Form
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}