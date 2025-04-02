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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Copy, RefreshCw, Trash2, Activity } from "lucide-react";

type Webhook = {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "error";
  lastTriggered: string;
  secret: string;
  retryCount: number;
};

export default function Webhooks() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[],
  });

  // Mock data - replace with real API calls
  const { data: webhooks } = useQuery<Webhook[]>({
    queryKey: ["webhooks"],
    queryFn: async () => {
      return [
        {
          id: "1",
          name: "Order Notifications",
          url: "https://api.example.com/webhooks/orders",
          events: ["order.created", "order.updated", "order.cancelled"],
          status: "active",
          lastTriggered: "2024-03-31T15:30:00Z",
          secret: "whsec_51HqXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          retryCount: 0,
        },
        {
          id: "2",
          name: "Customer Updates",
          url: "https://api.example.com/webhooks/customers",
          events: ["customer.created", "customer.updated"],
          status: "error",
          lastTriggered: "2024-03-30T09:15:00Z",
          secret: "whsec_51HqXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          retryCount: 3,
        },
        {
          id: "3",
          name: "Payment Events",
          url: "https://api.example.com/webhooks/payments",
          events: ["payment.succeeded", "payment.failed"],
          status: "inactive",
          lastTriggered: "2024-03-25T12:45:00Z",
          secret: "whsec_51HqXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          retryCount: 0,
        },
      ];
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (webhook: typeof newWebhook) => {
      // Simulate API call
      console.log("Creating webhook:", webhook);
      return { success: true };
    },
    onSuccess: () => {
      setShowCreateDialog(false);
      setNewWebhook({
        name: "",
        url: "",
        events: [],
      });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      // Simulate API call
      console.log("Deleting webhook:", webhookId);
      return { success: true };
    },
  });

  const regenerateSecretMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      // Simulate API call
      console.log("Regenerating webhook secret:", webhookId);
      return { success: true };
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const availableEvents = [
    "order.created",
    "order.updated",
    "order.cancelled",
    "customer.created",
    "customer.updated",
    "customer.deleted",
    "payment.succeeded",
    "payment.failed",
    "subscription.created",
    "subscription.updated",
    "subscription.cancelled",
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-gray-500">Manage your webhook endpoints</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>Create Webhook</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Set up a new webhook endpoint to receive events.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Webhook Name</Label>
                <Input
                  id="name"
                  value={newWebhook.name}
                  onChange={(e) =>
                    setNewWebhook({ ...newWebhook, name: e.target.value })
                  }
                  placeholder="e.g., Order Notifications"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Endpoint URL</Label>
                <Input
                  id="url"
                  value={newWebhook.url}
                  onChange={(e) =>
                    setNewWebhook({ ...newWebhook, url: e.target.value })
                  }
                  placeholder="https://api.example.com/webhooks"
                />
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableEvents.map((event) => (
                    <div key={event} className="flex items-center space-x-2">
                      <Switch
                        checked={newWebhook.events.includes(event)}
                        onCheckedChange={(checked) => {
                          setNewWebhook({
                            ...newWebhook,
                            events: checked
                              ? [...newWebhook.events, event]
                              : newWebhook.events.filter((e) => e !== event),
                          });
                        }}
                      />
                      <Label className="font-mono text-sm">{event}</Label>
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
                onClick={() => createWebhookMutation.mutate(newWebhook)}
              >
                Create Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="error">Errors</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {webhooks
            ?.filter((webhook) => webhook.status === "active")
            .map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{webhook.name}</CardTitle>
                      <CardDescription>{webhook.url}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(webhook.secret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => regenerateSecretMutation.mutate(webhook.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="inline-block px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-mono"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Last Triggered:</span>{" "}
                        {new Date(webhook.lastTriggered).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-gray-500">Retry Count:</span>{" "}
                        {webhook.retryCount}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="error" className="space-y-4">
          {webhooks
            ?.filter((webhook) => webhook.status === "error")
            .map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{webhook.name}</CardTitle>
                      <CardDescription>{webhook.url}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(webhook.secret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => regenerateSecretMutation.mutate(webhook.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="inline-block px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-mono"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Last Triggered:</span>{" "}
                        {new Date(webhook.lastTriggered).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-gray-500">Retry Count:</span>{" "}
                        {webhook.retryCount}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-red-500">
                      <Activity className="h-4 w-4" />
                      <span>Failed to deliver webhook</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {webhooks
            ?.filter((webhook) => webhook.status === "inactive")
            .map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{webhook.name}</CardTitle>
                      <CardDescription>{webhook.url}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(webhook.secret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => regenerateSecretMutation.mutate(webhook.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="inline-block px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-mono"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Last Triggered:</span>{" "}
                        {new Date(webhook.lastTriggered).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-gray-500">Retry Count:</span>{" "}
                        {webhook.retryCount}
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