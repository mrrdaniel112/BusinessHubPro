import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, DollarSign, User, Settings, Shield, Database, X, Check, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Interface for user data structure
interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
}

// Interface for available roles
interface RolesData {
  roles: string[];
}

// User Management Dialog Component
function UserManagementDialog({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [users, setUsers] = useState<UserData[]>([
    { id: 1, username: "admin", email: "admin@example.com", role: "admin" },
    { id: 2, username: "user1", email: "user1@example.com", role: "user" },
    { id: 3, username: "manager1", email: "manager@example.com", role: "manager" }
  ]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    "admin", "manager", "accountant", "user", "viewer", "guest"
  ]);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch available roles
  const fetchRoles = async () => {
    try {
      const response = await apiRequest("GET", "/api/roles");
      const data: RolesData = await response.json();
      setAvailableRoles(data.roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      // Keep using the default roles if fetch fails
    }
  };

  // Fetch users - in a real app, this would come from the API
  const fetchUsers = async () => {
    // This is a placeholder for a real API call
    // In a production app, we would fetch users from the backend
    // For now, we'll use the mock data already set in state
  };

  // Handle role update
  const handleRoleUpdate = async () => {
    if (!selectedUser || !selectedRole) return;
    
    setLoading(true);
    try {
      const response = await apiRequest(
        "PATCH", 
        `/api/users/${selectedUser.id}/role`,
        { role: selectedRole }
      );
      
      const updatedUser = await response.json();
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user.id === updatedUser.id ? {...user, role: updatedUser.role} : user
      ));
      
      toast({
        title: "Role Updated",
        description: `${selectedUser.username}'s role has been updated to ${selectedRole}`,
      });
      
      setShowRoleDialog(false);
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update user role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Open role management dialog for a user
  const openRoleManagement = (user: UserData) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setShowRoleDialog(true);
  };

  // Initial data fetch
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchUsers();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" /> User Management
          </DialogTitle>
          <DialogDescription>
            View and manage user roles and permissions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'manager' ? 'bg-blue-100 text-blue-800' : 
                            user.role === 'accountant' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openRoleManagement(user)}
                      >
                        Manage Role
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Role Management Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>
              Change the role for user {selectedUser?.username}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={selectedUser?.username || ""}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select 
                value={selectedRole} 
                onValueChange={setSelectedRole}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate} disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent" />
                  Updating...
                </span>
              ) : (
                "Update Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showUserManagement, setShowUserManagement] = useState(false);
  
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
    if (action === "User Management") {
      setShowUserManagement(true);
    } else {
      toast({
        title: "Admin Action",
        description: `${action} action triggered successfully`,
      });
    }
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
      
      {/* User Management Dialog */}
      <UserManagementDialog 
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
      />
    </div>
  );
}