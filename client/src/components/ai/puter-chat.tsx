import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Extend Window interface to include puter property
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, optionsOrSecondArg?: any) => Promise<string>;
      };
      print: (text: string) => void;
    };
  }
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface PuterChatProps {
  initialPrompt?: string;
}

export function PuterChat({ initialPrompt }: PuterChatProps = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPuterAvailable, setIsPuterAvailable] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = useCallback(async (messageText: string = input) => {
    if (!messageText.trim() || isLoading || !isPuterAvailable) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await window.puter.ai.chat(messageText);
      
      // Ensure response is a string
      const responseContent = typeof response === 'string' 
        ? response 
        : JSON.stringify(response);
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: responseContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error from Puter AI:", error);
      
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again later.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isPuterAvailable]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    // Check if Puter AI is available
    const checkPuterAvailability = () => {
      if (window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
        setIsPuterAvailable(true);
        
        // If initialPrompt is provided, send it automatically
        if (initialPrompt) {
          handleSendMessage(initialPrompt);
        }
      } else {
        console.log("Puter AI not available, will check again in 1 second");
        setTimeout(checkPuterAvailability, 1000);
      }
    };

    checkPuterAvailability();
    
    // Handle the custom event from the suggested questions
    function handleCustomEvent(e: Event) {
      const event = e as CustomEvent;
      if (event.detail && 'message' in event.detail) {
        const { message } = event.detail as { message: string };
        handleSendMessage(message);
      }
    }
    
    document.addEventListener('sendToPuterChat', handleCustomEvent);
    
    // Clean up event listener
    return () => {
      document.removeEventListener('sendToPuterChat', handleCustomEvent);
    };
  }, [initialPrompt, handleSendMessage]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden border shadow-sm">
      {!isPuterAvailable && (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mb-4" />
          <p className="text-slate-500">Loading Business Assistant...</p>
        </div>
      )}
      
      {isPuterAvailable && (
        <>
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-500">
                <div className="rounded-full bg-primary-100 p-3 mb-4">
                  <i className="ri-robot-line text-2xl text-primary-600"></i>
                </div>
                <h3 className="font-medium text-lg text-slate-700 mb-2">Business Assistant</h3>
                <p className="max-w-md">
                  Ask questions about your business, get advice on strategy, marketing, finance, 
                  or get help with creating business documents.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex max-w-[80%] rounded-lg p-4",
                    message.role === "user"
                      ? "bg-primary-100 ml-auto"
                      : "bg-slate-100 mr-auto"
                  )}
                >
                  {message.content}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-center space-x-2 bg-slate-100 max-w-[80%] rounded-lg p-4 mr-auto">
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                <span className="text-sm text-slate-500">Thinking...</span>
              </div>
            )}
          </ScrollArea>
          
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your business..."
                className="flex-1 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <Button 
                onClick={() => handleSendMessage()} 
                disabled={isLoading || !input.trim()}
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <i className="ri-send-plane-fill"></i>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}