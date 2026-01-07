import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Eye, Home, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LiveChat, ChatToggleButton } from "@/components/chat/LiveChat";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  description?: string;
  city?: string;
  state?: string;
  images?: string;
  amenities?: string;
  featured?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu and Kashmir",
  "Gilgit-Baltistan"
];

const PAKISTAN_CITIES = [
  // Punjab
  "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan", "Bahawalpur", "Sargodha", "Sialkot", "Sheikhupura", "Jhang",
  // Sindh
  "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas", "Jacobabad", "Shikarpur",
  // Khyber Pakhtunkhwa
  "Peshawar", "Mardan", "Mingora", "Kohat", "Dera Ismail Khan", "Abbottabad", "Mansehra", "Swabi",
  // Balochistan
  "Quetta", "Turbat", "Sibi", "Gwadar", "Khuzdar", "Chaman", "Loralai", "Zhob",
  // Islamabad
  "Islamabad",
  // Azad Jammu and Kashmir
  "Muzaffarabad", "Mirpur", "Kotli", "Bhimber", "Rawalakot",
  // Gilgit-Baltistan
  "Gilgit", "Skardu", "Chilas", "Hunza", "Ghizer"
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    city: "",
    state: "",
    type: "Apartment",
    bedrooms: "1",
    bathrooms: "1",
    area_sqft: "",
    description: "",
    images: "",
    amenities: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (!userData || !token) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchUserProperties(parsedUser.id);
    fetchUnreadCount(parsedUser.id);
  }, [navigate]);

  // Fetch unread message count
  const fetchUnreadCount = async (userId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:3001/api/chat/unread-count?userId=${userId}&userType=user`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Poll for unread messages
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchUnreadCount(user.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUserProperties = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/properties/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error("Error fetching user properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    try {
      const url = editingId
        ? `http://localhost:3001/api/properties/${editingId}`
        : "http://localhost:3001/api/properties";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          area_sqft: parseInt(formData.area_sqft),
          user_id: user?.id,
          agent_id: user?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingId ? "Property updated successfully!" : "Property added successfully!");
        setShowAddForm(false);
        setEditingId(null);
        resetForm();
        fetchUserProperties(user!.id);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error saving property:", error);
      alert("Failed to save property");
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`http://localhost:3001/api/properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert("Property deleted successfully!");
        fetchUserProperties(user!.id);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Failed to delete property");
    }
  };

  const handleEditProperty = (property: Property) => {
    setFormData({
      title: property.title,
      price: property.price.toString(),
      location: property.location,
      city: property.city || "",
      state: property.state || "",
      type: property.type,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      area_sqft: property.area_sqft.toString(),
      description: property.description || "",
      images: property.images || "",
      amenities: property.amenities || "",
    });
    setEditingId(property.id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      location: "",
      city: "",
      state: "",
      type: "Apartment",
      bedrooms: "1",
      bathrooms: "1",
      area_sqft: "",
      description: "",
      images: "",
      amenities: "",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user.name}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>

        {/* Add Property Button */}
        <Button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowAddForm(true);
          }}
          className="mb-8 gap-2"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Add New Property
        </Button>

        {/* Properties List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Properties ({properties.length})</h2>

          {loading ? (
            <p className="text-muted-foreground">Loading properties...</p>
          ) : properties.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  No properties listed yet. Click "Add New Property" to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{property.title}</h3>
                          {property.featured && <Badge variant="premium">Featured</Badge>}
                        </div>
                        <p className="text-muted-foreground mb-3">{property.location}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Price</p>
                            <p className="font-semibold text-lg">
                              PKR {property.price.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Type</p>
                            <p className="font-semibold">{property.type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Beds</p>
                            <p className="font-semibold">{property.bedrooms}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Baths</p>
                            <p className="font-semibold">{property.bathrooms}</p>
                          </div>
                        </div>

                        {property.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {property.description.substring(0, 150)}...
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProperty(property)}
                          className="gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/property/${property.id}`)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProperty(property.id)}
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Property Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Property" : "Add New Property"}</DialogTitle>
            <DialogDescription>
              Fill in the details of your property to list it for sale or rent
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddProperty} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Property Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                placeholder="Price (PKR)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Commercial">Commercial</option>
                <option value="Land">Land</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select value={formData.city || ""} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAKISTAN_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={formData.state || ""} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a province" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAKISTAN_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                required
              />
              <Input
                placeholder="Bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                required
              />
              <Input
                placeholder="Area (sqft)"
                type="number"
                value={formData.area_sqft}
                onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })}
                required
              />
            </div>

            <textarea
              className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Input
              placeholder="Image URLs (comma-separated)"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
            />

            <Input
              placeholder="Amenities (comma-separated)"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
            />

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Update Property" : "Add Property"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Live Chat */}
      {user && (
        <>
          {!isChatOpen && (
            <ChatToggleButton 
              onClick={() => setIsChatOpen(true)} 
              unreadCount={unreadCount}
            />
          )}
          <LiveChat
            currentUserId={user.id}
            currentUserName={user.name}
            currentUserType="user"
            isOpen={isChatOpen}
            onClose={() => {
              setIsChatOpen(false);
              fetchUnreadCount(user.id);
            }}
          />
        </>
      )}

      <Footer />
    </div>
  );
}
