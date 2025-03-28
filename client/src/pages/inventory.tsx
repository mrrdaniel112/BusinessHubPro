import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InventoryItem } from "@shared/schema";
import { InventoryForm } from "@/components/forms/inventory-form";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryFormOpen, setInventoryFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>(undefined);

  const { data: inventoryItems = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
  });

  const filteredItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const isLowStock = (item: InventoryItem) => {
    return item.lowStockThreshold !== null && 
           item.lowStockThreshold !== undefined && 
           item.quantity <= item.lowStockThreshold;
  };

  return (
    <div>
      {/* Page header */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
          <Button onClick={() => setInventoryFormOpen(true)}>
            <i className="ri-add-line mr-1"></i> Add Inventory Item
          </Button>
        </div>
      </div>
      
      {/* Inventory Form */}
      <InventoryForm 
        open={inventoryFormOpen} 
        onOpenChange={(open) => {
          setInventoryFormOpen(open);
          if (!open) setSelectedItem(undefined); // Clear selection when dialog closes
        }}
        itemToEdit={selectedItem}
      />

      {/* Inventory stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-primary-50">
                  <i className="ri-store-2-line text-xl text-primary-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Total Items</h3>
              <p className="text-2xl font-bold">{isLoading ? "..." : inventoryItems.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-warning-50">
                  <i className="ri-alert-line text-xl text-warning-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Low Stock Items</h3>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : inventoryItems.filter(item => isLowStock(item)).length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-success-50">
                  <i className="ri-money-dollar-circle-line text-xl text-success-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Total Inventory Value</h3>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : formatCurrency(
                  inventoryItems.reduce((sum, item) => {
                    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                    return sum + (price * item.quantity);
                  }, 0)
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-primary-50">
                  <i className="ri-list-check text-xl text-primary-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Categories</h3>
              <p className="text-2xl font-bold">
                {isLoading ? "..." : new Set(inventoryItems.map(item => item.category)).size}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inventory list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8 mb-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <CardTitle>Inventory Items</CardTitle>
            <div className="w-full sm:w-auto max-w-sm">
              <Input
                type="search"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="w-full h-16 bg-gray-100 animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-gray-500">{item.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.category || "Uncategorized"}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            typeof item.price === 'string' 
                              ? parseFloat(item.price) * item.quantity 
                              : item.price * item.quantity
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isLowStock(item) ? (
                            <Badge variant="destructive">Low Stock</Badge>
                          ) : (
                            <Badge variant="outline">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setInventoryFormOpen(true);
                            }}
                          >
                            <i className="ri-edit-line mr-1"></i> Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="ri-inbox-line text-4xl text-gray-300"></i>
                <p className="mt-2 text-gray-500">No items found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
