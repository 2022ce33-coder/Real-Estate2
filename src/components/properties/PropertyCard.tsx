import { MapPin, Bed, Bath, Square, Heart, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export interface Property {
  id: string;
  title: string;
  price: number;
  location?: string;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  agentName?: string;
  agentVerified?: boolean;
  featured?: boolean;
}

interface PropertyCardProps {
  property: Property;
  view?: "grid" | "list";
  onViewDetails?: (id: string) => void;
}

export function PropertyCard({ property, view = "grid", onViewDetails }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const hasImages = property.images && property.images.length > 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(price);
  }; 

  // Grid View with Images
  if (view === "grid" && hasImages) {
    return (
      <Card variant="interactive" className="overflow-hidden group">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {property.featured && (
              <Badge variant="premium">Featured</Badge>
            )}
            {property.type && <Badge variant="glass">{property.type}</Badge>}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? "fill-destructive text-destructive" : "text-foreground"
              }`}
            />
          </button>

          {/* Price */}
          <div className="absolute bottom-4 left-4">
            <p className="text-2xl font-bold text-primary-foreground">
              {formatPrice(property.price)}
            </p>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title & Location */}
          <h3 className="font-semibold text-lg truncate">{property.title}</h3>
          {property.location && (
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm truncate">{property.location}</span>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {property.description}
            </p>
          )}

          {/* Features */}
          <div className="flex items-center gap-4 mt-4 py-3 border-t border-border/50">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{property.bathrooms}</span>
              </div>
            )}
            {property.area && (
              <div className="flex items-center gap-1">
                <Square className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{property.area} sqft</span>
              </div>
            )}
          </div>

          {/* Agent */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">By</span>
              <span className="text-sm font-medium">{property.agentName}</span>
              {property.agentVerified && (
                <CheckCircle className="w-4 h-4 text-verified" />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails?.(property.id)}
            >
              Details →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List View (no images or explicit list view)
  return (
    <Card variant="interactive" className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg">{property.title}</h3>
              {property.type && <Badge variant="glass">{property.type}</Badge>}
              {property.featured && <Badge variant="premium">Featured</Badge>}
            </div>
            
            {property.location && (
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="text-sm truncate">{property.location}</span>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {property.description}
              </p>
            )}

            {/* Features Row */}
            <div className="flex items-center gap-4 mt-3">
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{property.bedrooms} beds</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{property.bathrooms} baths</span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-1">
                  <Square className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{property.area} sqft</span>
                </div>
              )}
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {property.amenities.slice(0, 4).map((amenity) => (
                  <span
                    key={amenity}
                    className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                  >
                    {amenity}
                  </span>
                ))}
                {property.amenities.length > 4 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    +{property.amenities.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price & Actions */}
          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
            <p className="text-2xl font-bold gradient-text">
              {formatPrice(property.price)}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{property.agentName || "Agent"}</span>
              {property.agentVerified && (
                <CheckCircle className="w-4 h-4 text-verified" />
              )}
            </div>
            <Button
              variant="hero"
              size="sm"
              onClick={() => onViewDetails?.(property.id)}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sample properties data
export const sampleProperties: Property[] = [
  {
    id: "1",
    title: "Luxury Penthouse Suite",
    price: 1250000,
    location: "Karachi, Pakistan",
    type: "Apartment",
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    amenities: ["Pool", "Gym", "Parking", "Security", "Concierge"],
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
    agentName: "Sarah Johnson",
    agentVerified: true,
    featured: true,
  },
  {
    id: "2",
    title: "Modern Family Home",
    price: 750000,
    location: "Lahore, Pakistan",
    type: "House",
    bedrooms: 5,
    bathrooms: 4,
    area: 3500,
    amenities: ["Garden", "Garage", "Smart Home", "Solar Panels"],
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"],
    agentName: "Michael Chen",
    agentVerified: true,
  },
  {
    id: "3",
    title: "Downtown Studio",
    price: 450000,
    location: "Islamabad, Pakistan",
    type: "Apartment",
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    amenities: ["Gym", "Rooftop", "Laundry"],
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
    agentName: "Emily Davis",
    agentVerified: true,
  },
  {
    id: "4",
    title: "Cozy Brownstone",
    price: 890000,
    location: "Faisalabad, Pakistan",
    type: "House",
    bedrooms: 3,
    bathrooms: 2,
    area: 2200,
    amenities: ["Backyard", "Fireplace", "Storage"],
    images: [],
    agentName: "David Wilson",
    agentVerified: true,
  },
  {
    id: "5",
    title: "Investment Property",
    price: 320000,
    location: "Rawalpindi, Pakistan",
    type: "Commercial",
    bedrooms: 0,
    bathrooms: 2,
    area: 1800,
    amenities: ["Parking", "Loading Dock", "Office Space"],
    images: [],
    agentName: "Sarah Johnson",
    agentVerified: true,
  },
];
