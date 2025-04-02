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

type Workflow = {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft";
  triggers: string[];
  actions: string[];
  lastRun: string;
  nextRun: string;
};

export default function Automation() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    trigger: "",
    actions: [] as string[],
  });

  // Mock data - replace with real API calls
  const { data: workflows } = useQuery<Workflow[]>({
    queryKey: ["workflows"],
    queryFn: async () => {
      return [
        {
          id: "1",
          name: "Customer Onboarding",
          description: "Automated customer onboarding process",
          status: "active",
          triggers: ["New Customer Signup"],
          actions: ["Send Welcome Email", "Create Customer Profile", "Schedule Onboarding Call"],
          lastRun: "2024-03-31T10:00:00Z",
          nextRun: "2024-04-01T10:00:00Z",
        },
        {
          id: "2",
          name: "Invoice Processing",
          description: "Automated invoice generation and processing",
          status: "active",
          triggers: ["New Order", "Monthly Recurring"],
          actions: ["Generate Invoice", "Send Invoice Email", "Update Financial Records"],
          lastRun: "2024-03-31T09:00:00Z",
          nextRun: "2024-04-01T09:00:00Z",
        },
        {
          id: "3",
          name: "Customer Support Escalation",
          description: "Automated support ticket escalation",
          status: "inactive",
          triggers: ["High Priority Ticket", "Response Time Exceeded"],
          actions: ["Notify Support Manager", "Update Ticket Priority", "Send Escalation Email"],
          lastRun: "2024-03-30T15:00:00Z",
          nextRun: "2024-03-31T15:00:00Z",
        },
      ];
    },
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (workflow: typeof newWorkflow) => {
      // Simulate API call
      console.log("Creating workflow:", workflow);
      return { success: true };
    },
    onSuccess: () => {
      setShowCreateDialog(false);
      setNewWorkflow({
        name: "",
        description: "",
        trigger: "",
        actions: [],
      });
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workflow Automation</h1>
          <p className="text-gray-500">Create and manage automated workflows</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>Create Workflow</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Set up a new automated workflow for your business processes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workflow Name</Label>
                <Input
                  id="name"
                  value={newWorkflow.name}
                  onChange={(e) =>
                    setNewWorkflow({ ...newWorkflow, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newWorkflow.description}
                  onChange={(e) =>
                    setNewWorkflow({ ...newWorkflow, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger</Label>
                <Select
                  value={newWorkflow.trigger}
                  onValueChange={(value) =>
                    setNewWorkflow({ ...newWorkflow, trigger: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new-customer">New Customer Signup</SelectItem>
                    <SelectItem value="new-order">New Order</SelectItem>
                    <SelectItem value="monthly">Monthly Recurring</SelectItem>
                    <SelectItem value="high-priority">High Priority Ticket</SelectItem>
                  </SelectContent>
                </Select>
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
                onClick={() => createWorkflowMutation.mutate(newWorkflow)}
              >
                Create Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Workflows</TabsTrigger>
          <TabsTrigger value="draft">Draft Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {workflows
            ?.filter((w) => w.status === "active")
            .map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{workflow.name}</CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Triggers</h4>
                      <ul className="space-y-1">
                        {workflow.triggers.map((trigger) => (
                          <li key={trigger} className="text-sm">
                            • {trigger}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Actions</h4>
                      <ul className="space-y-1">
                        {workflow.actions.map((action) => (
                          <li key={action} className="text-sm">
                            • {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Last Run:</span>{" "}
                      {new Date(workflow.lastRun).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Next Run:</span>{" "}
                      {new Date(workflow.nextRun).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {workflows
            ?.filter((w) => w.status === "inactive")
            .map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{workflow.name}</CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                    <Switch />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Triggers</h4>
                      <ul className="space-y-1">
                        {workflow.triggers.map((trigger) => (
                          <li key={trigger} className="text-sm">
                            • {trigger}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Actions</h4>
                      <ul className="space-y-1">
                        {workflow.actions.map((action) => (
                          <li key={action} className="text-sm">
                            • {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Last Run:</span>{" "}
                      {new Date(workflow.lastRun).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Next Run:</span>{" "}
                      {new Date(workflow.nextRun).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <Card>
            <CardContent className="py-6">
              <div className="text-center text-gray-500">
                No draft workflows found. Create a new workflow to get started.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 