import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocation } from "wouter";
import { Shield, FileText, AlertTriangle } from "lucide-react";

export default function LegalHub() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Legal Documentation</CardTitle>
          <CardDescription>
            Review our legal documents regarding the use of our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            As a beta user of our Business Management Platform, it's important to understand the terms, conditions, and policies that govern your use of our services. Please review these documents carefully.
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-6">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-400 text-md flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" /> BETA PROGRAM NOTICE
            </h3>
            <p className="mt-2">
              You are participating in our Beta Program. Beta software is still under development and may contain bugs, errors, and other issues. By using this platform, you acknowledge the experimental nature of the service.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5" /> Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The rules and guidelines for using our platform, including user responsibilities and company obligations.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setLocation("/legal/terms")}
            >
              View Terms
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Shield className="mr-2 h-5 w-5" /> Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              How we collect, use, and protect your data, including details about beta-specific data collection.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setLocation("/legal/privacy")}
            >
              View Privacy Policy
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <AlertTriangle className="mr-2 h-5 w-5" /> Legal Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Important limitations of liability and disclaimers regarding the use of our platform during the beta phase.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setLocation("/legal/disclaimers")}
            >
              View Disclaimers
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="flex justify-center mt-8">
        <Button variant="outline" onClick={() => setLocation("/login")}>
          Back to Login
        </Button>
      </div>
    </div>
  );
}