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
    setResponseMessages(["Analyzing your project requirements..."]);
    
    try {
      // First try to use our global window.puter object if it exists
      // This provides a streaming experience for the user
      if (typeof window !== 'undefined' && window.puter?.ai?.chat) {
        // Enhanced prompt for better results
        const prompt = `
        You are a financial expert with decades of experience creating detailed, accurate invoices for professional services. 
        
        I need you to create realistic, market-rate line items for an invoice based on this job description:
        
        "${jobDescription}"
        
        IMPORTANT GUIDELINES:
        1. Break down the project into 4-8 specific, detailed line items that would be needed to complete it
        2. Each line item must have:
           - A highly detailed description (at least 8-10 words) that clearly specifies the exact deliverable
           - An appropriate quantity (usually 1 for services, more for physical items or time-based work)
           - A professional, market-competitive price in USD that reflects the real value of that item
        3. Be extremely specific to the exact project described - avoid generic descriptions
        4. Use industry-standard terminology and realistic pricing for each component
        5. Ensure the complete invoice covers ALL aspects of the project as described
        
        Return ONLY the line items in EXACTLY this format (one item per line):
        Description | Quantity | Price
        
        For example:
        Custom responsive website design with mobile-first architecture and brand integration | 1 | 3500
        Professional logo design with brand style guide and multiple format deliverables | 1 | 850
        Technical SEO implementation with schema markup and performance optimization | 1 | 1200
        
        DO NOT include any other text, explanations, or headings in your response.
        `;
        
        // Stream the response with improved UI feedback
        let fullResponse = "";
        let processingMessages = [
          "Analyzing project requirements...",
          "Breaking down deliverables...",
          "Estimating professional market rates...",
          "Generating detailed line items...",
          "Finalizing invoice components..."
        ];
        
        // Show processing messages to improve user experience
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
          if (messageIndex < processingMessages.length) {
            setResponseMessages(prev => [...prev, processingMessages[messageIndex]]);
            messageIndex++;
          } else {
            clearInterval(messageInterval);
          }
        }, 800);
        
        // Use Puter's streaming chat with improved response handling
        await window.puter.ai.chat(prompt, {
          onPartialResponse: (partialResponse: string) => {
            // Show streaming responses once we start getting real content
            fullResponse += partialResponse;
            if (fullResponse.includes("|")) {
              // Clear the interval once we get actual content
              clearInterval(messageInterval);
              setResponseMessages([fullResponse]);
            }
          }
        });
        
        // Clear interval in case it's still running
        clearInterval(messageInterval);
        
        // Parse the streamed response with improved validation
        const parsedItems = parseStreamedResponse(fullResponse);
        if (parsedItems.length > 0) {
          // Success path - items generated successfully
          onItemsParsed(parsedItems);
          onOpenChange(false);
          
          toast({
            title: "Invoice Generation Complete",
            description: `Successfully generated ${parsedItems.length} professional invoice items`,
          });
        } else {
          // Try alternate parsing as a fallback before giving up
          const fallbackItems = await parseInvoiceLines(fullResponse);
          if (fallbackItems.length > 0) {
            onItemsParsed(fallbackItems);
            onOpenChange(false);
            
            toast({
              title: "Invoice Generation Complete",
              description: `Successfully generated ${fallbackItems.length} invoice items from your description`,
            });
          } else {
            throw new Error("Could not parse AI response");
          }
        }
      } else {
        // Fallback to parseInvoiceLines which uses simpler parsing
        setResponseMessages(prev => [...prev, "Puter AI not available, using standard parser..."]);
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
            description: "Could not generate invoice items from your description. Please try being more specific about the project details.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error generating invoice items:", error);
      toast({
        title: "Generation Error",
        description: "An error occurred while generating the invoice items. Please try again with a more detailed description.",
        variant: "destructive"
      });
    } finally {
      setIsParsing(false);
    }
  };

  const parseStreamedResponse = (text: string): ParsedInvoiceItem[] => {
    // Clean and prepare the text - remove extra spaces, normalize line breaks
    const cleanText = text.trim()
      .replace(/\r\n/g, '\n')  // Normalize line breaks
      .replace(/\n{3,}/g, '\n\n'); // Remove excessive empty lines
    
    const lines = cleanText.split('\n').filter(line => line.trim() !== '');
    const items: ParsedInvoiceItem[] = [];
    
    // Debug log to help understand what we're parsing
    console.log("Parsing AI response into invoice items:", lines);
    
    for (const line of lines) {
      // Skip header or non-data lines
      if (line.includes("Description | Quantity | Price") || 
          line.includes("---") || 
          line.includes("For example") ||
          line.includes("IMPORTANT") ||
          line.includes("Guidelines") ||
          line.includes("Return ONLY")) {
        continue;
      }
      
      // Try to parse using pipe delimiter first (most reliable format)
      const pipeMatch = line.split('|').map(s => s.trim());
      if (pipeMatch && pipeMatch.length >= 3) {
        const [description, quantityStr, priceStr] = pipeMatch;
        
        // More robust quantity parsing with fallback
        let quantity = 1;
        if (quantityStr) {
          const parsedQuantity = parseInt(quantityStr.replace(/[^\d.]/g, ''), 10);
          quantity = !isNaN(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;
        }
        
        // More robust price parsing
        let price = 0;
        if (priceStr) {
          // Remove any non-numeric characters except decimal points and commas
          const cleanPriceStr = priceStr.replace(/[^\d.,]/g, '').replace(/,/g, '');
          const parsedPrice = parseFloat(cleanPriceStr);
          price = !isNaN(parsedPrice) ? parsedPrice : 1500;
        } else {
          price = 1500; // Default price
        }
        
        // Enhanced validation to ensure we have a proper line item
        if (description && description.length > 2 && quantity > 0 && price > 0) {
          items.push({
            id: Math.random().toString(36).substring(2, 9),
            description,
            quantity,
            price
          });
          continue;
        }
      }
      
      // Second attempt: try to match common formats with regex patterns
      // Format: "Description - $Price" or "Description: $Price" or similar variations
      const pricePattern = line.match(/(.+?)(?:\s-\s|\s–\s|\s:\s)?\s*\$?(\d+(?:,\d+)*(?:\.\d+)?)/i);
      if (pricePattern) {
        const [, description, priceStr] = pricePattern;
        const cleanDesc = description.trim();
        const price = parseFloat(priceStr.replace(/,/g, ''));
        
        if (cleanDesc && !isNaN(price) && price > 0) {
          // Now look for quantity in the description
          const quantityMatch = cleanDesc.match(/(\d+)\s*(?:x|hours|days|units|items)/i);
          const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;
          
          items.push({
            id: Math.random().toString(36).substring(2, 9),
            description: cleanDesc,
            quantity,
            price
          });
          continue;
        }
      }
      
      // Third attempt: Try any remaining numeric patterns that might indicate price and quantity
      const numericPattern = line.match(/(.+?)(?:[\s-:]+)(\d+)(?:[\s-:]+)(\d+(?:,\d+)*(?:\.\d+)?)/i);
      if (numericPattern) {
        const [, description, firstNum, secondNum] = numericPattern;
        // Assume the larger number is the price and the smaller is the quantity
        const num1 = parseInt(firstNum, 10);
        const num2 = parseFloat(secondNum.replace(/,/g, ''));
        
        const quantity = num1 < num2 ? num1 : 1;
        const price = num2 > num1 ? num2 : num1;
        
        if (description && description.trim().length > 0) {
          items.push({
            id: Math.random().toString(36).substring(2, 9),
            description: description.trim(),
            quantity,
            price
          });
          continue;
        }
      }
      
      // Last attempt - if the line is substantial, use it as a description with default values
      // Only do this if we couldn't extract structured data but the line seems to be a legitimate item
      if (line.trim().length > 15 && !line.includes("example") && !line.includes("format")) {
        items.push({
          id: Math.random().toString(36).substring(2, 9),
          description: line.trim(),
          quantity: 1,
          price: 1500 // Default price
        });
      }
    }
    
    // Log what we parsed
    console.log(`Parsed ${items.length} invoice items from AI response`);
    
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