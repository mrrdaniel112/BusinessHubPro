import { useIsMobile } from "@/hooks/use-mobile";
import { PuterChat } from "@/components/ai/puter-chat";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// List of example questions the user can ask
const EXAMPLE_QUESTIONS = [
  "What steps should I take to improve my business's cash flow?",
  "How do I create an effective marketing strategy for a small business?",
  "What are the best practices for managing inventory?",
  "How can I reduce my business expenses without affecting quality?",
  "What should I include in a professional business proposal?",
  "What are common tax deductions for small businesses?",
  "How can I analyze my financial statements to make better decisions?",
  "What are effective customer retention strategies?",
  "How do I price my products/services competitively?",
  "What's the best way to handle difficult client conversations?"
];

export default function BusinessAssistant() {
  const isMobile = useIsMobile();

  // Dynamically adjust the number of questions to show based on screen size
  const questionsToShow = isMobile ? 4 : 6;

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Business Assistant</h1>
          <p className="text-slate-500 mt-1">
            Get AI-powered advice and insights for your business
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left side - Suggested questions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-lg border shadow-sm">
            <h3 className="font-medium text-lg mb-3 text-primary-600">Example Questions</h3>
            <div className="space-y-2">
              {EXAMPLE_QUESTIONS.map((question, index) => (
                <SuggestedQuestion key={index} question={question} />
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-5 rounded-lg border shadow-sm">
            <h3 className="font-medium text-lg mb-3">About this Assistant</h3>
            <p className="text-sm text-slate-600 mb-3">
              This AI-powered business assistant can help you with various aspects of running your business:
            </p>
            <ul className="text-sm text-slate-600 space-y-1 list-disc pl-4">
              <li>Business strategy and planning</li>
              <li>Marketing and sales advice</li>
              <li>Financial management tips</li>
              <li>Operations and logistics</li>
              <li>Human resources guidance</li>
              <li>Legal and compliance information</li>
            </ul>
          </div>
        </div>
        
        {/* Right side - Chat interface */}
        <div className="lg:col-span-3 h-[70vh]">
          <PuterChat />
        </div>
      </div>
    </div>
  );
}

function SuggestedQuestion({ question }: { question: string }) {
  // Calculate a truncated version for mobile
  const truncatedQuestion = question.length > 40 ? question.slice(0, 38) + '...' : question;
  const isMobile = useIsMobile();
  
  // Handle click to send the question to chat
  const sendQuestion = () => {
    // Create a custom event to communicate with the PuterChat component
    const event = new CustomEvent('sendToPuterChat', { detail: { message: question } });
    document.dispatchEvent(event);
  };
  
  return (
    <Button
      variant="outline"
      className="w-full justify-start text-left font-normal p-3 h-auto hover:bg-primary-50 hover:border-primary-200"
      onClick={sendQuestion}
    >
      <i className="ri-question-line mr-2 text-primary-500"></i>
      <span className={cn("text-sm", isMobile ? "line-clamp-2" : "")}>
        {isMobile ? truncatedQuestion : question}
      </span>
    </Button>
  );
}