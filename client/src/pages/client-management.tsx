import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Client, 
  ClientInteraction, 
  ClientDeal,
  InsertClient,
  InsertClientInteraction,
  InsertClientDeal
} from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Users, 
  UserPlus, 
  MessagesSquare, 
  Calendar, 
  DollarSign, 
  Filter, 
  MoreVertical, 
  Phone, 
  Mail, 
  Building, 
  Tag, 
  Plus,
  Briefcase,
  Clock,
  Star,
  Radio
} from "lucide-react";

// Define our filter states
type ClientFilter = "all" | "active" | "lead" | "prospect" | "inactive";
type DealFilter = "all" | "lead" | "prospect" | "proposal" | "negotiation" | "won" | "lost";

const ClientManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("clients");
  const [clientFilter, setClientFilter] = useState<ClientFilter>("all");
  const [dealFilter, setDealFilter] = useState<DealFilter>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Clients query
  const { 
    data: clients = [], 
    isLoading: isLoadingClients 
  } = useQuery({
    queryKey: ["/api/clients"],
    select: (data: Client[]) => {
      if (clientFilter === "all") return data;
      return data.filter(client => client.status === clientFilter);
    }
  });

  // Filtered clients
  const filteredClients = clients.filter(client => {
    if (searchQuery === "") return true;
    
    const search = searchQuery.toLowerCase();
    return (
      (client.firstName?.toLowerCase().includes(search) || false) ||
      (client.lastName?.toLowerCase().includes(search) || false) ||
      (client.company?.toLowerCase().includes(search) || false) ||
      (client.email?.toLowerCase().includes(search) || false)
    );
  });

  // Client interactions query
  const {
    data: interactions = [],
    isLoading: isLoadingInteractions,
  } = useQuery({
    queryKey: ["/api/clients", selectedClient?.id, "interactions"],
    enabled: !!selectedClient,
    queryFn: async () => {
      if (!selectedClient) return [];
      const res = await apiRequest("GET", `/api/clients/${selectedClient.id}/interactions`);
      return await res.json();
    }
  });

  // Deals query
  const {
    data: deals = [],
    isLoading: isLoadingDeals,
  } = useQuery({
    queryKey: ["/api/deals"],
    select: (data: ClientDeal[]) => {
      if (dealFilter === "all") return data;
      return data.filter(deal => deal.stage === dealFilter);
    }
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (newClient: Omit<InsertClient, "userId">) => {
      const res = await apiRequest("POST", "/api/clients", newClient);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Client added",
        description: "The client has been added successfully.",
      });
      queryClient.invalidateQueries({queryKey: ["/api/clients"]});
      setIsAddClientOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add client: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create interaction mutation
  const createInteractionMutation = useMutation({
    mutationFn: async (newInteraction: Omit<InsertClientInteraction, "userId">) => {
      const res = await apiRequest("POST", "/api/interactions", newInteraction);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Interaction added",
        description: "The interaction has been added successfully.",
      });
      queryClient.invalidateQueries({queryKey: ["/api/clients", selectedClient?.id, "interactions"]});
      setIsAddInteractionOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add interaction: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (newDeal: Omit<InsertClientDeal, "userId">) => {
      const res = await apiRequest("POST", "/api/deals", newDeal);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Deal added",
        description: "The deal has been added successfully.",
      });
      queryClient.invalidateQueries({queryKey: ["/api/deals"]});
      setIsAddDealOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add deal: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle client form submission
  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const client: Omit<InsertClient, "userId"> = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string || null,
      phone: formData.get("phone") as string || null,
      company: formData.get("company") as string || null,
      position: formData.get("position") as string || null,
      address: formData.get("address") as string || null,
      city: formData.get("city") as string || null,
      state: formData.get("state") as string || null,
      zipCode: formData.get("zipCode") as string || null,
      country: formData.get("country") as string || null,
      source: formData.get("source") as string || null,
      status: formData.get("status") as string,
      leadScore: formData.get("leadScore") ? parseInt(formData.get("leadScore") as string) : null,
      notes: formData.get("notes") as string || null,
      tags: formData.get("tags") as string || null
    };
    
    createClientMutation.mutate(client);
  };

  // Handle interaction form submission
  const handleAddInteraction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    const formData = new FormData(e.currentTarget);
    
    const interaction: Omit<InsertClientInteraction, "userId"> = {
      clientId: selectedClient.id,
      type: formData.get("type") as string,
      date: new Date(formData.get("date") as string),
      subject: formData.get("subject") as string,
      content: formData.get("content") as string,
      followUpDate: formData.get("followUpDate") ? new Date(formData.get("followUpDate") as string) : null,
      followUpComplete: false
    };
    
    createInteractionMutation.mutate(interaction);
  };

  // Handle deal form submission
  const handleAddDeal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    const formData = new FormData(e.currentTarget);
    
    const deal: Omit<InsertClientDeal, "userId"> = {
      clientId: selectedClient.id,
      name: formData.get("name") as string,
      value: formData.get("value") as string,
      currency: formData.get("currency") as string,
      stage: formData.get("stage") as string,
      probability: formData.get("probability") ? parseInt(formData.get("probability") as string) : null,
      expectedCloseDate: formData.get("expectedCloseDate") ? new Date(formData.get("expectedCloseDate") as string) : null,
      actualCloseDate: null,
      notes: formData.get("notes") as string || null,
      assignedTo: null
    };
    
    createDealMutation.mutate(deal);
  };

  // Function to get status badge color
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "lead": return "bg-yellow-500";
      case "prospect": return "bg-blue-500";
      case "active": return "bg-green-500";
      case "inactive": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  // Function to get deal stage badge color
  const getDealStageColor = (stage: string) => {
    switch (stage) {
      case "lead": return "bg-yellow-500";
      case "prospect": return "bg-blue-500";
      case "proposal": return "bg-purple-500";
      case "negotiation": return "bg-orange-500";
      case "won": return "bg-green-500";
      case "lost": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Client Relationship Management</h1>
          <p className="text-muted-foreground">Manage your clients, interactions, and deals in one place</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setIsAddClientOpen(true)} className="flex items-center gap-2">
            <UserPlus size={16} />
            <span>Add Client</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users size={16} />
            <span>Clients</span>
          </TabsTrigger>
          <TabsTrigger value="interactions" className="flex items-center gap-2">
            <MessagesSquare size={16} />
            <span>Interactions</span>
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-2">
            <DollarSign size={16} />
            <span>Deals</span>
          </TabsTrigger>
        </TabsList>

        {/* Clients Tab */}
        <TabsContent value="clients">
          <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between md:items-center">
              <div>
                <CardTitle>Client List</CardTitle>
                <CardDescription>View and manage all your clients</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
                <div className="flex items-center gap-2">
                  <Label htmlFor="search-clients" className="sr-only">Search Clients</Label>
                  <Input
                    id="search-clients"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-auto"
                  />
                </div>
                <Select value={clientFilter} onValueChange={(value) => setClientFilter(value as ClientFilter)}>
                  <SelectTrigger className="w-full sm:w-[180px] flex items-center gap-2">
                    <Filter size={16} />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="lead">Leads</SelectItem>
                    <SelectItem value="prospect">Prospects</SelectItem>
                    <SelectItem value="active">Active Clients</SelectItem>
                    <SelectItem value="inactive">Inactive Clients</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingClients ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No clients found. Add a new client to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Company</TableHead>
                      <TableHead className="hidden lg:table-cell">Contact</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Contact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{client.firstName} {client.lastName}</p>
                            <p className="text-sm text-muted-foreground md:hidden">{client.company || "—"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {client.company || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-col">
                            {client.email && (
                              <span className="text-sm flex items-center gap-1">
                                <Mail size={14} />
                                {client.email}
                              </span>
                            )}
                            {client.phone && (
                              <span className="text-sm flex items-center gap-1">
                                <Phone size={14} />
                                {client.phone}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={`${getStatusColor(client.status)} text-white`}>
                            {client.status?.charAt(0).toUpperCase() + client.status?.slice(1) || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {client.lastContact ? (
                            <span className="text-sm">{formatDistanceToNow(new Date(client.lastContact), { addSuffix: true })}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => {
                                setSelectedClient(client);
                                setActiveTab("interactions");
                              }}>
                                View Interactions
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedClient(client);
                                setIsAddInteractionOpen(true);
                              }}>
                                Add Interaction
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedClient(client);
                                setIsAddDealOpen(true);
                              }}>
                                Create Deal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interactions Tab */}
        <TabsContent value="interactions">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle>Client Interactions</CardTitle>
                <CardDescription>
                  {selectedClient ? (
                    <>Viewing interactions with <span className="font-medium">{selectedClient.firstName} {selectedClient.lastName}</span></>
                  ) : (
                    <>Select a client to view their interactions</>
                  )}
                </CardDescription>
              </div>
              {selectedClient && (
                <Button
                  onClick={() => setIsAddInteractionOpen(true)}
                  className="mt-4 sm:mt-0"
                >
                  Add Interaction
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!selectedClient ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Select a client from the Clients tab to view their interactions</p>
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => setActiveTab("clients")}>
                      Go to Clients
                    </Button>
                  </div>
                </div>
              ) : isLoadingInteractions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : interactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No interactions found for this client</p>
                  <div className="mt-4">
                    <Button onClick={() => setIsAddInteractionOpen(true)}>
                      Add First Interaction
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {interactions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((interaction: any) => (
                    <Card key={interaction.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {interaction.type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(interaction.date), "PPP")}
                              </span>
                            </div>
                            <CardTitle className="mt-2">{interaction.subject}</CardTitle>
                          </div>
                          {interaction.followUpDate && (
                            <div className="text-right">
                              <Badge variant={interaction.followUpComplete ? "outline" : "default"} className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>
                                  {interaction.followUpComplete 
                                    ? "Completed" 
                                    : new Date(interaction.followUpDate) > new Date() 
                                      ? `Follow up ${format(new Date(interaction.followUpDate), "MMM d")}` 
                                      : "Overdue follow up"}
                                </span>
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p>{interaction.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals">
          <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between md:items-center">
              <div>
                <CardTitle>Deals Pipeline</CardTitle>
                <CardDescription>Track and manage all your sales opportunities</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
                <Select value={dealFilter} onValueChange={(value) => setDealFilter(value as DealFilter)}>
                  <SelectTrigger className="w-full sm:w-[180px] flex items-center gap-2">
                    <Filter size={16} />
                    <SelectValue placeholder="Filter by stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Deals</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedClient(null);
                    setIsAddDealOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>New Deal</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingDeals ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : deals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No deals found. Create a new deal to get started.</p>
                  <div className="mt-4">
                    <Button onClick={() => {
                      setSelectedClient(null);
                      setIsAddDealOpen(true);
                    }}>
                      Create Deal
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead className="hidden md:table-cell">Client</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="hidden sm:table-cell">Stage</TableHead>
                      <TableHead className="hidden lg:table-cell">Close Date</TableHead>
                      <TableHead className="hidden md:table-cell">Probability</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deals.map((deal) => {
                      const client = clients.find(c => c.id === deal.clientId);
                      
                      return (
                        <TableRow key={deal.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{deal.name}</p>
                              <p className="text-sm text-muted-foreground md:hidden">
                                {client ? `${client.firstName} ${client.lastName}` : "Unknown client"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {client ? (
                              <div>
                                <p>{client.firstName} {client.lastName}</p>
                                <p className="text-sm text-muted-foreground">{client.company || "—"}</p>
                              </div>
                            ) : (
                              "Unknown client"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {deal.currency} {parseFloat(deal.value).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className={`${getDealStageColor(deal.stage)} text-white`}>
                              {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {deal.actualCloseDate ? (
                              <span className="text-sm">Closed {format(new Date(deal.actualCloseDate), "MMM d, yyyy")}</span>
                            ) : deal.expectedCloseDate ? (
                              <span className="text-sm">{format(new Date(deal.expectedCloseDate), "MMM d, yyyy")}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not set</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {deal.probability !== null ? (
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                  className="bg-primary h-2.5 rounded-full"
                                  style={{ width: `${deal.probability}%` }}
                                ></div>
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>Edit Deal</DropdownMenuItem>
                                <DropdownMenuItem>Mark as Won</DropdownMenuItem>
                                <DropdownMenuItem>Mark as Lost</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a new client in your CRM. Fill out as much information as you have available.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddClient}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" name="lastName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" name="position" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input id="state" name="state" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip/Postal Code</Label>
                <Input id="zipCode" name="zipCode" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Lead Source</Label>
                <Select name="source">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="email">Email Campaign</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select name="status" defaultValue="lead" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadScore">Lead Score (1-100)</Label>
                <Input id="leadScore" name="leadScore" type="number" min="1" max="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" name="tags" placeholder="e.g. VIP,retail,construction" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddClientOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createClientMutation.isPending}>
                {createClientMutation.isPending ? "Saving..." : "Add Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Interaction Dialog */}
      <Dialog open={isAddInteractionOpen} onOpenChange={setIsAddInteractionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Interaction</DialogTitle>
            <DialogDescription>
              {selectedClient ? (
                <>Record an interaction with {selectedClient.firstName} {selectedClient.lastName}</>
              ) : (
                <>Select a client first to add an interaction</>
              )}
            </DialogDescription>
          </DialogHeader>
          {!selectedClient ? (
            <div className="py-6 text-center">
              <p className="mb-4">Please select a client before adding an interaction</p>
              <Button onClick={() => {
                setIsAddInteractionOpen(false);
                setActiveTab("clients");
              }}>
                Go to Clients
              </Button>
            </div>
          ) : (
            <form onSubmit={handleAddInteraction}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Interaction Type *</Label>
                  <Select name="type" defaultValue="call" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" name="date" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input id="subject" name="subject" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea id="content" name="content" rows={3} required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="followUpDate">Follow-up Date</Label>
                    <span className="text-sm text-muted-foreground">(Optional)</span>
                  </div>
                  <Input id="followUpDate" name="followUpDate" type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddInteractionOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createInteractionMutation.isPending}>
                  {createInteractionMutation.isPending ? "Saving..." : "Add Interaction"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Deal Dialog */}
      <Dialog open={isAddDealOpen} onOpenChange={setIsAddDealOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Deal</DialogTitle>
            <DialogDescription>
              {selectedClient ? (
                <>Add a new deal for {selectedClient.firstName} {selectedClient.lastName}</>
              ) : (
                <>Create a new deal opportunity</>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDeal}>
            <div className="space-y-4 py-4">
              {!selectedClient && (
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client *</Label>
                  <Select name="clientId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.firstName} {client.lastName} {client.company ? `(${client.company})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Deal Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  defaultValue={selectedClient ? `${selectedClient.company || selectedClient.firstName + " " + selectedClient.lastName} Deal` : ""} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input id="value" name="value" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select name="currency" defaultValue="USD">
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage *</Label>
                <Select name="stage" defaultValue="lead" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <Input id="probability" name="probability" type="number" min="0" max="100" defaultValue="50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                <Input id="expectedCloseDate" name="expectedCloseDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddDealOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createDealMutation.isPending}>
                {createDealMutation.isPending ? "Saving..." : "Create Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManagement;