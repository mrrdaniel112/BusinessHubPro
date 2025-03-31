import { useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, X } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user, updateProfilePicture } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Feedback state
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string[]>([]);
  
  // Calculate trial end date
  const trialEndDate = user?.trialEndsAt ? format(new Date(user.trialEndsAt), 'MMMM d, yyyy') : 'Not applicable';
  
  // Avatar fallback text (initials)
  const getInitials = () => {
    if (!user?.name) return "U";
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Profile picture handling
  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  
  // Handle profile picture upload
  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const imageDataUrl = e.target.result.toString();
          
          try {
            // Update profile picture in auth context
            await updateProfilePicture(imageDataUrl);
            
            toast({
              title: "Profile Picture Updated",
              description: "Your profile picture has been updated successfully.",
            });
          } catch (error) {
            console.error('Error updating profile picture:', error);
            toast({
              title: "Update Failed",
              description: error instanceof Error ? error.message : "Something went wrong updating your profile picture",
              variant: "destructive",
            });
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPEG, PNG, etc.).",
        variant: "destructive",
      });
    }
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
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string);
            setUploadedFilePreview([...uploadedFilePreview, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
    
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };
  
  // Remove uploaded file
  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    const newPreviews = [...uploadedFilePreview];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setUploadedFiles(newFiles);
    setUploadedFilePreview(newPreviews);
  };
  
  // Submit feedback
  const submitFeedback = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Missing feedback",
        description: "Please provide some feedback before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    // Here you would normally upload the files to a server and send the feedback
    // For now, we'll just show a success message
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback! We'll review it soon.",
    });
    
    // Reset form
    setFeedback('');
    setFeedbackType('suggestion');
    setUploadedFiles([]);
    setUploadedFilePreview([]);
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
                <AvatarImage src={user?.profilePicture || ""} />
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
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => profilePictureInputRef.current?.click()}
              >
                Change Avatar
              </Button>
              <input
                ref={profilePictureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureUpload}
              />
            </CardFooter>
          </Card>
          
          {/* Feedback Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Provide Feedback</CardTitle>
              <CardDescription>
                Help us improve by sharing your thoughts or reporting issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback-type">Feedback Type</Label>
                <select 
                  id="feedback-type"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="criticism">Criticism</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback-text">Your Feedback</Label>
                <Textarea 
                  id="feedback-text"
                  placeholder={feedbackType === 'bug' ? 
                    "Please describe the issue in detail, including steps to reproduce..." : 
                    "Tell us what you think or what you'd like to see improved..."
                  }
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                />
              </div>
              
              <div>
                <Label className="block mb-2">Attach Screenshots (Optional)</Label>
                <div
                  className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click to upload screenshot
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    multiple
                  />
                </div>
                
                {uploadedFilePreview.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {uploadedFilePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={preview} 
                          alt={`Preview ${index}`} 
                          className="w-full h-auto rounded-md object-cover aspect-video"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={submitFeedback} className="w-full">
                Submit Feedback
              </Button>
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