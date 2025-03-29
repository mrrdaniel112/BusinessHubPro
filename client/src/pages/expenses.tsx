import { useState, useEffect, useRef } from "react";
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Transaction } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Expenses() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("expenses");
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [scanReceiptOpen, setScanReceiptOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    category: "Office",
    date: new Date().toISOString().split('T')[0]
  });

  const [receiptForm, setReceiptForm] = useState({
    vendor: "",
    amount: "",
    category: "Office",
    date: new Date().toISOString().split('T')[0],
    notes: "",
    imageData: ""
  });
  
  // Camera access
  useEffect(() => {
    if (cameraActive && videoRef.current) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'environment' // prefer back camera on mobile
            }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          toast({
            title: "Camera Error",
            description: "Could not access your camera. Please check permissions.",
            variant: "destructive"
          });
          setCameraActive(false);
        }
      };
      
      startCamera();
      
      // Clean up
      return () => {
        const stream = videoRef.current?.srcObject as MediaStream;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
      };
    }
  }, [cameraActive, toast]);
  
  // Handle taking a photo with the camera
  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Reduce image size for better performance
      const MAX_WIDTH = 1280;  // Max width of the captured image
      const MAX_HEIGHT = 720;  // Max height of the captured image
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round(width * (MAX_HEIGHT / height));
          height = MAX_HEIGHT;
        }
      }
      
      // Set canvas dimensions to the new size
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the video frame to the canvas with the new dimensions
        ctx.drawImage(video, 0, 0, width, height);
        
        // Reduce quality for smaller file size
        const photoData = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        
        setReceiptForm({
          ...receiptForm,
          imageData: photoData,
          vendor: "Camera Capture",
          date: new Date().toISOString().split('T')[0]
        });
        
        // Show success message
        toast({
          title: "Photo Captured",
          description: "Image saved successfully. You can now add details and save the receipt.",
        });
        
        // Stop camera after capturing
        setCameraActive(false);
      }
    }
  };
  
  // Start camera when clicking Scan Receipt
  const handleScanReceipt = () => {
    setScanReceiptOpen(true);
    // Start with a short delay to make sure dialog is open first
    setTimeout(() => setCameraActive(true), 500);
  };

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: receipts = [], isLoading: receiptsLoading } = useQuery<Receipt[]>({
    queryKey: ['/api/receipts'],
  });
  
  // Mutations for adding expense and receipt
  const expenseMutation = useMutation({
    mutationFn: async (expense: any) => {
      const res = await apiRequest('POST', '/api/transactions', {
        ...expense,
        type: 'expense'
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Success",
        description: "Expense added successfully"
      });
      setAddExpenseOpen(false);
      setExpenseForm({
        description: "",
        amount: "",
        category: "Office",
        date: new Date().toISOString().split('T')[0]
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive"
      });
    }
  });

  const receiptMutation = useMutation({
    mutationFn: async (receipt: any) => {
      const res = await apiRequest('POST', '/api/receipts', receipt);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/receipts'] });
      toast({
        title: "Success",
        description: "Receipt added successfully"
      });
      setScanReceiptOpen(false);
      setReceiptForm({
        vendor: "",
        amount: "",
        category: "Office",
        date: new Date().toISOString().split('T')[0],
        notes: "",
        imageData: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add receipt. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Filter only expense transactions
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReceipts = receipts.filter(receipt => 
    receipt.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (receipt.notes && receipt.notes.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate expense metrics
  const calculateTotalExpenses = () => {
    return expenses.reduce((sum, expense) => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      return sum + amount;
    }, 0);
  };

  const calculateExpensesByCategory = () => {
    const categories: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      if (categories[expense.category]) {
        categories[expense.category] += amount;
      } else {
        categories[expense.category] = amount;
      }
    });
    
    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const topCategories = calculateExpensesByCategory().slice(0, 3);
  const totalExpenses = calculateTotalExpenses();

  return (
    <div>
      {/* Page header */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-semibold text-gray-900">Expense Management</h1>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setAddExpenseOpen(true)}>
              <i className="ri-add-line mr-1"></i> Add Expense
            </Button>
            <Button variant="outline" onClick={handleScanReceipt}>
              <i className="ri-camera-line mr-1"></i> Scan Receipt
            </Button>
            <label htmlFor="receiptFileUpload" className="cursor-pointer">
              <Button variant="secondary" type="button" className="flex items-center">
                <i className="ri-upload-2-line mr-1"></i> Upload Receipt
              </Button>
              <input 
                id="receiptFileUpload" 
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Compress the image before loading it
                    const compressImage = (file: File, maxSize: number): Promise<string> => {
                      return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            
                            // Calculate new dimensions while maintaining aspect ratio
                            if (width > height) {
                              if (width > maxSize) {
                                height = Math.round(height * (maxSize / width));
                                width = maxSize;
                              }
                            } else {
                              if (height > maxSize) {
                                width = Math.round(width * (maxSize / height));
                                height = maxSize;
                              }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);
                            
                            // Get compressed image data
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                            resolve(dataUrl);
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      });
                    };
                    
                    // Compress image and update form
                    compressImage(file, 1280).then(compressedImage => {
                      setReceiptForm({
                        ...receiptForm,
                        imageData: compressedImage,
                        vendor: file.name.split('.')[0] || "Unknown Vendor",
                        date: new Date().toISOString().split('T')[0]
                      });
                      setScanReceiptOpen(true);
                      toast({
                        title: "Image Uploaded",
                        description: "Receipt image has been processed and is ready to save."
                      });
                    });
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
      
      {/* Add Expense Dialog */}
      <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Record a new expense to track your business costs
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount ($)
              </Label>
              <Input
                id="amount"
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select 
                value={expenseForm.category}
                onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Office">Office Supplies</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Meals">Meals & Entertainment</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddExpenseOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => expenseMutation.mutate(expenseForm)}
              disabled={expenseMutation.isPending}
            >
              {expenseMutation.isPending ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-1"></i>
                  Saving...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Scan Receipt Dialog */}
      <Dialog open={scanReceiptOpen} onOpenChange={setScanReceiptOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Scan Receipt</DialogTitle>
            <DialogDescription>
              Add a receipt by uploading an image or entering details manually
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendor" className="text-right">
                Vendor
              </Label>
              <Input
                id="vendor"
                value={receiptForm.vendor}
                onChange={(e) => setReceiptForm({ ...receiptForm, vendor: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receiptAmount" className="text-right">
                Amount ($)
              </Label>
              <Input
                id="receiptAmount"
                type="number"
                value={receiptForm.amount}
                onChange={(e) => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receiptCategory" className="text-right">
                Category
              </Label>
              <Select 
                value={receiptForm.category}
                onValueChange={(value) => setReceiptForm({ ...receiptForm, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Office">Office Supplies</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Meals">Meals & Entertainment</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receiptDate" className="text-right">
                Date
              </Label>
              <Input
                id="receiptDate"
                type="date"
                value={receiptForm.date}
                onChange={(e) => setReceiptForm({ ...receiptForm, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={receiptForm.notes}
                onChange={(e) => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                className="col-span-3"
                placeholder="Additional details"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receiptImage" className="text-right">
                Receipt Image
              </Label>
              <div className="col-span-3">
                {cameraActive ? (
                  <div className="space-y-3">
                    <div className="relative border rounded-md overflow-hidden">
                      <video 
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover"
                      />
                      <Button 
                        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 rounded-full px-6"
                        onClick={capturePhoto}
                      >
                        <i className="ri-camera-line mr-1"></i> Take Photo
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setCameraActive(false)}
                    >
                      <i className="ri-close-circle-line mr-1"></i> Cancel Camera
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex space-x-2 mb-2">
                      <Button 
                        variant="secondary" 
                        type="button" 
                        className="flex-1"
                        onClick={() => setCameraActive(true)}
                      >
                        <i className="ri-camera-line mr-1"></i> Use Camera
                      </Button>
                      <div className="relative flex-1">
                        <Button 
                          variant="outline" 
                          type="button" 
                          className="w-full"
                        >
                          <i className="ri-upload-2-line mr-1"></i> Upload File
                        </Button>
                        <Input
                          id="receiptImage"
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Reuse the compression function from above
                              const compressImage = (file: File, maxSize: number): Promise<string> => {
                                return new Promise((resolve) => {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const img = new Image();
                                    img.onload = () => {
                                      const canvas = document.createElement('canvas');
                                      let width = img.width;
                                      let height = img.height;
                                      
                                      // Calculate new dimensions while maintaining aspect ratio
                                      if (width > height) {
                                        if (width > maxSize) {
                                          height = Math.round(height * (maxSize / width));
                                          width = maxSize;
                                        }
                                      } else {
                                        if (height > maxSize) {
                                          width = Math.round(width * (maxSize / height));
                                          height = maxSize;
                                        }
                                      }
                                      
                                      canvas.width = width;
                                      canvas.height = height;
                                      const ctx = canvas.getContext('2d');
                                      ctx?.drawImage(img, 0, 0, width, height);
                                      
                                      // Get compressed image data
                                      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                                      resolve(dataUrl);
                                    };
                                    img.src = event.target?.result as string;
                                  };
                                  reader.readAsDataURL(file);
                                });
                              };
                              
                              // Compress and set image
                              compressImage(file, 1280).then(compressedImage => {
                                setReceiptForm({ ...receiptForm, imageData: compressedImage });
                                toast({
                                  title: "Image Uploaded",
                                  description: "Receipt image has been processed successfully."
                                });
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                    {receiptForm.imageData && (
                      <div className="mt-2 border rounded-md overflow-hidden">
                        <img 
                          src={receiptForm.imageData} 
                          alt="Receipt preview" 
                          className="w-full h-32 object-contain"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setScanReceiptOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => receiptMutation.mutate(receiptForm)}
              disabled={receiptMutation.isPending}
            >
              {receiptMutation.isPending ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-1"></i>
                  Saving...
                </>
              ) : (
                "Save Receipt"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-danger-50">
                  <i className="ri-shopping-bag-line text-xl text-danger-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Total Expenses</h3>
              <p className="text-2xl font-bold">
                {transactionsLoading ? "..." : formatCurrency(totalExpenses)}
              </p>
            </CardContent>
          </Card>
          
          {topCategories.map((category, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 rounded-md bg-primary-50">
                    <i className="ri-price-tag-3-line text-xl text-primary-600"></i>
                  </div>
                </div>
                <h3 className="text-sm text-gray-500">Top: {category.category}</h3>
                <p className="text-2xl font-bold">{formatCurrency(category.amount)}</p>
              </CardContent>
            </Card>
          ))}
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-success-50">
                  <i className="ri-receipt-line text-xl text-success-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Receipts Saved</h3>
              <p className="text-2xl font-bold">{receiptsLoading ? "..." : receipts.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Expenses and Receipts tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8 mb-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 items-start sm:items-center justify-between">
            <CardTitle>Expense Tracking</CardTitle>
            <Input
              type="search"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="expenses" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="receipts">Receipts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="expenses">
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="w-full h-16 bg-gray-100 animate-pulse rounded-md"></div>
                    ))}
                  </div>
                ) : filteredExpenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 font-medium text-gray-500">Description</th>
                          <th className="pb-2 font-medium text-gray-500">Category</th>
                          <th className="pb-2 font-medium text-gray-500">Date</th>
                          <th className="pb-2 font-medium text-gray-500 text-right">Amount</th>
                          <th className="pb-2 font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenses.map((expense) => (
                          <tr key={expense.id} className="border-b">
                            <td className="py-3">{expense.description}</td>
                            <td className="py-3">
                              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                {expense.category}
                              </span>
                            </td>
                            <td className="py-3">{formatDate(expense.date)}</td>
                            <td className="py-3 text-right font-medium text-danger-600">
                              {formatCurrency(expense.amount)}
                            </td>
                            <td className="py-3 text-right">
                              <Button variant="ghost" size="sm">
                                <i className="ri-more-2-fill"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="ri-file-list-3-line text-4xl text-gray-300"></i>
                    <p className="mt-2 text-gray-500">No expenses found</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="receipts">
                {receiptsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="w-full h-48 bg-gray-100 animate-pulse rounded-md"></div>
                    ))}
                  </div>
                ) : filteredReceipts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReceipts.map((receipt) => (
                      <Card key={receipt.id}>
                        <CardContent className="p-0">
                          <div className="p-4 border-b">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{receipt.vendor}</h3>
                                <p className="text-sm text-gray-500">{formatDate(receipt.date)}</p>
                              </div>
                              <span className="font-medium text-danger-600">
                                {formatCurrency(receipt.amount)}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <i className="ri-price-tag-3-line mr-1"></i>
                              <span>{receipt.category}</span>
                            </div>
                            {receipt.notes && (
                              <p className="text-sm text-gray-600 mt-2">{receipt.notes}</p>
                            )}
                            {receipt.imageData && (
                              <div className="mt-3 border rounded overflow-hidden">
                                <img 
                                  src={receipt.imageData.startsWith('data:') 
                                    ? receipt.imageData 
                                    : `data:image/jpeg;base64,${receipt.imageData}`} 
                                  alt="Receipt" 
                                  className="w-full h-32 object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="ri-receipt-line text-4xl text-gray-300"></i>
                    <p className="mt-2 text-gray-500">No receipts found</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      <Button 
                        variant="outline"
                        onClick={handleScanReceipt}
                      >
                        <i className="ri-camera-line mr-1"></i> Scan a Receipt
                      </Button>
                      <label htmlFor="emptyStateFileUpload" className="cursor-pointer">
                        <Button variant="secondary" type="button">
                          <i className="ri-upload-2-line mr-1"></i> Upload Receipt
                        </Button>
                        <input 
                          id="emptyStateFileUpload" 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Reuse the compression function
                              const compressImage = (file: File, maxSize: number): Promise<string> => {
                                return new Promise((resolve) => {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const img = new Image();
                                    img.onload = () => {
                                      const canvas = document.createElement('canvas');
                                      let width = img.width;
                                      let height = img.height;
                                      
                                      // Calculate new dimensions while maintaining aspect ratio
                                      if (width > height) {
                                        if (width > maxSize) {
                                          height = Math.round(height * (maxSize / width));
                                          width = maxSize;
                                        }
                                      } else {
                                        if (height > maxSize) {
                                          width = Math.round(width * (maxSize / height));
                                          height = maxSize;
                                        }
                                      }
                                      
                                      canvas.width = width;
                                      canvas.height = height;
                                      const ctx = canvas.getContext('2d');
                                      ctx?.drawImage(img, 0, 0, width, height);
                                      
                                      // Get compressed image data
                                      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                                      resolve(dataUrl);
                                    };
                                    img.src = event.target?.result as string;
                                  };
                                  reader.readAsDataURL(file);
                                });
                              };
                              
                              // Compress and set image
                              compressImage(file, 1280).then(compressedImage => {
                                setReceiptForm({
                                  ...receiptForm,
                                  imageData: compressedImage,
                                  vendor: file.name.split('.')[0] || "Unknown Vendor",
                                  date: new Date().toISOString().split('T')[0]
                                });
                                setScanReceiptOpen(true);
                                toast({
                                  title: "Image Uploaded",
                                  description: "Receipt image has been processed and is ready to save."
                                });
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
