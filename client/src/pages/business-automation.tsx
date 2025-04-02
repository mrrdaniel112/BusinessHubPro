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
import { Plus, Trash2, Play, Pause } from "lucide-react";

type Automation = {
  id: string;
  name: string;
  description: string;
  type: "invoice" | "inventory" | "payroll" | "report";
  status: "active" | "inactive";
  schedule: string;
  lastRun: string;
  nextRun: string;
};

export default function BusinessAutomation() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    name: "",
    description: "",
    type: "invoice" as Automation["type"],
  });

  // Mock data - replace with real API calls
  const { data: automations } = useQuery<Automation[]>({
    queryKey: ["automations"],
    queryFn: async () => {
      return [
        {
          id: "1",
          name: "Monthly Invoice Generation",
          description: "Generate and send invoices to clients on the 1st of each month",
          type: "invoice",
          status: "active",
          schedule: "0 0 1 * *",
          lastRun: "2024-03-01T00:00:00Z",
          nextRun: "2024-04-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Low Stock Alert",
          description: "Send alerts when inventory items fall below minimum threshold",
          type: "inventory",
          status: "active",
          schedule: "0 9 * * *",
          lastRun: "2024-03-31T09:00:00Z",
          nextRun: "2024-04-01T09:00:00Z",
        },
        {
          id: "3",
          name: "Payroll Processing",
          description: "Process payroll on the 15th and 30th of each month",
          type: "payroll",
          status: "inactive",
          schedule: "0 0 15,30 * *",
          lastRun: "2024-03-30T00:00:00Z",
          nextRun: "2024-04-15T00:00:00Z",
        },
        {
          id: "4",
          name: "Weekly Sales Report",
          description: "Generate and email weekly sales report every Monday",
          type: "report",
          status: "active",
          schedule: "0 8 * * 1",
          lastRun: "2024-03-25T08:00:00Z",
          nextRun: "2024-04-01T08:00:00Z",
        },
      ];
    },
  });

  const createAutomationMutation = useMutation({
    mutationFn: async (automation: typeof newAutomation) => {
      // Simulate API call
      console.log("Creating automation:", automation);
      return { success: true };
    },
    onSuccess: () => {
      setShowCreateDialog(false);
      setNewAutomation({
        name: "",
        description: "",
        type: "invoice",
      });
    },
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async (automationId: string) => {
      // Simulate API call
      console.log("Toggling automation:", automationId);
      return { success: true };
    },
  });

  const deleteAutomationMutation = useMutation({
    mutationFn: async (automationId: string) => {
      // Simulate API call
      console.log("Deleting automation:", automationId);
      return { success: true };
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Automation</h1>
          <p className="text-gray-500">Automate your business processes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Automation</DialogTitle>
              <DialogDescription>
                Set up a new automated business process.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Automation Name</Label>
                <Input
                  id="name"
                  value={newAutomation.name}
                  onChange={(e) =>
                    setNewAutomation({ ...newAutomation, name: e.target.value })
                  }
                  placeholder="e.g., Monthly Invoice Generation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newAutomation.description}
                  onChange={(e) =>
                    setNewAutomation({
                      ...newAutomation,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what this automation does"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["invoice", "inventory", "payroll", "report"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Switch
                        checked={newAutomation.type === type}
                        onCheckedChange={() =>
                          setNewAutomation({ ...newAutomation, type: type as Automation["type"] })
                        }
                      />
                      <Label className="capitalize">{type}</Label>
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
                onClick={() => createAutomationMutation.mutate(newAutomation)}
              >
                Create Automation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="invoice">Invoices</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="report">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {automations?.map((automation) => (
            <Card key={automation.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{automation.name}</CardTitle>
                    <CardDescription>{automation.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleAutomationMutation.mutate(automation.id)}
                    >
                      {automation.status === "active" ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteAutomationMutation.mutate(automation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>{" "}
                    <span className="capitalize">{automation.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>{" "}
                    <span
                      className={`font-medium capitalize ${
                        automation.status === "active"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {automation.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Run:</span>{" "}
                    {new Date(automation.lastRun).toLocaleString()}
                  </div>
                  <div>
                    <span className="text-gray-500">Next Run:</span>{" "}
                    {new Date(automation.nextRun).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {["invoice", "inventory", "payroll", "report"].map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {automations
              ?.filter((automation) => automation.type === type)
              .map((automation) => (
                <Card key={automation.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{automation.name}</CardTitle>
                        <CardDescription>{automation.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleAutomationMutation.mutate(automation.id)}
                        >
                          {automation.status === "active" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteAutomationMutation.mutate(automation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Status:</span>{" "}
                        <span
                          className={`font-medium capitalize ${
                            automation.status === "active"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {automation.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Run:</span>{" "}
                        {new Date(automation.lastRun).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-gray-500">Next Run:</span>{" "}
                        {new Date(automation.nextRun).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 