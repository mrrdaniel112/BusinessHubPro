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

export function InventoryForm({ open, onOpenChange, itemToEdit }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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
    }
  }, [open, itemToEdit, form, isEditing]);

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Add'} Inventory Item</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the details of your inventory item' 
              : 'Enter the details for your new inventory item'
            }
          </DialogDescription>
        </DialogHeader>

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

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : (isEditing ? "Update Item" : "Save Item")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}