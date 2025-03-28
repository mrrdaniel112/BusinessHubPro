import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Contract } from "@shared/schema";

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ['/api/contracts'],
  });

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string | Date | undefined | null) => {
    if (!dateStr) return "N/A";
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'sent':
        return <Badge variant="secondary">Sent</Badge>;
      case 'signed':
        return <Badge variant="success" className="bg-success-100 text-success-800 hover:bg-success-100">Signed</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getContractStatusCounts = () => {
    const counts = { draft: 0, sent: 0, signed: 0, expired: 0 };
    contracts.forEach(contract => {
      if (contract.status in counts) {
        counts[contract.status as keyof typeof counts]++;
      }
    });
    return counts;
  };

  const statusCounts = getContractStatusCounts();

  return (
    <div>
      {/* Page header */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h1 className="text-2xl font-semibold text-gray-900">Contract Management</h1>
          <Button>
            <i className="ri-file-add-line mr-1"></i> New Contract
          </Button>
        </div>
      </div>

      {/* Contract stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-primary-50">
                  <i className="ri-draft-line text-xl text-primary-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Draft</h3>
              <p className="text-2xl font-bold">{isLoading ? "..." : statusCounts.draft}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-warning-50">
                  <i className="ri-mail-send-line text-xl text-warning-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Sent</h3>
              <p className="text-2xl font-bold">{isLoading ? "..." : statusCounts.sent}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-success-50">
                  <i className="ri-check-double-line text-xl text-success-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Signed</h3>
              <p className="text-2xl font-bold">{isLoading ? "..." : statusCounts.signed}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-danger-50">
                  <i className="ri-calendar-close-line text-xl text-danger-600"></i>
                </div>
              </div>
              <h3 className="text-sm text-gray-500">Expired</h3>
              <p className="text-2xl font-bold">{isLoading ? "..." : statusCounts.expired}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contracts list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8 mb-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 items-start sm:items-center justify-between">
            <CardTitle>Contracts</CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Input
                type="search"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="w-full h-32 bg-gray-100 animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : filteredContracts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContracts.map((contract) => (
                  <Card key={contract.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{contract.title}</h3>
                            <p className="text-sm text-gray-500">{contract.clientName}</p>
                          </div>
                          {getStatusBadge(contract.status)}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-sm text-gray-500 mb-2">
                          <span className="font-medium">Created:</span> {formatDate(contract.createdAt)}
                        </div>
                        {contract.expiryDate && (
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Expires:</span> {formatDate(contract.expiryDate)}
                          </div>
                        )}
                        <div className="mt-4 line-clamp-2 text-sm text-gray-700">
                          {contract.content}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-4 pt-0 border-t mt-4">
                      <Button variant="ghost" size="sm">
                        <i className="ri-eye-line mr-1"></i> View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <i className="ri-edit-line mr-1"></i> Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="ri-file-list-3-line text-4xl text-gray-300"></i>
                <p className="mt-2 text-gray-500">No contracts found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
