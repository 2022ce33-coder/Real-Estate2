import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Star, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyCard, Property } from "@/components/properties/PropertyCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  bio?: string;
  rating?: number;
  image?: string;
}

export default function AgentProfile() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (agentId) {
      fetchAgentDetails();
      fetchAgentProperties();
    }
  }, [agentId]);

  const fetchAgentDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/agents/${agentId}`);
      const data = await response.json();
      if (data.success && data.data) {
        setAgent(data.data);
      }
    } catch (error) {
      console.error("Error fetching agent details:", error);
    }
  };

  const fetchAgentProperties = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/agents/${agentId}/properties`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const transformedProperties: Property[] = data.data.map((prop: any) => ({
          id: prop.id,
          title: prop.title,
          price: prop.price,
          description: prop.description,
          location: `${prop.city || ""}, ${prop.state || ""}`.trim(),
          type: prop.property_type,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          area: prop.area_sqft,
          images: prop.images ? (typeof prop.images === 'string' ? JSON.parse(prop.images) : prop.images) : [],
          agentName: prop.agent_name || "Agent",
          agentVerified: true,
          featured: prop.featured,
          amenities: prop.amenities ? (typeof prop.amenities === 'string' ? prop.amenities.split(',').map(a => a.trim()) : prop.amenities) : [],
        }));
        setProperties(transformedProperties);
      }
    } catch (error) {
      console.error("Error fetching agent properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Agent Profile Card */}
        {agent && (
          <Card className="mb-12">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Agent Image */}
                <div className="flex-shrink-0">
                  <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-bold">
                    {agent.name.charAt(0)}
                  </div>
                </div>

                {/* Agent Info */}
                <div className="flex-grow">
                  <h1 className="text-4xl font-bold mb-2">{agent.name}</h1>
                  
                  <div className="flex items-center gap-4 mb-4">
                    {agent.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{agent.rating}</span>
                      </div>
                    )}
                    <span className="text-muted-foreground">{properties.length} Properties</span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <a href={`mailto:${agent.email}`} className="text-primary hover:underline">
                        {agent.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <a href={`tel:${agent.phone}`} className="text-primary hover:underline">
                        {agent.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">{agent.city}</span>
                    </div>
                  </div>

                  {agent.bio && (
                    <p className="text-muted-foreground leading-relaxed">{agent.bio}</p>
                  )}

                  <Button size="lg" className="mt-6">
                    Contact Agent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Properties Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Properties</h2>
              <p className="text-muted-foreground">
                {properties.length} {properties.length === 1 ? 'property' : 'properties'} available
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted w-fit">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-card shadow-sm" : "hover:bg-card/50"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-card shadow-sm" : "hover:bg-card/50"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No properties available from this agent</p>
            </div>
          ) : (
            <div
              className={`${
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }`}
            >
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  view={viewMode}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
