import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function Login() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false, // Will be validated on submit through the refine rule
    },
  });

  const { login, signup, createAdminUser, isLoading: authLoading } = useAuth();
  
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null); // Clear any previous errors
    
    try {
      await login(data.email, data.password);
      // The auth context will redirect to / after successful login
    } catch (error: any) {
      console.error("Login error:", error);
      // Display the error message to the user
      setLoginError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  
  const onSignupSubmit = async (data: SignupFormValues) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Show payment form after successful validation
      setShowPaymentForm(true);
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Get the form data for the signup process
      const userData = signupForm.getValues();
      // Call the signup function from auth context
      await signup(userData);
      // Auth context will handle redirecting to dashboard after successful signup
    } catch (error) {
      console.error("Payment processing error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">Business Platform</h1>
        </div>
        
        {showPaymentForm ? (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription>
                Start your 14-day free trial today. $25/month after trial period.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onPaymentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <FormLabel htmlFor="cardName">Name on Card</FormLabel>
                  <Input id="cardName" placeholder="John Smith" required />
                </div>
                
                <div className="space-y-2">
                  <FormLabel htmlFor="cardNumber">Card Number</FormLabel>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel htmlFor="expiryDate">Expiry Date</FormLabel>
                    <Input id="expiryDate" placeholder="MM/YY" required />
                  </div>
                  <div className="space-y-2">
                    <FormLabel htmlFor="cvc">CVC</FormLabel>
                    <Input id="cvc" placeholder="123" required />
                  </div>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    By completing your purchase, you agree to our Terms of Service and Privacy Policy.
                    Your 14-day free trial starts today. You won't be charged until the trial ends.
                  </p>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox id="trialConsent" required />
                    <label htmlFor="trialConsent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I understand that I'll be charged $25 per month after my trial unless I cancel
                    </label>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Start 14-Day Free Trial"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center w-full">
                <button 
                  onClick={() => setShowPaymentForm(false)}
                  className="text-sm text-gray-500 hover:text-primary-600"
                >
                  Back to signup
                </button>
              </div>
              <div className="flex justify-center space-x-2">
                <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
                  <rect width="38" height="24" rx="4" fill="#E6E6E6"/>
                  <path d="M10.2969 16.9719H7.375L9.28125 7.01562H12.2031L10.2969 16.9719Z" fill="#3C4043"/>
                  <path d="M20.0625 7.26562C19.4688 7.03125 18.75 6.76562 17.875 6.76562C15.5 6.76562 13.8125 8.04688 13.8125 9.95312C13.8125 11.4062 14.9844 12.2031 15.9375 12.6875C16.8906 13.1719 17.2031 13.5 17.2031 13.9219C17.2031 14.5469 16.4844 14.8594 15.8125 14.8594C14.9375 14.8594 14.0156 14.5781 13.2969 14.2031L12.9219 14.0156L12.5156 16.5625C13.2344 16.875 14.5469 17.1406 15.9062 17.1562C18.4531 17.1562 20.1094 15.8906 20.125 13.8594C20.125 12.7031 19.4531 11.8125 18.0156 11.0625C17.1406 10.5938 16.6094 10.2656 16.6094 9.79688C16.625 9.375 17.0938 8.95312 18.0781 8.95312C18.8594 8.92188 19.4375 9.125 19.875 9.32812L20.125 9.45312L20.5312 7.01562L20.0625 7.26562Z" fill="#3C4043"/>
                  <path d="M25.9375 7.01562H23.7188C23.125 7.01562 22.6875 7.17188 22.4219 7.76562L19.2812 16.9844H21.8281L22.3125 15.6094L25 15.625C25.0625 16.0781 25.3125 16.9844 25.3125 16.9844H27.5781L25.9375 7.01562ZM23 13.5781C23.2188 12.9844 24.2031 10.25 24.2031 10.25C24.1875 10.2656 24.3906 9.73438 24.5 9.40625L24.6719 10.1562C24.6719 10.1562 25.2656 13.0781 25.375 13.5781H23Z" fill="#3C4043"/>
                  <path d="M32 7.01562L29.625 13.5156L29.4062 12.3906C29 10.9219 27.6875 9.3125 26.25 8.48438L28.375 16.9688H30.9375L34.5781 7.01562H32Z" fill="#3C4043"/>
                </svg>
                <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
                  <rect width="38" height="24" rx="4" fill="#E6E6E6"/>
                  <path d="M23.751 11.9948C23.751 14.979 21.364 17.3663 18.3797 17.3663C15.3954 17.3663 13.0085 14.979 13.0085 11.9948C13.0085 9.01056 15.3954 6.62329 18.3797 6.62329C21.364 6.62329 23.751 9.01056 23.751 11.9948Z" fill="#EB001B"/>
                  <path d="M24.9902 6.62329V6.63292H24.9709L24.251 6.63292L24.251 6.62329H23.9699H13.7891V6.63292H13.7698L13.0499 6.63292L13.0499 6.62329H12.7688V17.3663H13.0499L13.0499 17.3567H13.7698L13.7891 17.3663H23.9699V17.3567H24.251L24.9709 17.3567L24.9902 17.3663H25.2713V6.62329H24.9902Z" fill="#FF5F00"/>
                  <path d="M30.5002 11.9948C30.5002 14.979 28.1133 17.3663 25.129 17.3663C23.7522 17.3663 22.5069 16.8529 21.5918 16.0127C23.1558 14.6405 24.1197 12.4403 24.1197 9.97687C24.1197 7.51346 23.1558 5.31322 21.5918 3.94104C22.5069 3.10081 23.7522 2.58737 25.129 2.58737C28.1133 2.58737 30.5002 4.97464 30.5002 7.95885V11.9948Z" fill="#F79E1B"/>
                </svg>
                <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
                  <rect width="38" height="24" rx="4" fill="#E6E6E6"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M11.84 15.2754C11.84 15.5074 12.0289 15.6963 12.2609 15.6963H14.1204C14.3523 15.6963 14.5412 15.5074 14.5412 15.2754V8.74242C14.5412 8.5104 14.3523 8.32153 14.1204 8.32153H12.2609C12.0289 8.32153 11.84 8.5104 11.84 8.74242V15.2754Z" fill="#3C4043"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M15.1836 12.007C15.1836 13.7566 16.5979 15.291 18.3874 15.291C19.1633 15.291 19.8793 15.0069 20.4325 14.5216V15.2751C20.4325 15.5071 20.6214 15.696 20.8534 15.696H22.6732C22.9052 15.696 23.0941 15.5071 23.0941 15.2751V8.74199C23.0941 8.50999 22.9052 8.32111 22.6732 8.32111H20.8534C20.6214 8.32111 20.4325 8.50999 20.4325 8.74199V9.49252C19.8793 9.00721 19.1633 8.72308 18.3874 8.72308C16.5979 8.72308 15.1836 10.2574 15.1836 12.007ZM17.8451 12.007C17.8451 11.5916 18.1819 11.2548 18.5973 11.2548C19.0127 11.2548 19.3495 11.5916 19.3495 12.007C19.3495 12.4224 19.0127 12.7591 18.5973 12.7591C18.1819 12.7591 17.8451 12.4224 17.8451 12.007Z" fill="#3C4043"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M24.7949 12.0069C24.7949 13.8065 26.129 15.3909 27.9685 15.3909C28.8249 15.3909 29.5977 15.0768 30.1887 14.5359V15.2749C30.1887 15.5069 30.3776 15.6958 30.6096 15.6958H32.4294C32.6613 15.6958 32.8502 15.5069 32.8502 15.2749V8.74182C32.8502 8.50982 32.6613 8.32094 32.4294 8.32094H30.6096C30.3776 8.32094 30.1887 8.50982 30.1887 8.74182V9.48077C29.5977 8.93992 28.8249 8.62579 27.9685 8.62579C26.129 8.62579 24.7949 10.2073 24.7949 12.0069ZM27.4564 12.0069C27.4564 11.5914 27.7932 11.2547 28.2086 11.2547C28.624 11.2547 28.9608 11.5914 28.9608 12.0069C28.9608 12.4223 28.624 12.759 28.2086 12.759C27.7932 12.759 27.4564 12.4223 27.4564 12.0069Z" fill="#3C4043"/>
                  <path d="M13.191 11.9949C13.191 10.6306 13.884 9.40869 14.9613 8.66833C14.1049 7.8621 12.926 7.36694 11.6304 7.36694C9.28024 7.36694 7.375 9.27218 7.375 11.6224C7.375 13.9726 9.28024 15.8778 11.6304 15.8778C12.926 15.8778 14.1049 15.3827 14.9613 14.5764C13.884 13.8361 13.191 12.6142 13.191 11.2498V11.9949Z" fill="#3C4043"/>
                </svg>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your business dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="name@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-0 pt-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal">
                                Remember me
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {loginError && (
                        <div className="p-3 mb-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
                          {loginError}
                        </div>
                      )}
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <div className="text-center text-sm text-gray-500">
                    <a href="#" className="text-primary-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="w-full border-t border-gray-200 my-1"></div>
                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsLoading(true);
                        createAdminUser()
                          .catch(e => console.error("Admin login failed:", e))
                          .finally(() => setIsLoading(false));
                      }}
                      className="text-xs text-gray-500 hover:text-primary-600"
                    >
                      Admin Login
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Start your 14-day free trial today. $25/month after trial period.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                      <FormField
                        control={signupForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="name@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={signupForm.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal">
                                I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Processing..." : "Continue to Payment"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-center w-full text-gray-500">
                    By signing up, you'll get a 14-day free trial with full access to all features.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}