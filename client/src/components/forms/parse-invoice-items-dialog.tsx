import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseInvoiceLines, ParsedInvoiceItem } from "../ai/puter-invoice-parser";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ParseInvoiceItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemsParsed: (items: ParsedInvoiceItem[]) => void;
}

export function ParseInvoiceItemsDialog({
  open,
  onOpenChange,
  onItemsParsed
}: ParseInvoiceItemsDialogProps) {
  const [text, setText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [responseMessages, setResponseMessages] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<string>("text-parser");
  const { toast } = useToast();

  // Clear state when dialog opens
  useEffect(() => {
    if (open) {
      setText("");
      setJobDescription("");
      setResponseMessages([]);
      setIsParsing(false);
    }
  }, [open]);

  const handleParse = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some text to parse into invoice items",
        variant: "destructive"
      });
      return;
    }
    
    // Close any potentially open keyboard on mobile
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsParsing(true);
    try {
      const items = await parseInvoiceLines(text);
      
      if (items.length > 0) {
        onItemsParsed(items);
        onOpenChange(false);
        
        toast({
          title: "Parsing Complete",
          description: `Successfully parsed ${items.length} items from your text`,
        });
      } else {
        toast({
          title: "No Items Found",
          description: "Could not identify any invoice items in the provided text",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error parsing invoice items:", error);
      toast({
        title: "Parsing Error",
        description: "An error occurred while parsing the items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleJobDescriptionParse = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter a job description to generate invoice items",
        variant: "destructive"
      });
      return;
    }

    // Close any potentially open keyboard on mobile
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsParsing(true);
    
    let processingMessages = [
      "Analyzing project requirements...",
      "Breaking down deliverables...",
      "Estimating professional market rates...",
      "Generating detailed line items...",
      "Finalizing invoice components..."
    ];
    
    setResponseMessages([processingMessages[0]]);
    
    // Show processing messages to improve user experience
    let messageIndex = 1;
    const messageInterval = setInterval(() => {
      if (messageIndex < processingMessages.length) {
        setResponseMessages(prev => [...prev, processingMessages[messageIndex]]);
        messageIndex++;
      } else {
        clearInterval(messageInterval);
      }
    }, 800);
    
    // Add debugging
    console.log("Processing job description:", jobDescription);
    
    try {
      // Call the server API that uses OpenAI
      const response = await fetch('/api/generate-invoice-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: jobDescription
        }),
      });
      
      // Clear the message interval
      clearInterval(messageInterval);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convert server response to ParsedInvoiceItem format
      let parsedItems: ParsedInvoiceItem[] = [];
      
      if (data && data.items && Array.isArray(data.items)) {
        parsedItems = data.items.map((item: any) => ({
          id: Math.random().toString(36).substring(2, 9),
          description: item.description,
          quantity: item.quantity || 1,
          price: item.price || 0
        }));
        
        setResponseMessages(prev => [...prev, 
          "Invoice generated with professional construction industry pricing!",
          `Created ${parsedItems.length} detailed invoice items with market-rate pricing.`
        ]);
      } else {
        throw new Error('Invalid response format from server');
      }
      
      // If we didn't get any items, show an error
      if (parsedItems.length === 0) {
        toast({
          title: "No Items Generated",
          description: "The AI couldn't generate invoice items. Please try a more detailed description.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Setting parsed items:", parsedItems);
      
      // Pass the items back to the parent component
      onItemsParsed(parsedItems);
      onOpenChange(false);
      
      // Show success toast
      toast({
        title: "Invoice Generated",
        description: `Created ${parsedItems.length} detailed invoice items with professional pricing`,
      });
    } catch (error) {
      console.error("Error generating invoice items:", error);
      
      // Show error toast
      toast({
        title: "Generation Error",
        description: "Failed to generate invoice items. Please try again.",
        variant: "destructive"
      });
      
      // Clear the message interval
      clearInterval(messageInterval);
      
      // Add error message to the UI
      setResponseMessages(prev => [...prev, "Error generating invoice items. Please try again."]);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice Items</DialogTitle>
          <DialogDescription>
            Create invoice items by either entering existing text or generating new items from a job description
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text-parser">Parse Text</TabsTrigger>
            <TabsTrigger value="job-description">Generate from Job</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text-parser" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2">
                  Paste your text below. It can be text from existing quotes, line items, or project descriptions.
                </p>
                <Textarea
                  placeholder="Paste text with line items, prices, etc."
                  rows={8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="resize-none"
                />
              </div>
            </div>
            
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isParsing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleParse}
                disabled={isParsing || !text.trim()}
                className="sm:w-24"
              >
                {isParsing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Parsing
                  </span>
                ) : "Parse"}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="job-description" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-2">
                  Enter a detailed job description and we'll generate professional invoice items for you
                </p>
                <Textarea
                  placeholder="Describe the job in detail (e.g., 'Build a 400 sq. ft. pressure-treated deck with composite decking, railings, and stairs')"
                  rows={8}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="resize-none"
                />
              </div>
              
              {responseMessages.length > 0 && (
                <div className="p-4 border rounded-md bg-muted/20">
                  <h4 className="text-sm font-medium mb-2">Generation Progress:</h4>
                  <ul className="space-y-2">
                    {responseMessages.map((message, index) => (
                      <li key={index} className="text-sm">
                        {index === responseMessages.length - 1 ? (
                          <span className="flex items-center">
                            <svg className="animate-pulse mr-2 h-2 w-2 fill-current" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                            {message}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <svg className="mr-2 h-2 w-2 text-green-500 fill-current" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                            {message}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isParsing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleJobDescriptionParse}
                disabled={isParsing || !jobDescription.trim()}
                className="sm:w-24"
              >
                {isParsing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating
                  </span>
                ) : "Generate"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}