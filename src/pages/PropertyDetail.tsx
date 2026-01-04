import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Phone,
  Mail,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  state: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  images?: string[];
  agent_name: string;
  agent_id?: string;
  amenities?: string[];
  featured?: boolean;
  created_at?: string;
  latitude?: number;
  longitude?: number;
}

export default function PropertyDetail() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/properties/${propertyId}`);
      const data = await response.json();
      if (data.success && data.data) {
        const prop = data.data;
        // Parse images if string
        if (prop.images && typeof prop.images === 'string') {
          try {
            prop.images = JSON.parse(prop.images);
          } catch {
            prop.images = [];
          }
        }
        // Parse amenities if string
        if (prop.amenities && typeof prop.amenities === 'string') {
          prop.amenities = prop.amenities.split(',').map((a: string) => a.trim());
        }
        setProperty(prop);
      }
    } catch (error) {
      console.error("Error fetching property details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images!.length);
    }
  };

  const handlePrevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + property.images!.length) % property.images!.length
      );
    }
  };

  const handleContactAgent = () => {
    if (property?.agent_id) {
      navigate(`/agent/${property.agent_id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Property not found</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const images = property.images || [];
  const currentImage = images[currentImageIndex];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {images.length > 0 ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative w-full bg-muted overflow-hidden rounded-lg">
                    {/* Main Image */}
                    <img
                      src={currentImage}
                      alt={property.title}
                      className="w-full h-96 object-cover"
                    />

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {images.length > 1 && (
                    <div className="p-4 flex gap-2 overflow-x-auto bg-muted/30">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex ? "border-primary" : "border-transparent hover:border-primary/50"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${property.title} - ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">{property.title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorite ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price and Type */}
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-4xl font-bold text-primary">
                      PKR {property.price.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">{property.property_type}</p>
                  </div>
                  {property.featured && (
                    <Badge variant="premium">Featured</Badge>
                  )}
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Bed className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Bedrooms</span>
                    </div>
                    <p className="text-2xl font-bold">{property.bedrooms}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Bath className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Bathrooms</span>
                    </div>
                    <p className="text-2xl font-bold">{property.bathrooms}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Square className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Area (sqft)</span>
                    </div>
                    <p className="text-2xl font-bold">{property.area_sqft.toLocaleString()}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity, idx) => (
                        <Badge key={idx} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map */}
                {property.latitude && property.longitude && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Location</h3>
                    <div className="w-full h-64 rounded-lg overflow-hidden">
                      <iframe
                        src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Property Location"
                      ></iframe>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full h-24 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold">
                  {property?.agent_name ? property.agent_name.charAt(0) : "A"}
                </div>
                <div>
                  <h4 className="font-semibold">{property?.agent_name || "Agent"}</h4>
                  <p className="text-sm text-muted-foreground">Real Estate Agent</p>
                </div>
                <div className="space-y-2">
                  <Button className="w-full" onClick={handleContactAgent}>
                    View Agent Profile
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="w-4 h-4" />
                    Call Agent
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Mail className="w-4 h-4" />
                    Email Agent
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Property Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="font-semibold capitalize">{property.property_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold">{property.location}</p>
                </div>
                {property.created_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Listed On</p>
                    <p className="font-semibold">
                      {new Date(property.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
