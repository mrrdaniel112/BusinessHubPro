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

    setIsParsing(true);
    setResponseMessages([]);
    
    try {
      // First try to use our global window.puter object if it exists
      // This provides a streaming experience for the user
      if (typeof window !== 'undefined' && window.puter?.ai?.chat) {
        setResponseMessages(["Generating invoice items from your description..."]);
        
        // Use Puter's streaming chat
        const prompt = `
        You are a professional invoice generator. I need you to create accurate, realistic line items for an invoice based on this job description:
        
        "${jobDescription}"
        
        Generate 3-8 detailed line items with the following format for EACH line item:
        - Description: [detailed service description]
        - Quantity: [numerical quantity]
        - Price: [numerical dollar amount]
        
        For each item:
        1. Create a detailed, specific description
        2. Provide a reasonable quantity (usually 1 for services, more for physical items)
        3. Assign a realistic price in USD ($ format not needed)
        
        Return ONLY the line items in the exact format below, with one item per line:
        Description | Quantity | Price
        
        For example:
        Website design and development | 1 | 3500
        Custom logo creation | 1 | 800
        Content writing (5 pages) | 5 | 200
        `;
        
        // Stream the response
        let fullResponse = "";
        await window.puter.ai.chat(prompt, {
          onPartialResponse: (partialResponse: string) => {
            // Show streaming responses
            fullResponse += partialResponse;
            setResponseMessages([fullResponse]);
          }
        });
        
        // Parse the streamed response
        const parsedItems = parseStreamedResponse(fullResponse);
        if (parsedItems.length > 0) {
          onItemsParsed(parsedItems);
          onOpenChange(false);
          
          toast({
            title: "Invoice Generation Complete",
            description: `Successfully generated ${parsedItems.length} invoice items`,
          });
        } else {
          throw new Error("Could not parse AI response");
        }
      } else {
        // Fallback to parseInvoiceLines which uses simpler parsing
        const items = await parseInvoiceLines(jobDescription);
        
        if (items.length > 0) {
          onItemsParsed(items);
          onOpenChange(false);
          
          toast({
            title: "Invoice Generation Complete",
            description: `Successfully generated ${items.length} invoice items from your description`,
          });
        } else {
          toast({
            title: "No Items Generated",
            description: "Could not generate invoice items from your description",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error generating invoice items:", error);
      toast({
        title: "Generation Error",
        description: "An error occurred while generating the invoice items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsParsing(false);
    }
  };

  const parseStreamedResponse = (text: string): ParsedInvoiceItem[] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const items: ParsedInvoiceItem[] = [];
    
    for (const line of lines) {
      // Skip header or non-data lines
      if (line.includes("Description | Quantity | Price") || 
          line.includes("---") || 
          line.includes("For example")) {
        continue;
      }
      
      // Try to parse using pipe delimiter first
      const pipeMatch = line.split('|').map(s => s.trim());
      if (pipeMatch && pipeMatch.length >= 3) {
        const [description, quantityStr, priceStr] = pipeMatch;
        const quantity = parseInt(quantityStr, 10) || 1;
        const price = parseFloat(priceStr.replace(/\$|,/g, '')) || 0;
        
        if (description && !isNaN(quantity) && !isNaN(price)) {
          items.push({
            id: Math.random().toString(36).substring(2, 9),
            description,
            quantity,
            price
          });
        }
        continue;
      }
      
      // If pipe delimiter fails, try generic pattern matching
      const genericMatch = line.match(/(.+?)(?:\s-\s|\s–\s|\s:\s)?\s*(\d+)\s*(?:x|\*)?\s*[$]?(\d+(?:,\d+)*(?:\.\d+)?)/i);
      if (genericMatch) {
        const [, description, quantityStr, priceStr] = genericMatch;
        const quantity = parseInt(quantityStr, 10) || 1;
        const price = parseFloat(priceStr.replace(/,/g, '')) || 0;
        
        if (description && !isNaN(quantity) && !isNaN(price)) {
          items.push({
            id: Math.random().toString(36).substring(2, 9),
            description: description.trim(),
            quantity,
            price
          });
        }
        continue;
      }
      
      // Last attempt - just use the whole line as a description
      if (line.trim().length > 0) {
        items.push({
          id: Math.random().toString(36).substring(2, 9),
          description: line.trim(),
          quantity: 1,
          price: 1500 // Default price
        });
      }
    }
    
    return items;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI-Powered Invoice Items</DialogTitle>
          <DialogDescription>
            Generate invoice items using AI or parse them from structured text.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="job-description">
              <i className="ri-magic-line mr-2"></i> 
              Generate from Job Description
            </TabsTrigger>
            <TabsTrigger value="text-parser">
              <i className="ri-text-wrap mr-2"></i>
              Parse Formatted Text
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="job-description" className="space-y-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Describe the job or project in detail, and AI will generate appropriate invoice items automatically.
              </p>
              <Textarea
                placeholder="E.g., I need a professional website for my small business that includes 5 pages, a contact form, and a responsive design. I also need a logo design and some custom icons."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[150px]"
              />
              
              {responseMessages.length > 0 && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md border">
                  <h4 className="text-sm font-medium mb-1">AI Response:</h4>
                  <div className="text-sm whitespace-pre-wrap">
                    {responseMessages.map((msg, i) => (
                      <p key={i}>{msg}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="text-parser" className="space-y-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Enter text with one item per line. Format: "Description $Price" or "Quantity x Description $Price"
              </p>
              <Textarea
                placeholder="Website design $2500
10x Custom icons $50
Content creation - $1500"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={currentTab === "text-parser" ? handleParse : handleJobDescriptionParse}
            disabled={isParsing}
          >
            {isParsing ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="ri-magic-line mr-2"></i>
                {currentTab === "text-parser" ? "Parse Items" : "Generate Invoice Items"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}