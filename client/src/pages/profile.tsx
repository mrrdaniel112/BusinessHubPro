import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Profile() {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  
  // Calculate trial end date
  const trialEndDate = user?.trialEndsAt ? format(new Date(user.trialEndsAt), 'MMMM d, yyyy') : 'Not applicable';
  
  // Avatar fallback text (initials)
  const getInitials = () => {
    if (!user?.name) return "U";
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Subscription badge color
  const getSubscriptionBadge = () => {
    if (!user?.subscriptionStatus) return null;
    
    switch(user.subscriptionStatus) {
      case 'trial':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Trial</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Active</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Expired</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="flex flex-col items-center text-center pb-2">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <CardTitle>{user?.name || "User Name"}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {getSubscriptionBadge()}
                {user?.role === 'admin' && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Admin</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">{user?.email || "email@example.com"}</p>
              <div className="mt-4 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Member since:</span>
                  <span>March 2025</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Subscription:</span>
                  <span>{user?.subscriptionStatus || "Not subscribed"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Trial ends:</span>
                  <span>{trialEndDate}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Change Avatar</Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Settings Tabs */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="mt-4 space-y-4">
                  {editMode ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" defaultValue={user?.name?.split(' ')[0] || ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" defaultValue={user?.name?.split(' ')[1] || ""} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={user?.email || ""} />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input id="company" placeholder="Your Business Name" />
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
                        <Button onClick={() => setEditMode(false)}>Save Changes</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Personal Information</h3>
                        <Separator className="my-2" />
                        <dl className="divide-y divide-gray-200">
                          <div className="py-3 grid grid-cols-3">
                            <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                            <dd className="text-sm col-span-2">{user?.name || "User Name"}</dd>
                          </div>
                          <div className="py-3 grid grid-cols-3">
                            <dt className="text-sm font-medium text-muted-foreground">Email Address</dt>
                            <dd className="text-sm col-span-2">{user?.email || "email@example.com"}</dd>
                          </div>
                          <div className="py-3 grid grid-cols-3">
                            <dt className="text-sm font-medium text-muted-foreground">Company</dt>
                            <dd className="text-sm col-span-2">Your Business</dd>
                          </div>
                        </dl>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <Button variant="outline" onClick={() => setEditMode(true)}>Edit Profile</Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="password" className="mt-4 space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button>Update Password</Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="billing" className="mt-4 space-y-4">
                  <div className="rounded-md bg-primary-50 p-4 border border-primary-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-primary-700">Current Plan: Basic</h3>
                        <p className="text-sm text-primary-600 mt-1">$25/month, billed monthly</p>
                      </div>
                      <Badge className="bg-primary-100 text-primary-800 border-primary-300">{user?.subscriptionStatus === 'trial' ? 'Trial' : 'Active'}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Payment Method</h3>
                    <div className="flex items-center space-x-3 p-3 bg-muted rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                      <div>
                        <div className="font-medium">Visa ending in 4242</div>
                        <div className="text-sm text-muted-foreground">Expires 12/2027</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Billing History</h3>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-3 p-3 text-sm font-medium border-b">
                        <div>Date</div>
                        <div>Amount</div>
                        <div className="text-right">Status</div>
                      </div>
                      <div className="grid grid-cols-3 p-3 text-sm border-b">
                        <div>Mar 1, 2025</div>
                        <div>$25.00</div>
                        <div className="text-right"><Badge variant="outline" className="bg-green-50 text-green-600">Paid</Badge></div>
                      </div>
                      <div className="grid grid-cols-3 p-3 text-sm">
                        <div>Feb 1, 2025</div>
                        <div>$25.00</div>
                        <div className="text-right"><Badge variant="outline" className="bg-green-50 text-green-600">Paid</Badge></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}