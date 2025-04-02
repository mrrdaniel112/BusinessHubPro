import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

type Integration = {
  id: string;
  name: string;
  description: string;
  category: "payment" | "crm" | "marketing" | "productivity" | "analytics";
  status: "active" | "inactive" | "pending";
  lastSync: string;
  nextSync: string;
  logo: string;
};

export default function Integrations() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with real API calls
  const { data: integrations } = useQuery<Integration[]>({
    queryKey: ["integrations"],
    queryFn: async () => {
      return [
        {
          id: "1",
          name: "Stripe",
          description: "Payment processing and subscription management",
          category: "payment",
          status: "active",
          lastSync: "2024-03-31T10:00:00Z",
          nextSync: "2024-04-01T10:00:00Z",
          logo: "https://stripe.com/favicon.ico",
        },
        {
          id: "2",
          name: "HubSpot",
          description: "CRM and marketing automation",
          category: "crm",
          status: "active",
          lastSync: "2024-03-31T09:00:00Z",
          nextSync: "2024-04-01T09:00:00Z",
          logo: "https://hubspot.com/favicon.ico",
        },
        {
          id: "3",
          name: "Mailchimp",
          description: "Email marketing and automation",
          category: "marketing",
          status: "inactive",
          lastSync: "2024-03-30T15:00:00Z",
          nextSync: "2024-03-31T15:00:00Z",
          logo: "https://mailchimp.com/favicon.ico",
        },
        {
          id: "4",
          name: "Slack",
          description: "Team communication and notifications",
          category: "productivity",
          status: "pending",
          lastSync: "2024-03-30T14:00:00Z",
          nextSync: "2024-03-31T14:00:00Z",
          logo: "https://slack.com/favicon.ico",
        },
        {
          id: "5",
          name: "Google Analytics",
          description: "Website analytics and reporting",
          category: "analytics",
          status: "active",
          lastSync: "2024-03-31T08:00:00Z",
          nextSync: "2024-04-01T08:00:00Z",
          logo: "https://analytics.google.com/favicon.ico",
        },
      ];
    },
  });

  const filteredIntegrations = integrations?.filter((integration) =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-gray-500">Connect and manage your favorite apps</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>Add Integration</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Connect a new app to enhance your business processes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Integrations</Label>
                <Input
                  id="search"
                  placeholder="Search available integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button>Add Integration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations?.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img
                        src={integration.logo}
                        alt={integration.name}
                        className="w-8 h-8 rounded"
                      />
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                    <Switch
                      defaultChecked={integration.status === "active"}
                      disabled={integration.status === "pending"}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium capitalize">
                        {integration.category}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`font-medium capitalize ${
                          integration.status === "active"
                            ? "text-green-500"
                            : integration.status === "pending"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {integration.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Last Sync:</span>
                      <span>
                        {new Date(integration.lastSync).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Next Sync:</span>
                      <span>
                        {new Date(integration.nextSync).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {["payment", "crm", "marketing", "productivity", "analytics"].map(
          (category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIntegrations
                  ?.filter((integration) => integration.category === category)
                  .map((integration) => (
                    <Card key={integration.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <img
                              src={integration.logo}
                              alt={integration.name}
                              className="w-8 h-8 rounded"
                            />
                            <div>
                              <CardTitle>{integration.name}</CardTitle>
                              <CardDescription>
                                {integration.description}
                              </CardDescription>
                            </div>
                          </div>
                          <Switch
                            defaultChecked={integration.status === "active"}
                            disabled={integration.status === "pending"}
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Status:</span>
                            <span
                              className={`font-medium capitalize ${
                                integration.status === "active"
                                  ? "text-green-500"
                                  : integration.status === "pending"
                                  ? "text-yellow-500"
                                  : "text-red-500"
                              }`}
                            >
                              {integration.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Last Sync:</span>
                            <span>
                              {new Date(integration.lastSync).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Next Sync:</span>
                            <span>
                              {new Date(integration.nextSync).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
} 