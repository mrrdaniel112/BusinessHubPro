import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { parseInvoiceLines, ParsedInvoiceItem } from "../ai/puter-invoice-parser";

interface ParseInvoiceItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemsParsed: (items: ParsedInvoiceItem[]) => void;
}

export function ParseInvoiceItemsDialog({
  open,
  onOpenChange,
  onItemsParsed,
}: ParseInvoiceItemsDialogProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const parsedItems = await parseInvoiceLines(inputText);
      
      if (parsedItems && parsedItems.length > 0) {
        onItemsParsed(parsedItems);
        onOpenChange(false);
        setInputText(""); // Clear input after successful parsing
      } else {
        setError("No items could be parsed from the text. Please try a different format.");
      }
    } catch (err) {
      console.error("Error parsing invoice items:", err);
      setError("Failed to parse items. Please try again or enter items manually.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Parse Invoice Items</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Paste text containing line items, and we'll automatically extract them into your invoice.
          </p>
          <Textarea
            placeholder="Web design - $2,500&#10;Logo design - $750&#10;5x Consultation hours @ $150"
            className="min-h-[150px]"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="flex space-x-2 sm:space-x-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleParse} disabled={!inputText.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing...
              </>
            ) : (
              "Parse Items"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}