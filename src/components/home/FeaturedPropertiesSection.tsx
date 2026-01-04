import { Building2, ArrowRight, Grid, List } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PropertyCard, Property } from "@/components/properties/PropertyCard";
import { Link, useNavigate } from "react-router-dom";

export function FeaturedPropertiesSection() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/properties/featured/true");
      const data = await response.json();
      
      if (data.success && data.data) {
        // Transform database properties to component format
        const transformedProperties: Property[] = await Promise.all(
          data.data.map(async (prop: any) => {
            let agentName = prop.agent_name || "Agent";
            
            // Try to fetch agent name if agent_id exists
            if (prop.agent_id && !prop.agent_name) {
              try {
                const agentResponse = await fetch(`http://localhost:3001/api/agents/${prop.agent_id}`);
                const agentData = await agentResponse.json();
                if (agentData.success && agentData.data) {
                  agentName = agentData.data.name || agentData.data.agent_name || "Agent";
                }
              } catch (err) {
                console.error("Error fetching agent:", err);
              }
            }

            return {
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
              agentName: agentName,
              agentVerified: true,
              featured: prop.featured,
              amenities: prop.amenities ? (typeof prop.amenities === 'string' ? prop.amenities.split(',').map(a => a.trim()) : prop.amenities) : [],
            };
          })
        );
        setProperties(transformedProperties);
      }
    } catch (error) {
      console.error("Error fetching featured properties:", error);
      // Fallback to fetch all properties if featured endpoint fails
      try {
        const response = await fetch("http://localhost:3001/api/properties?limit=6");
        const data = await response.json();
        if (data.success && data.data) {
          const transformedProperties: Property[] = await Promise.all(
            data.data.slice(0, 6).map(async (prop: any) => {
              let agentName = prop.agent_name || "Agent";
              
              if (prop.agent_id && !prop.agent_name) {
                try {
                  const agentResponse = await fetch(`http://localhost:3001/api/agents/${prop.agent_id}`);
                  const agentData = await agentResponse.json();
                  if (agentData.success && agentData.data) {
                    agentName = agentData.data.name || agentData.data.agent_name || "Agent";
                  }
                } catch (err) {
                  console.error("Error fetching agent:", err);
                }
              }

              return {
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
                agentName: agentName,
                agentVerified: true,
                featured: prop.featured,
                amenities: prop.amenities ? (typeof prop.amenities === 'string' ? prop.amenities.split(',').map(a => a.trim()) : prop.amenities) : [],
              };
            })
          );
          setProperties(transformedProperties);
        }
      } catch (err) {
        console.error("Error fetching properties:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Separate properties with and without images
  const propertiesWithImages = properties.filter(p => p.images && p.images.length > 0);
  const propertiesWithoutImages = properties.filter(p => !p.images || p.images.length === 0);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm font-medium text-accent uppercase tracking-wider">Premium Listings</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Featured <span className="gradient-text">Properties</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Discover our handpicked selection of premium properties from verified agents.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted">
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
            <Button variant="outline" asChild>
              <Link to="/properties">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading properties...</p>
          </div>
        )}

        {/* No Properties */}
        {!loading && properties.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No properties available</p>
          </div>
        )}

        {/* Properties with Images - Grid View */}
        {!loading && propertiesWithImages.length > 0 && (
          <div className={`mb-8 ${
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
          } stagger-children`}>
            {propertiesWithImages.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                view={viewMode}
                onViewDetails={(id) => navigate(`/property/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Properties without Images - Always List View */}
        {!loading && propertiesWithoutImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-muted-foreground mb-4">
              More Listings
            </h3>
            {propertiesWithoutImages.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                view="list"
                onViewDetails={(id) => navigate(`/property/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
