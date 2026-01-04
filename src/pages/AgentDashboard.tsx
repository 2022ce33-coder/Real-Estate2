import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import {
  Home, Plus, Edit2, Trash2, Eye, MapPin, DollarSign, Users,
  TrendingUp, AlertCircle, CheckCircle, Clock, FileText, Phone, Mail,
  Building2, Award, Briefcase
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const AVAILABLE_AMENITIES = [
  "Swimming Pool", "Gym/Fitness Center", "Parking", "Security System", "Concierge",
  "Garden", "Garage", "Smart Home Features", "Solar Panels", "Laundry Room",
  "Rooftop Terrace", "Fireplace", "Storage Room", "Balcony", "Elevator",
  "Air Conditioning", "Heating", "Dishwasher", "Washer/Dryer", "Pet Friendly",
  "Playground", "Tennis Court", "Basketball Court", "Sauna", "Jacuzzi",
  "Library", "Home Theater", "Wine Cellar", "Walk-in Closet", "Hardwood Floors"
];

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

const DESCRIPTION_TEMPLATES = [
  "This beautiful {property_type} offers {bedrooms} bedrooms and {bathrooms} bathrooms in a prime location.",
  "Located in {city}, this spacious {area_sqft} sq ft property features modern amenities and excellent facilities.",
  "A perfect family home with {bedrooms} comfortable bedrooms, {bathrooms} well-appointed bathrooms, and a large living area.",
  "Experience luxury living in this {property_type} with stunning views and premium finishes throughout.",
  "This property combines comfort and convenience with {bedrooms} bedrooms, {bathrooms} bathrooms, and easy access to local amenities."
];

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  agency: string;
  experience: string;
  status?: string;
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
  state: string;
  zip_code: string;
  images: string[];
  amenities: string[];
  status: string;
  featured: boolean;
  created_at?: string;
  latitude?: number;
  longitude?: number;
}

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalViews: 0,
    totalInquiries: 0
  });

  const [formData, setFormData] = useState<Partial<Property>>({
    title: "",
    description: "",
    price: 0,
    property_type: "residential",
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 0,
    address: "",
    city: "",
    state: "",
    zip_code: "",
    images: [],
    amenities: [],
    status: "available",
    featured: false,
    latitude: undefined,
    longitude: undefined
  });

  // Check authentication and fetch agent data
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.type !== "agent") {
        navigate("/");
        return;
      }
      setAgent(parsedUser);
      fetchAgentProperties(parsedUser.id, token);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login");
    }
  }, [navigate]);

  const fetchAgentProperties = async (agentId: string, token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/agents/${agentId}/properties`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProperties(data.data || []);
        // Calculate stats
        const activeListings = (data.data || []).filter((p: Property) => p.status === "available").length;
        setStats({
          totalProperties: data.data?.length || 0,
          activeListings,
          totalViews: Math.floor(Math.random() * 500), // Placeholder
          totalInquiries: Math.floor(Math.random() * 50) // Placeholder
        });
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  // Geocode address to get latitude and longitude
  const geocodeAddress = async () => {
    if (!formData.address || !formData.city || !formData.state) {
      alert("Please fill in address, city, and state first");
      return;
    }

    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}, Pakistan`;
    
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData({
          ...formData,
          latitude: Number(lat),
          longitude: Number(lon)
        });
        alert("Location coordinates fetched successfully!");
      } else {
        alert("Could not find coordinates for this address. Please enter them manually.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Error fetching location coordinates. Please try again or enter manually.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!agent || !token) return;

      // Upload images first if any
      let uploadedImageUrls: string[] = [];
      if (uploadedImages.length > 0) {
        for (const file of uploadedImages) {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          uploadedImageUrls.push(base64);
        }
      }

      const propertyData = {
        ...formData,
        agent_id: agent.id,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area_sqft: Number(formData.area_sqft),
        amenities: selectedAmenities,
        images: [...(formData.images || []), ...uploadedImageUrls]
      };

      const url = editingProperty
        ? `http://localhost:3001/api/properties/${editingProperty.id}`
        : "http://localhost:3001/api/properties";

      const method = editingProperty ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      });

      const data = await response.json();

      if (data.success) {
        alert(editingProperty ? "Property updated successfully!" : "Property added successfully!");
        setShowAddProperty(false);
        setEditingProperty(null);
        setFormData({
          title: "",
          description: "",
          price: 0,
          property_type: "residential",
          bedrooms: 1,
          bathrooms: 1,
          area_sqft: 0,
          address: "",
          city: "",
          state: "",
          zip_code: "",
          images: [],
          amenities: [],
          status: "available",
          featured: false,
          latitude: undefined,
          longitude: undefined
        });
        setSelectedAmenities([]);
        setUploadedImages([]);
        setImageUrls([]);
        await fetchAgentProperties(agent.id, token);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error saving property:", error);
      alert("Error saving property");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`http://localhost:3001/api/properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert("Property deleted successfully!");
        if (agent) {
          await fetchAgentProperties(agent.id, token);
        }
      } else {
        alert("Error deleting property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const handleEditProperty = (property: Property) => {
    setFormData(property);
    // Ensure amenities is always an array
    const amenitiesArray = Array.isArray(property.amenities) ? property.amenities : [];
    setSelectedAmenities(amenitiesArray);
    setImageUrls(property.images || []);
    setEditingProperty(property);
    setShowAddProperty(true);
  };

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value });
    
    // Generate suggestions based on current input
    if (value.length > 10) {
      const suggestions = DESCRIPTION_TEMPLATES.map(template => 
        template.replace(/{property_type}/g, formData.property_type || 'property')
                .replace(/{bedrooms}/g, (formData.bedrooms || 1).toString())
                .replace(/{bathrooms}/g, (formData.bathrooms || 1).toString())
                .replace(/{area_sqft}/g, (formData.area_sqft || 0).toString())
                .replace(/{city}/g, formData.city || 'the area')
      ).filter(suggestion => 
        suggestion.toLowerCase().includes(value.toLowerCase().slice(-5))
      );
      setDescriptionSuggestions(suggestions.slice(0, 3));
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const applyDescriptionTemplate = (template: string) => {
    const filledTemplate = template.replace(/{property_type}/g, formData.property_type || 'property')
                                  .replace(/{bedrooms}/g, (formData.bedrooms || 1).toString())
                                  .replace(/{bathrooms}/g, (formData.bathrooms || 1).toString())
                                  .replace(/{area_sqft}/g, (formData.area_sqft || 0).toString())
                                  .replace(/{city}/g, formData.city || 'the area');
    setFormData({ ...formData, description: filledTemplate });
    setShowSuggestions(false);
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedImages(prev => [...prev, ...newFiles]);
      
      // Create preview URLs
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Jan", properties: 2 },
    { name: "Feb", properties: 3 },
    { name: "Mar", properties: 4 },
    { name: "Apr", properties: stats.totalProperties },
    { name: "May", properties: stats.totalProperties },
    { name: "Jun", properties: stats.totalProperties }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold gradient-text mb-2">Agent Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {agent.name}!</p>
            </div>
          </div>

          {/* Pending Approval Message */}
          {agent.status === 'pending' && (
            <Card className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-amber-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Pending Approval</h3>
                    <p className="text-amber-700 dark:text-amber-300">Your agent application is currently under review by our admin team. You will be able to access all dashboard features once approved.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total Properties</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalProperties}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Active Listings</p>
                    <p className="text-3xl font-bold mt-2">{stats.activeListings}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total Views</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalViews}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Inquiries</p>
                    <p className="text-3xl font-bold mt-2">{stats.totalInquiries}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Profile Card */}
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {agent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Name</p>
                    <p className="font-semibold">{agent.name}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
                      <p className="text-sm break-all">{agent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Phone</p>
                      <p className="text-sm">{agent.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Agency</p>
                      <p className="text-sm">{agent.agency}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Experience</p>
                      <p className="text-sm">{agent.experience} years</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Properties Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="properties"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Properties Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">My Properties</h2>
                <p className="text-muted-foreground text-sm">Manage and view all your listings</p>
              </div>
              <Dialog open={showAddProperty} onOpenChange={setShowAddProperty}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={() => { setEditingProperty(null); setFormData({
                    title: "",
                    description: "",
                    price: 0,
                    property_type: "residential",
                    bedrooms: 1,
                    bathrooms: 1,
                    area_sqft: 0,
                    address: "",
                    city: "",
                    state: "",
                    zip_code: "",
                    images: [],
                    status: "available",
                    featured: false
                  }); }}>
                    <Plus className="w-4 h-4" />
                    Add Property
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProperty ? "Edit Property" : "Add New Property"}
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleAddProperty} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Property Title *</label>
                      <Input
                        placeholder="e.g., Beautiful House in Downtown"
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="relative">
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        placeholder="Detailed description of the property..."
                        value={formData.description || ""}
                        onChange={(e) => handleDescriptionChange(e.target.value)}
                        rows={4}
                      />
                      {showSuggestions && descriptionSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg">
                          {descriptionSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => applyDescriptionTemplate(suggestion)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {DESCRIPTION_TEMPLATES.slice(0, 3).map((template, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => applyDescriptionTemplate(template)}
                            className="text-xs"
                          >
                            Template {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Amenities</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        {AVAILABLE_AMENITIES.map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              id={amenity}
                              checked={selectedAmenities.includes(amenity)}
                              onCheckedChange={() => handleAmenityToggle(amenity)}
                            />
                            <label
                              htmlFor={amenity}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {amenity}
                            </label>
                          </div>
                        ))}
                      </div>
                      {selectedAmenities.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedAmenities.map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Images */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Property Images</label>
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <div className="text-center">
                              <Home className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Click to upload images or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, GIF up to 10MB each
                              </p>
                            </div>
                          </label>
                        </div>
                        
                        {/* Image Preview */}
                        {imageUrls.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Array.isArray(imageUrls) && imageUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Property ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Price (PKR) *</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.price || ""}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Property Type *</label>
                        <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="residential">Residential</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Bedrooms & Bathrooms */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Bedrooms *</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.bedrooms || ""}
                          onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Bathrooms *</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.bathrooms || ""}
                          onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                          required
                        />
                      </div>
                    </div>

                    {/* Area */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Area (Sq Ft) *</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.area_sqft || ""}
                        onChange={(e) => setFormData({ ...formData, area_sqft: Number(e.target.value) })}
                        required
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Address *</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Street address"
                          value={formData.address || ""}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          required
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={geocodeAddress}
                          disabled={isGeocoding}
                          className="px-3"
                          title="Fetch coordinates from address"
                        >
                          {isGeocoding ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click the map icon to automatically fetch latitude and longitude from the address
                      </p>
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
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
                        <label className="block text-sm font-medium mb-2">State/Province *</label>
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

                    {/* Zip Code */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Zip Code</label>
                      <Input
                        placeholder="e.g., 44000"
                        value={formData.zip_code || ""}
                        onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                      />
                    </div>

                    {/* Latitude & Longitude */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Latitude</label>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g., 31.5497"
                          value={formData.latitude || ""}
                          onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? Number(e.target.value) : undefined })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Auto-filled from address or manual entry</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Longitude</label>
                        <Input
                          type="number"
                          step="any"
                          placeholder="e.g., 74.3436"
                          value={formData.longitude || ""}
                          onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? Number(e.target.value) : undefined })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Auto-filled from address or manual entry</p>
                      </div>
                    </div>

                    {/* Status & Featured */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Status *</label>
                        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Featured</label>
                        <Select value={formData.featured ? "true" : "false"} onValueChange={(value) => setFormData({ ...formData, featured: value === "true" })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddProperty(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? "Saving..." : (editingProperty ? "Update Property" : "Add Property")}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Properties Grid */}
            {properties.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white dark:bg-slate-800 text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first property to get started!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card
                    key={property.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white dark:bg-slate-800"
                  >
                    {/* Property Image */}
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 relative overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Home className="w-12 h-12 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2">
                        {property.featured && (
                          <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Featured
                          </div>
                        )}
                        <div className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                          property.status === "available" ? "bg-green-500" :
                          property.status === "sold" ? "bg-red-500" :
                          "bg-orange-500"
                        }`}>
                          {property.status}
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-1">{property.title}</h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span className="font-bold text-lg text-emerald-600">
                            {new Intl.NumberFormat("en-US").format(property.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{property.city}, {property.state}</span>
                        </div>

                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">{property.bedrooms}</span> Beds
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">{property.bathrooms}</span> Baths
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-semibold">{property.area_sqft}</span> Sq Ft
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditProperty(property)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AgentDashboard;
