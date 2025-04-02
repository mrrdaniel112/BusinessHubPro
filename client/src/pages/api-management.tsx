import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, RefreshCw, Trash2 } from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
  permissions: string[];
};

export default function ApiManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKey, setNewKey] = useState({
    name: "",
    permissions: [] as string[],
  });

  // Mock data - replace with real API calls
  const { data: apiKeys } = useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: async () => {
      return [
        {
          id: "1",
          name: "Production API Key",
          key: "sk_live_51HqXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          createdAt: "2024-03-01T10:00:00Z",
          lastUsed: "2024-03-31T15:30:00Z",
          status: "active",
          permissions: ["read", "write", "admin"],
        },
        {
          id: "2",
          name: "Development API Key",
          key: "sk_test_51HqXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          createdAt: "2024-03-15T14:00:00Z",
          lastUsed: "2024-03-30T09:15:00Z",
          status: "active",
          permissions: ["read", "write"],
        },
        {
          id: "3",
          name: "Legacy API Key",
          key: "sk_old_51HqXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          createdAt: "2024-02-01T08:00:00Z",
          lastUsed: "2024-03-25T12:45:00Z",
          status: "revoked",
          permissions: ["read"],
        },
      ];
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (key: typeof newKey) => {
      // Simulate API call
      console.log("Creating API key:", key);
      return { success: true };
    },
    onSuccess: () => {
      setShowCreateDialog(false);
      setNewKey({
        name: "",
        permissions: [],
      });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      // Simulate API call
      console.log("Revoking API key:", keyId);
      return { success: true };
    },
  });

  const regenerateKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      // Simulate API call
      console.log("Regenerating API key:", keyId);
      return { success: true };
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">API Management</h1>
          <p className="text-gray-500">Manage your API keys and access</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>Create API Key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for your application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  value={newKey.name}
                  onChange={(e) =>
                    setNewKey({ ...newKey, name: e.target.value })
                  }
                  placeholder="e.g., Production API Key"
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  {["read", "write", "admin"].map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Switch
                        checked={newKey.permissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          setNewKey({
                            ...newKey,
                            permissions: checked
                              ? [...newKey.permissions, permission]
                              : newKey.permissions.filter((p) => p !== permission),
                          });
                        }}
                      />
                      <Label className="capitalize">{permission}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createKeyMutation.mutate(newKey)}
              >
                Create Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Keys</TabsTrigger>
          <TabsTrigger value="revoked">Revoked Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {apiKeys
            ?.filter((key) => key.status === "active")
            .map((key) => (
              <Card key={key.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{key.name}</CardTitle>
                      <CardDescription>
                        Created on {new Date(key.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(key.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => regenerateKeyMutation.mutate(key.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => revokeKeyMutation.mutate(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        {key.key}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Last Used:</span>{" "}
                        {new Date(key.lastUsed).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-gray-500">Permissions:</span>{" "}
                        {key.permissions.map((p) => (
                          <span
                            key={p}
                            className="inline-block px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs mr-1 capitalize"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="revoked" className="space-y-4">
          {apiKeys
            ?.filter((key) => key.status === "revoked")
            .map((key) => (
              <Card key={key.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{key.name}</CardTitle>
                      <CardDescription>
                        Created on {new Date(key.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => regenerateKeyMutation.mutate(key.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        {key.key}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Last Used:</span>{" "}
                        {new Date(key.lastUsed).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-gray-500">Permissions:</span>{" "}
                        {key.permissions.map((p) => (
                          <span
                            key={p}
                            className="inline-block px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs mr-1 capitalize"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
} 