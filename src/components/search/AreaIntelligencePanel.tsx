import { MapPin, School, Hospital, ShoppingBag, Train, Trees, Shield, Sparkles, Search, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { fetchAreaIntelligence, getAmenityExamples } from "@/lib/areaIntelligence";

interface AreaInfo {
  name: string;
  description: string;
  amenities: { icon: React.ElementType; label: string }[];
  stats: { label: string; value: string }[];
}

interface AmenityExample {
  name: string;
  description: string;
}

interface AreaIntelligencePanelProps {
  area?: AreaInfo;
  isLoading?: boolean;
}

const defaultArea: AreaInfo = {
  name: "Karachi, Pakistan",
  description: "Karachi is Pakistan's largest city and economic hub with diverse neighborhoods. It offers luxury apartments to sprawling developments with excellent transport, healthcare, and shopping facilities.",
  amenities: [
    { icon: School, label: "Top Schools" },
    { icon: Hospital, label: "Healthcare" },
    { icon: ShoppingBag, label: "Shopping" },
    { icon: Train, label: "Transport Links" },
    { icon: Trees, label: "Parks" },
    { icon: Shield, label: "Safe Area" },
  ],
  stats: [
    { label: "Avg. Price", value: "PKR 120M" },
    { label: "Properties", value: "450+" },
    { label: "Agents", value: "85" },
    { label: "Rating", value: "4.8" },
  ],
};

const amenityIcons = [
  { icon: School, label: "Top Schools" },
  { icon: Hospital, label: "Healthcare" },
  { icon: ShoppingBag, label: "Shopping" },
  { icon: Train, label: "Transport Links" },
  { icon: Trees, label: "Parks" },
  { icon: Shield, label: "Safe Area" },
];

export function AreaIntelligencePanel({ area = defaultArea, isLoading: initialLoading }: AreaIntelligencePanelProps) {
  const [searchArea, setSearchArea] = useState("");
  const [currentArea, setCurrentArea] = useState<AreaInfo>(defaultArea);
  const [isLoading, setIsLoading] = useState(initialLoading || false);
  const [selectedAmenity, setSelectedAmenity] = useState<string | null>(null);
  const [amenityExamples, setAmenityExamples] = useState<AmenityExample[]>([]);
  const [loadingExamples, setLoadingExamples] = useState(false);

  const fetchAmenityExamples = async (amenity: string, areaName: string) => {
    setLoadingExamples(true);
    setSelectedAmenity(amenity);
    try {
      // First try to get examples from web search
      const examples = await fetchAmenityExamplesFromWeb(amenity, areaName);
      
      if (examples && examples.length > 0) {
        setAmenityExamples(examples);
      } else {
        // Fallback to local data
        const localExamples = getAmenityExamples(amenity, areaName);
        const formattedExamples: AmenityExample[] = localExamples.map((name) => ({
          name,
          description: `${name} - A notable facility in ${areaName}`,
        }));
        setAmenityExamples(formattedExamples);
      }
    } catch (error) {
      console.error("Error fetching amenity examples:", error);
      // Fallback to local examples
      const localExamples = getAmenityExamples(amenity, areaName);
      const formattedExamples: AmenityExample[] = localExamples.map((name) => ({
        name,
        description: `${name} - A facility in ${areaName}`,
      }));
      setAmenityExamples(formattedExamples);
    } finally {
      setLoadingExamples(false);
    }
  };

  // Fetch amenity examples from web using search
  const fetchAmenityExamplesFromWeb = async (amenity: string, areaName: string): Promise<AmenityExample[] | null> => {
    try {
      // Use backend endpoint to fetch area-specific amenities
      const searchQuery = `best ${amenity.toLowerCase()} in ${areaName}`;
      
      // This calls the backend endpoint that returns area-specific data
      const response = await fetch(
        `http://localhost:3001/api/search/amenities?q=${encodeURIComponent(searchQuery)}&area=${encodeURIComponent(areaName)}&amenity=${encodeURIComponent(amenity)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          // Filter out error messages and format data
          const validResults = data.data.filter((item: any) => item.name !== "Not Found");
          
          if (validResults.length > 0) {
            return validResults.map((item: any) => ({
              name: item.name || item.title,
              description: item.description || item.snippet || "A notable facility in the area",
            }));
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching from web search:", error);
      return null;
    }
  };

  const generateAreaInsights = async (areaName: string) => {
    if (!areaName.trim()) return;

    setIsLoading(true);
    try {
      // Fetch area data (from Wikipedia API if available)
      const areaData = await fetchAreaIntelligence(areaName);
      
      if (!areaData) {
        alert(`Area "${areaName}" not found. Try searching for Pakistani cities or areas like: Karachi, Lahore, Islamabad, DHA, etc.`);
        setIsLoading(false);
        return;
      }

      // Map amenities with icons
      let amenities = areaData.amenities
        .map((amenity) => {
          const match = amenityIcons.find((a) =>
            amenity.toLowerCase().includes(a.label.toLowerCase()) ||
            a.label.toLowerCase().includes(amenity.toLowerCase())
          );
          return match || { icon: Shield, label: amenity };
        });

      // Fetch area stats from database
      let avgPrice = areaData.facts["avgPrice"] || "N/A";
      let propertyCount = "0";
      let agentCount = "0";

      try {
        const propertiesResponse = await fetch(
          `http://localhost:3001/api/properties?city=${encodeURIComponent(areaName)}`
        );
        const propertiesData = await propertiesResponse.json();
        if (propertiesData.success && propertiesData.data && propertiesData.data.length > 0) {
          propertyCount = propertiesData.data.length.toString();
          const total = propertiesData.data.reduce((sum: number, p: any) => sum + (p.price || 0), 0);
          const avg = Math.round(total / propertiesData.data.length);
          avgPrice = `PKR ${Math.round(avg / 1000000)}M`;
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }

      try {
        const agentsResponse = await fetch(
          `http://localhost:3001/api/agents/city/${encodeURIComponent(areaName)}`
        );
        const agentsData = await agentsResponse.json();
        if (agentsData.success && agentsData.data) {
          agentCount = agentsData.data.length.toString();
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      }

      setCurrentArea({
        name: areaName,
        description: areaData.description,
        amenities,
        stats: [
          { label: "Avg. Price", value: avgPrice },
          { label: "Properties", value: propertyCount },
          { label: "Agents", value: agentCount },
          { label: "Rating", value: "4.8" },
        ],
      });

      setSearchArea("");
      setSelectedAmenity(null);
      setAmenityExamples([]);
    } catch (error) {
      console.error("Error generating insights:", error);
      alert("Error generating area insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    generateAreaInsights(searchArea);
  };

  if (isLoading) {
    return (
      <Card variant="glass" className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-20 bg-muted rounded" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 bg-muted rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">AI-Generated Insights</p>
              <CardTitle className="text-xl">{currentArea.name}</CardTitle>
            </div>
          </div>
          <Badge variant="premium">
            <MapPin className="w-3 h-3 mr-1" />
            Area Intel
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for any area (e.g., Islamabad, Lahore, Karachi...)"
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            type="submit"
            variant="hero"
            disabled={!searchArea.trim() || isLoading}
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </form>

        {/* Description */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 border border-primary/10">
          <p className="text-muted-foreground leading-relaxed font-medium text-sm">
            {currentArea.description}
          </p>
        </div>

        {/* Amenities */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Area Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {currentArea.amenities.map((amenity) => (
              <button
                key={amenity.label}
                onClick={() => fetchAmenityExamples(amenity.label, currentArea.name)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  selectedAmenity === amenity.label
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/50 hover:bg-muted text-foreground hover:shadow-sm"
                }`}
              >
                <amenity.icon className="w-4 h-4" />
                <span className="text-sm">{amenity.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amenity Examples Modal */}
        {selectedAmenity && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md max-h-96 overflow-auto animate-in fade-in slide-in-from-bottom-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">{selectedAmenity} Examples</CardTitle>
                <button
                  onClick={() => {
                    setSelectedAmenity(null);
                    setAmenityExamples([]);
                  }}
                  className="rounded-md p-1 hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingExamples ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : amenityExamples.length > 0 ? (
                  amenityExamples.map((example, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <p className="font-medium text-sm text-foreground">{example.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{example.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No examples available</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/50">
          {currentArea.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
