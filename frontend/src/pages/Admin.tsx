import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, FileText, User, Building2, Phone, Mail, MapPin, Maximize2, X, Users, Home, Search, Filter, DollarSign, MapPinned, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface AgentApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  agency: string;
  experience: number;
  cnic: string;
  address: string;
  attachments: string[];
  status: string;
  created_at: string;
}

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  address: string;
  city: string;
  images: string;
  agent_id: string | null;
  status: string;
  created_at: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  agency: string;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'applications' | 'properties'>('applications');
  const [applications, setApplications] = useState<AgentApplication[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  const [attachmentIndex, setAttachmentIndex] = useState<number>(0);
  
  // Property Management States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [assignAgentDialogOpen, setAssignAgentDialogOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  
  // Bulk Assignment States
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [bulkAgentId, setBulkAgentId] = useState<string>('');
  const [bulkAgentSearchQuery, setBulkAgentSearchQuery] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchProperties();
    fetchAgents();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/agent-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Parse attachments if they are JSON strings
        const parsedData = data.data.map((app: any) => ({
          ...app,
          attachments: typeof app.attachments === 'string' ? JSON.parse(app.attachments || '[]') : (app.attachments || [])
        }));
        setApplications(parsedData);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/properties');
      const data = await response.json();
      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/agents');
      const data = await response.json();
      if (data.success) {
        setAgents(data.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/agent-applications/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('Application approved successfully!');
        fetchApplications(); // Refresh the list
        fetchAgents(); // Refresh agents list
      } else {
        alert('Error approving application: ' + data.error);
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Error approving application');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/agent-applications/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('Application rejected!');
        fetchApplications(); // Refresh the list
      } else {
        alert('Error rejecting application: ' + data.error);
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error rejecting application');
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedProperty || !selectedAgentId) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/properties/${selectedProperty.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...selectedProperty,
          agent_id: selectedAgentId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Agent assigned successfully!');
        fetchProperties();
        setAssignAgentDialogOpen(false);
        setSelectedProperty(null);
        setSelectedAgentId('');
      } else {
        alert('Error assigning agent: ' + data.error);
      }
    } catch (error) {
      console.error('Error assigning agent:', error);
      alert('Error assigning agent');
    }
  };

  const openAssignDialog = (property: Property) => {
    setSelectedProperty(property);
    setSelectedAgentId(property.agent_id || '');
    setAgentSearchQuery('');
    setAssignAgentDialogOpen(true);
  };

  // Bulk Assignment Functions
  const togglePropertySelection = (propertyId: string) => {
    setSelectedPropertyIds(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPropertyIds.length === filteredProperties.length) {
      setSelectedPropertyIds([]);
    } else {
      setSelectedPropertyIds(filteredProperties.map(p => p.id));
    }
  };

  const openBulkAssignDialog = () => {
    if (selectedPropertyIds.length === 0) {
      alert('Please select at least one property');
      return;
    }
    setBulkAgentId('');
    setBulkAgentSearchQuery('');
    setBulkAssignDialogOpen(true);
  };

  const handleBulkAssignAgent = async () => {
    if (!bulkAgentId || selectedPropertyIds.length === 0) return;
    
    try {
      const token = localStorage.getItem('authToken');
      let successCount = 0;
      let errorCount = 0;

      for (const propertyId of selectedPropertyIds) {
        const property = properties.find(p => p.id === propertyId);
        if (!property) continue;

        try {
          const response = await fetch(`http://localhost:3001/api/properties/${propertyId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ...property,
              agent_id: bulkAgentId
            })
          });
          
          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      alert(`Successfully assigned ${successCount} properties. ${errorCount > 0 ? `${errorCount} failed.` : ''}`);
      fetchProperties();
      setBulkAssignDialogOpen(false);
      setSelectedPropertyIds([]);
      setBulkAgentId('');
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      alert('Error assigning properties');
    }
  };

  // Filter agents for bulk assignment
  const filteredBulkAgents = agents.filter(agent => {
    const searchLower = bulkAgentSearchQuery.toLowerCase();
    return agent.name.toLowerCase().includes(searchLower) ||
           agent.email.toLowerCase().includes(searchLower) ||
           agent.agency.toLowerCase().includes(searchLower) ||
           agent.phone.includes(searchLower);
  });

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = filterCity === 'all' || property.city === filterCity;
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
    
    return matchesSearch && matchesCity && matchesStatus;
  });

  // Filter agents based on search query
  const filteredAgents = agents.filter(agent => {
    const searchLower = agentSearchQuery.toLowerCase();
    return agent.name.toLowerCase().includes(searchLower) ||
           agent.email.toLowerCase().includes(searchLower) ||
           agent.agency.toLowerCase().includes(searchLower) ||
           agent.phone.includes(searchLower);
  });

  // Get unique cities for filter
  const uniqueCities = Array.from(new Set(properties.map(p => p.city))).filter(Boolean);

  const handleViewAttachment = (attachment: string, index: number) => {
    setSelectedAttachment(attachment);
    setAttachmentIndex(index);
  };

  const isImageFile = (dataUrl: string): boolean => {
    return dataUrl.includes('data:image/');
  };

  const isPdfFile = (dataUrl: string): boolean => {
    return dataUrl.includes('data:application/pdf');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-64 shrink-0">
              <Card className="sticky top-24">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
                  <nav className="space-y-2">
                    <Button
                      variant={activeTab === 'applications' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab('applications')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Agent Applications
                    </Button>
                    <Button
                      variant={activeTab === 'properties' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab('properties')}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Property Management
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeTab === 'applications' ? (
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold">Agent Applications</h1>
                    <p className="text-muted-foreground mt-2">Review and manage agent applications</p>
                  </div>

                  {loading ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">Loading applications...</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {applications.filter(app => app.status === 'pending').length === 0 ? (
                        <Card>
                          <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground">No pending applications</p>
                          </CardContent>
                        </Card>
                      ) : (
                        applications.filter(app => app.status === 'pending').map((app) => (
                          <Card key={app.id} className="w-full">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    {app.name}
                                  </CardTitle>
                                  <Badge variant="secondary" className="mt-2">Pending Approval</Badge>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleApprove(app.id)}
                                    variant="default"
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleReject(app.id)}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{app.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{app.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{app.agency}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">CNIC: {app.cnic}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">{app.address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Experience:</span>
                                  <span className="text-sm">{app.experience} years</span>
                                </div>
                              </div>
                              
                              {Array.isArray(app.attachments) && app.attachments.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-3">Attachments:</h4>
                                  <div className="space-y-2">
                                    {app.attachments.map((url, index) => (
                                      <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                          <FileText className="w-4 h-4 text-muted-foreground" />
                                          <span className="text-sm font-medium">Document {index + 1}</span>
                                        </div>
                                        <Button
                                          onClick={() => handleViewAttachment(url, index)}
                                          variant="outline"
                                          size="sm"
                                          className="flex items-center gap-1"
                                        >
                                          <Maximize2 className="w-4 h-4" />
                                          View
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold">Property Management</h1>
                    <p className="text-muted-foreground mt-2">Manage and assign properties to agents</p>
                  </div>

                  {/* Filters and Search */}
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="Search properties by title, address, or city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={filterCity} onValueChange={setFilterCity}>
                          <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Filter by city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {uniqueCities.map(city => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Showing {filteredProperties.length} of {properties.length} properties</span>
                        <div className="flex items-center gap-2">
                          {selectedPropertyIds.length > 0 && (
                            <span className="text-sm font-medium text-primary">
                              {selectedPropertyIds.length} selected
                            </span>
                          )}
                          <Button variant="outline" size="sm" onClick={() => {
                            setSearchQuery('');
                            setFilterCity('all');
                            setFilterStatus('all');
                          }}>
                            <Filter className="w-4 h-4 mr-2" />
                            Clear Filters
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bulk Actions Bar */}
                  {filteredProperties.length > 0 && (
                    <Card className="bg-muted/50">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedPropertyIds.length === filteredProperties.length && filteredProperties.length > 0}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <span className="text-sm font-medium">
                                Select All ({filteredProperties.length})
                              </span>
                            </label>
                            {selectedPropertyIds.length > 0 && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={openBulkAssignDialog}
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Assign Agent to {selectedPropertyIds.length} Properties
                              </Button>
                            )}
                          </div>
                          {selectedPropertyIds.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPropertyIds([])}
                            >
                              Clear Selection
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Properties List */}
                  <div className="space-y-4">
                    {filteredProperties.length === 0 ? (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <p className="text-muted-foreground">No properties found</p>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredProperties.map((property) => {
                        const assignedAgent = agents.find(a => String(a.id) === String(property.agent_id));
                        const images = JSON.parse(property.images || '[]');
                        const firstImage = images[0] || 'https://placehold.co/400x300?text=No+Image';
                        const isSelected = selectedPropertyIds.includes(property.id);
                        
                        return (
                          <Card key={property.id} className={`overflow-hidden hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                            <div className="flex flex-col md:flex-row">
                              {/* Checkbox */}
                              <div className="absolute top-4 left-4 z-10">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => togglePropertySelection(property.id)}
                                  className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              
                              {/* Property Image */}
                              <div className="md:w-64 h-48 md:h-auto bg-muted">
                                <img 
                                  src={firstImage} 
                                  alt={property.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              {/* Property Details */}
                              <div className="flex-1 p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="text-xl font-bold mb-2">{property.title}</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                      <MapPinned className="w-4 h-4" />
                                      <span className="text-sm">{property.address}, {property.city}</span>
                                    </div>
                                  </div>
                                  <Badge variant={property.status === 'available' ? 'default' : property.status === 'sold' ? 'secondary' : 'outline'}>
                                    {property.status}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Price</p>
                                    <p className="font-semibold flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      {property.price.toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Type</p>
                                    <p className="font-semibold">{property.property_type}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                                    <p className="font-semibold">{property.bedrooms} BR</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Area</p>
                                    <p className="font-semibold">{property.area_sqft} sqft</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                  <div>
                                    {assignedAgent ? (
                                      <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                          <p className="text-xs text-muted-foreground">Assigned Agent</p>
                                          <p className="text-sm font-medium">{assignedAgent.name}</p>
                                          <p className="text-xs text-muted-foreground">{assignedAgent.agency}</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">No agent assigned</span>
                                      </div>
                                    )}
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openAssignDialog(property)}
                                  >
                                    <User className="w-4 h-4 mr-2" />
                                    {assignedAgent ? 'Reassign Agent' : 'Assign Agent'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Document Preview Modal */}
      <Dialog open={!!selectedAttachment} onOpenChange={(open) => !open && setSelectedAttachment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted rounded-lg p-4">
            {selectedAttachment && (
              <>
                {isImageFile(selectedAttachment) ? (
                  <div className="flex items-center justify-center h-full">
                    <img 
                      src={selectedAttachment} 
                      alt={`Document ${attachmentIndex + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : isPdfFile(selectedAttachment) ? (
                  <div className="w-full h-full">
                    <embed 
                      src={selectedAttachment} 
                      type="application/pdf"
                      className="w-full h-[500px]"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Unsupported file format</p>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Agent Modal */}
      <Dialog open={assignAgentDialogOpen} onOpenChange={setAssignAgentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Agent to Property</DialogTitle>
            <DialogDescription>
              {selectedProperty && (
                <span className="block mt-2 font-medium">{selectedProperty.title}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Agent Search */}
            <div>
              <label className="text-sm font-medium mb-2 block">Search Agents</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, email, agency, or phone..."
                  value={agentSearchQuery}
                  onChange={(e) => setAgentSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {agentSearchQuery && (
                <p className="text-xs text-muted-foreground mt-1">
                  Found {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Agent Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Agent</label>
              {filteredAgents.length === 0 ? (
                <div className="p-4 text-center border rounded-lg bg-muted">
                  <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {agents.length === 0 ? 'No agents available' : 'No agents match your search'}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {filteredAgents.map(agent => (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`p-3 cursor-pointer hover:bg-accent transition-colors border-b last:border-b-0 ${
                        selectedAgentId === agent.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          selectedAgentId === agent.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{agent.name}</span>
                            {selectedAgentId === agent.id && (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Building2 className="w-3 h-3" />
                            <span>{agent.agency}</span>
                            <span>•</span>
                            <Mail className="w-3 h-3" />
                            <span>{agent.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Phone className="w-3 h-3" />
                            <span>{agent.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAssignAgentDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignAgent} disabled={!selectedAgentId}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Assign Agent
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Agent Modal */}
      <Dialog open={bulkAssignDialogOpen} onOpenChange={setBulkAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Agent to Multiple Properties</DialogTitle>
            <DialogDescription>
              <span className="block mt-2 font-medium">
                Assigning agent to {selectedPropertyIds.length} propert{selectedPropertyIds.length !== 1 ? 'ies' : 'y'}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Agent Search */}
            <div>
              <label className="text-sm font-medium mb-2 block">Search Agents</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, email, agency, or phone..."
                  value={bulkAgentSearchQuery}
                  onChange={(e) => setBulkAgentSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {bulkAgentSearchQuery && (
                <p className="text-xs text-muted-foreground mt-1">
                  Found {filteredBulkAgents.length} agent{filteredBulkAgents.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Agent Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Agent</label>
              {filteredBulkAgents.length === 0 ? (
                <div className="p-4 text-center border rounded-lg bg-muted">
                  <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {agents.length === 0 ? 'No agents available' : 'No agents match your search'}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {filteredBulkAgents.map(agent => (
                    <div
                      key={agent.id}
                      onClick={() => setBulkAgentId(agent.id)}
                      className={`p-3 cursor-pointer hover:bg-accent transition-colors border-b last:border-b-0 ${
                        bulkAgentId === agent.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          bulkAgentId === agent.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{agent.name}</span>
                            {bulkAgentId === agent.id && (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Building2 className="w-3 h-3" />
                            <span>{agent.agency}</span>
                            <span>•</span>
                            <Mail className="w-3 h-3" />
                            <span>{agent.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Phone className="w-3 h-3" />
                            <span>{agent.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setBulkAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkAssignAgent} disabled={!bulkAgentId}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Assign to {selectedPropertyIds.length} Properties
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Admin;