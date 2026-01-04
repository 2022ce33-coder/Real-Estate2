import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, FileText, User, Building2, Phone, Mail, MapPin, Maximize2, X } from "lucide-react";
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

const Admin = () => {
  const [applications, setApplications] = useState<AgentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  const [attachmentIndex, setAttachmentIndex] = useState<number>(0);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/agent-applications');
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

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/agent-applications/${id}/approve`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        alert('Application approved successfully!');
        fetchApplications(); // Refresh the list
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
      const response = await fetch(`http://localhost:3001/api/agent-applications/${id}/reject`, {
        method: 'POST',
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage agent applications</p>
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

      <Footer />
    </div>
  );
};

export default Admin;