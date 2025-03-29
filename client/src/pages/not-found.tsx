import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="pt-6 px-4 md:px-6">
          <div className="flex flex-col sm:flex-row mb-4 gap-2 items-center sm:items-start">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2 sm:mb-0" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left mobile-text-adjust">
              404 Page Not Found
            </h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 text-center sm:text-left pb-2 mobile-text-adjust">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="mt-6 flex justify-center sm:justify-start">
            <a 
              href="/"
              className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium touch-target inline-flex items-center justify-center"
            >
              Back to Home
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
