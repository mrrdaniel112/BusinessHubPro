import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { BarChart, DollarSign, User, Settings, Shield, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Only admin users should be able to access this page
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You do not have permission to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This page is restricted to administrators only. Please contact an administrator if you believe you should have access.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAction = (action: string) => {
    toast({
      title: "Admin Action",
      description: `${action} action triggered successfully`,
    });
  };

  return (
    <div className="pb-safe">
      {/* Admin Dashboard Header */}
      <div className="py-6 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Shield className="mr-2 h-6 w-6" /> Admin Dashboard
              </h1>
              <p className="text-primary-100 mt-1">Manage your business platform</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-primary-800 rounded-full text-xs font-medium">
                Admin Mode
              </span>
              <span className="px-3 py-1 bg-green-700 rounded-full text-xs font-medium">
                System Status: Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg mr-4">
                  <User className="h-8 w-8 text-primary-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">1,254</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-xs text-green-600">↑ 12% from last month</p>
            </CardFooter>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <DollarSign className="h-8 w-8 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Revenue</p>
                  <p className="text-2xl font-bold">$28,650</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-xs text-green-600">↑ 8% from last month</p>
            </CardFooter>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-4">
                  <BarChart className="h-8 w-8 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subscription Rate</p>
                  <p className="text-2xl font-bold">86.2%</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-xs text-green-600">↑ 3% from last month</p>
            </CardFooter>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg mr-4">
                  <Database className="h-8 w-8 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">System Storage</p>
                  <p className="text-2xl font-bold">632 GB</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-xs text-gray-500">42% of capacity used</p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Settings className="mr-2 h-5 w-5" /> Admin Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Add, update, or suspend user accounts. Manage roles and access permissions.
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-end">
              <Button onClick={() => handleAction("User Management")}>Manage Users</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Update system settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Configure email templates, notification settings, and system parameters.
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-end">
              <Button onClick={() => handleAction("System Configuration")}>Configure System</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>Manage pricing and subscription plans</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Update pricing models, features, and subscription durations.
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-end">
              <Button onClick={() => handleAction("Subscription Plans")}>Manage Plans</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>View detailed platform analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Access comprehensive reports on usage, revenue, and user behavior.
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-end">
              <Button onClick={() => handleAction("Analytics")}>View Reports</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage platform content and resources</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Update help resources, FAQs, and platform documentation.
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-end">
              <Button onClick={() => handleAction("Content Management")}>Manage Content</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Maintenance</CardTitle>
              <CardDescription>Perform system maintenance tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Run backups, clear caches, and perform system optimizations.
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex justify-end">
              <Button 
                variant="destructive" 
                onClick={() => handleAction("System Maintenance")}
              >
                Maintenance Mode
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}