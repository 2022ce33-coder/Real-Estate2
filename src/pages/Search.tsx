import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AreaIntelligencePanel } from "@/components/search/AreaIntelligencePanel";
import { AgentCard } from "@/components/agents/AgentCard";
import { PropertyCard, sampleProperties } from "@/components/properties/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon, MapPin, Home, DollarSign, Grid, List, Users, Building2, School, Hospital, ShoppingBag, Train, Trees, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchAgentsByArea, fetchAllAgents } from "@/lib/agentService";
import type { AgentData } from "@/lib/agentService";

const SearchPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<"agents" | "properties">("agents");
  const [filteredAgents, setFilteredAgents] = useState<AgentData[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Consider it a search only when there is a non-empty query
    setHasSearched(Boolean(searchQuery.trim()));
  };

  const location = useLocation();

  // initialize filters from query params when the page loads / location changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const area = params.get("area") ?? "";
    const type = params.get("type") ?? "";
    const budget = params.get("budget") ?? "";
    setSearchQuery(area);
    setSelectedType(type);
    setSelectedBudget(budget);
    setHasSearched(Boolean(area || type || budget));
    
    // Fetch agents from database
    const loadAgents = async () => {
      setLoadingAgents(true);
      try {
        let agents: AgentData[];
        if (area.trim()) {
          agents = await fetchAgentsByArea(area);
        } else {
          agents = await fetchAllAgents();
        }
        setFilteredAgents(agents);
      } catch (error) {
        console.error("Error loading agents:", error);
        setFilteredAgents([]);
      } finally {
        setLoadingAgents(false);
      }
    };
    
    loadAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  function matchesBudget(price: number, range: string) {
    if (!range) return true;
    if (range.includes("-")) {
      const [minStr, maxStr] = range.split("-");
      const min = Number(minStr || 0);
      const max = Number(maxStr || Infinity);
      return price >= min && price <= max;
    }
    if (range.endsWith("+")) {
      const min = Number(range.replace("+", ""));
      return price >= min;
    }
    return true;
  }

  const filteredProperties = sampleProperties.filter((p) => {
    const matchesQuery = !searchQuery || p.location.toLowerCase().includes(searchQuery.toLowerCase()) || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || selectedType === "" || p.type.toLowerCase() === selectedType.toLowerCase();
    const matchesBudgetFlag = matchesBudget(p.price, selectedBudget);
    return matchesQuery && matchesType && matchesBudgetFlag;
  });

  const propertiesWithImages = filteredProperties.filter((p) => p.images.length > 0);
  const propertiesWithoutImages = filteredProperties.filter((p) => p.images.length === 0);

  // Build a simple dynamic area object when searching for a specific city
  const areaForPanel = searchQuery.trim()
    ? (() => {
        const name = searchQuery.trim();
        const priceFormatter = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
        const avgPrice = filteredProperties.length
          ? Math.round(filteredProperties.reduce((s, x) => s + x.price, 0) / filteredProperties.length)
          : null;

        return {
          name: name.includes(",") ? name : `${name}, Pakistan`,
          description: `Overview and highlights for ${name}. Find properties, agents, amenities and pricing trends in this area.`,
          amenities: [
            { icon: School, label: "Top Schools" },
            { icon: Hospital, label: "Healthcare" },
            { icon: ShoppingBag, label: "Shopping" },
            { icon: Train, label: "Transport Links" },
            { icon: Trees, label: "Parks" },
            { icon: Shield, label: "Safe Area" },
          ],
          stats: [
            { label: "Avg. Price", value: avgPrice ? priceFormatter.format(avgPrice) : "N/A" },
            { label: "Properties", value: `${filteredProperties.length}` },
            { label: "Agents", value: `${filteredAgents.length}` },
            { label: "Rating", value: "4.6" },
          ],
        };
      })()
    : undefined;
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">
              Smart <span className="gradient-text">Search</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-powered search to find agents and properties in your desired area
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12">
            <Card variant="glass" className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Area Input */}
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    variant="search"
                    placeholder="Enter area or city..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Property Type */}
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    className="flex h-11 w-full rounded-xl px-10 py-2 text-sm transition-all duration-300 glass-card border-2 border-transparent bg-card/80 backdrop-blur-xl focus:border-primary focus:shadow-glow focus:outline-none appearance-none cursor-pointer"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="">Property Type</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                {/* Budget */}
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    className="flex h-11 w-full rounded-xl px-10 py-2 text-sm transition-all duration-300 glass-card border-2 border-transparent bg-card/80 backdrop-blur-xl focus:border-primary focus:shadow-glow focus:outline-none appearance-none cursor-pointer"
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                  >
                    <option value="">Budget Range</option>
                    <option value="0-100000">Under PKR 100K</option>
                    <option value="100000-300000">PKR 100K - PKR 300K</option>
                    <option value="300000-500000">PKR 300K - PKR 500K</option>
                    <option value="500000-1000000">PKR 500K - PKR 1M</option>
                    <option value="1000000+">PKR 1M+</option>
                  </select>
                </div>

                {/* Search Button */}
                <Button type="submit" variant="hero" className="w-full h-11">
                  <SearchIcon className="w-5 h-5" />
                  Search
                </Button>
              </div>
            </Card>
          </form>

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-8 animate-fade-in">
              {/* Area Intelligence Panel */}
              <AreaIntelligencePanel area={areaForPanel} />

              {/* Results Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 p-1 rounded-xl bg-muted">
                  <button
                    onClick={() => setActiveTab("agents")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === "agents" ? "bg-card shadow-sm" : "hover:bg-card/50"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Agents ({filteredAgents.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("properties")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === "properties" ? "bg-card shadow-sm" : "hover:bg-card/50"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Properties ({filteredProperties.length})
                  </button>
                </div>

                {activeTab === "properties" && (
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
                )}
              </div>

              {/* Agents Results */}
              {activeTab === "agents" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
                  {loadingAgents ? (
                    <div className="col-span-full text-center py-12">
                      <div className="inline-block">
                        <p className="text-muted-foreground">Loading agents...</p>
                      </div>
                    </div>
                  ) : filteredAgents.length > 0 ? (
                    filteredAgents.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        onViewProfile={(id) => console.log("View profile:", id)}
                        onContact={(id) => console.log("Contact:", id)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">No agents found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Properties Results */}
              {activeTab === "properties" && (
                <div className={`${
                  viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                    : "space-y-4"
                } stagger-children`}>
                  {propertiesWithImages.length > 0 ? (
                    propertiesWithImages.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        view={viewMode}
                        onViewDetails={(id) => console.log("View details:", id)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">No properties found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty State - Before Search */}
          {!hasSearched && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <SearchIcon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter an area or city above to discover verified agents and available properties with AI-powered insights.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
