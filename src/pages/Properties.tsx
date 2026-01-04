import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyCard, sampleProperties } from "@/components/properties/PropertyCard";
import { AreaIntelligencePanel } from "@/components/search/AreaIntelligencePanel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Home, DollarSign, Grid, List, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const propertyTypes = ["All", "Apartment", "House", "Villa", "Commercial", "Land"];
const budgetRanges = [
  { label: "Any Budget", value: "" },
  { label: "Under PKR 100K", value: "0-100000" },
  { label: "PKR 100K - PKR 300K", value: "100000-300000" },
  { label: "PKR 300K - PKR 500K", value: "300000-500000" },
  { label: "PKR 500K - PKR 1M", value: "500000-1000000" },
  { label: "PKR 1M+", value: "1000000+" },
];

const Properties = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleViewDetails = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  // Filter properties based on search criteria
  const filteredProperties = sampleProperties.filter((property) => {
    const matchesSearch = !searchQuery || 
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || property.type === selectedType;
    return matchesSearch && matchesType;
  });

  const propertiesWithImages = filteredProperties.filter(p => p.images.length > 0);
  const propertiesWithoutImages = filteredProperties.filter(p => p.images.length === 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">
              Browse <span className="gradient-text">Properties</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover your perfect property from our extensive listings
            </p>
          </div>

          {/* Search & Filters */}
          <Card variant="glass" className="mb-8">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    variant="search"
                    placeholder="Search by area, city, or property name..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>

                {/* Property Type */}
                <div className="relative lg:w-48">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    className="flex h-11 w-full rounded-xl px-10 py-2 text-sm transition-all duration-300 glass-card border-2 border-transparent bg-card/80 backdrop-blur-xl focus:border-primary focus:shadow-glow focus:outline-none appearance-none cursor-pointer"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div className="relative lg:w-48">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    className="flex h-11 w-full rounded-xl px-10 py-2 text-sm transition-all duration-300 glass-card border-2 border-transparent bg-card/80 backdrop-blur-xl focus:border-primary focus:shadow-glow focus:outline-none appearance-none cursor-pointer"
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                  >
                    {budgetRanges.map((range) => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <Button variant="hero" onClick={handleSearch} className="lg:w-auto">
                  <Search className="w-5 h-5" />
                  Search
                </Button>
              </div>

              {/* Active Filters */}
              {(selectedType !== "All" || selectedBudget || searchQuery) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                    >
                      "{searchQuery}"
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {selectedType !== "All" && (
                    <button
                      onClick={() => setSelectedType("All")}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                    >
                      {selectedType}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {selectedBudget && (
                    <button
                      onClick={() => setSelectedBudget("")}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                    >
                      {budgetRanges.find(r => r.value === selectedBudget)?.label}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Area Intelligence Panel (shows after search) */}
          {hasSearched && searchQuery && (
            <div className="mb-8 animate-fade-in">
              <AreaIntelligencePanel />
            </div>
          )}

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredProperties.length}</span> properties
            </p>
            <div className="flex items-center gap-2">
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
            </div>
          </div>

          {/* Properties Grid */}
          {propertiesWithImages.length > 0 && (
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
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {/* Properties without Images - List View */}
          {propertiesWithoutImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Additional Listings
              </h3>
              {propertiesWithoutImages.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  view="list"
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredProperties.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Home className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Properties;
