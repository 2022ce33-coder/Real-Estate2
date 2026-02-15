import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AreaIntelligencePanel } from "@/components/search/AreaIntelligencePanel";
import { AgentCard } from "@/components/agents/AgentCard";
import { PropertyCard, sampleProperties } from "@/components/properties/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, MapPin, Home, DollarSign, Grid, List, Users, Building2, School, Hospital, ShoppingBag, Train, Trees, Shield, Layers, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchAgentsByArea, fetchAllAgents, fetchAgentsBySociety } from "@/lib/agentService";
import type { AgentData } from "@/lib/agentService";
import { 
  HOUSING_SOCIETIES, 
  getSocietiesByCity, 
  getPhasesForSociety, 
  getBlocksForPhase,
  getSocietyById,
  type HousingSociety,
  type Phase,
  type Block
} from "@/lib/housingSocieties";

const SearchPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<"agents" | "properties">("agents");
  const [filteredAgents, setFilteredAgents] = useState<AgentData[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  
  // Housing Society Search State
  const [searchMode, setSearchMode] = useState<"text" | "society">("text");
  const [selectedSociety, setSelectedSociety] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [phases, setPhases] = useState<Phase[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === "society" && selectedSociety) {
      setHasSearched(true);
      loadAgentsBySociety();
    } else {
      setHasSearched(Boolean(searchQuery.trim()));
    }
  };
  
  // Load agents by society
  const loadAgentsBySociety = async (
    society?: string, 
    phase?: string, 
    block?: string
  ) => {
    const societyToSearch = society ?? selectedSociety;
    const phaseToSearch = phase ?? selectedPhase;
    const blockToSearch = block ?? selectedBlock;
    
    if (!societyToSearch) return;
    
    setLoadingAgents(true);
    try {
      const agents = await fetchAgentsBySociety(societyToSearch, phaseToSearch, blockToSearch);
      setFilteredAgents(agents);
    } catch (error) {
      console.error("Error loading agents by society:", error);
      setFilteredAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };
  
  // Update phases when society changes and auto-search
  useEffect(() => {
    if (selectedSociety) {
      const societyPhases = getPhasesForSociety(selectedSociety);
      setPhases(societyPhases);
      setSelectedPhase("");
      setSelectedBlock("");
      setBlocks([]);
      // Auto-search when society is selected
      setHasSearched(true);
      loadAgentsBySociety(selectedSociety, "", "");
    } else {
      setPhases([]);
      setSelectedPhase("");
      setSelectedBlock("");
      setBlocks([]);
      setHasSearched(false);
      setFilteredAgents([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSociety]);
  
  // Update blocks when phase changes and auto-search
  useEffect(() => {
    if (selectedSociety && selectedPhase) {
      const phaseBlocks = getBlocksForPhase(selectedSociety, selectedPhase);
      setBlocks(phaseBlocks);
      setSelectedBlock("");
      // Auto-search when phase is selected
      loadAgentsBySociety(selectedSociety, selectedPhase, "");
    } else if (selectedSociety) {
      setBlocks([]);
      setSelectedBlock("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSociety, selectedPhase]);
  
  // Auto-search when block changes
  useEffect(() => {
    if (selectedSociety && selectedPhase && selectedBlock) {
      loadAgentsBySociety(selectedSociety, selectedPhase, selectedBlock);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlock]);

  const location = useLocation();

  // initialize filters from query params when the page loads / location changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const area = params.get("area") ?? "";
    const type = params.get("type") ?? "";
    const budget = params.get("budget") ?? "";
    const society = params.get("society") ?? "";
    const phase = params.get("phase") ?? "";
    const block = params.get("block") ?? "";
    
    setSearchQuery(area);
    setSelectedType(type);
    setSelectedBudget(budget);
    
    // Check if it's a society search
    if (society) {
      setSearchMode("society");
      setSelectedSociety(society);
      if (phase) setSelectedPhase(phase);
      if (block) setSelectedBlock(block);
      setHasSearched(true);
    } else {
      setHasSearched(Boolean(area || type || budget));
    }
    
    // Fetch agents from database
    const loadAgents = async () => {
      setLoadingAgents(true);
      try {
        let agents: AgentData[];
        if (society) {
          agents = await fetchAgentsBySociety(society, phase, block);
        } else if (area.trim()) {
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

  // Build a simple dynamic area object when searching for a specific city or society
  const areaForPanel = (() => {
    // Society search mode
    if (searchMode === "society" && selectedSociety) {
      const society = getSocietyById(selectedSociety);
      if (!society) return undefined;
      
      let name = society.name;
      if (selectedPhase) name += ` - ${selectedPhase}`;
      if (selectedBlock) name += ` - ${selectedBlock}`;
      
      return {
        name: `${name}, ${society.city}`,
        description: `Explore properties and agents in ${name}. This prestigious housing society offers modern living with excellent amenities.`,
        amenities: [
          { icon: School, label: "Top Schools" },
          { icon: Hospital, label: "Healthcare" },
          { icon: ShoppingBag, label: "Shopping" },
          { icon: Train, label: "Transport Links" },
          { icon: Trees, label: "Parks" },
          { icon: Shield, label: "Gated Community" },
        ],
        stats: [
          { label: "Phases", value: `${phases.length || society.phases.length}` },
          { label: "Properties", value: `${filteredProperties.length}` },
          { label: "Agents", value: `${filteredAgents.length}` },
          { label: "Rating", value: "4.8" },
        ],
      };
    }
    
    // Text search mode
    if (searchQuery.trim()) {
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
    }
    
    return undefined;
  })();
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
          
          {/* Search Mode Toggle */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted">
              <button
                type="button"
                onClick={() => setSearchMode("text")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  searchMode === "text" ? "bg-card shadow-sm" : "hover:bg-card/50"
                }`}
              >
                <SearchIcon className="w-4 h-4" />
                Text Search
              </button>
              <button
                type="button"
                onClick={() => setSearchMode("society")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  searchMode === "society" ? "bg-card shadow-sm" : "hover:bg-card/50"
                }`}
              >
                <Building2 className="w-4 h-4" />
                Search by Society
              </button>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-12">
            <Card variant="glass" className="p-4">
              {searchMode === "text" ? (
                /* Text Search Mode */
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
              ) : (
                /* Society Search Mode */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Society Selection */}
                    <div className="relative lg:col-span-2">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <Select value={selectedSociety} onValueChange={setSelectedSociety}>
                        <SelectTrigger className="pl-10 h-11 rounded-xl glass-card border-2 border-transparent bg-card/80 backdrop-blur-xl focus:border-primary">
                          <SelectValue placeholder="Select Housing Society" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {HOUSING_SOCIETIES.map((society) => (
                            <SelectItem key={society.id} value={society.id}>
                              <div className="flex items-center gap-2">
                                <span>{society.name}</span>
                                <span className="text-xs text-muted-foreground">({society.city})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Phase Selection */}
                    <div className="relative">
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <Select 
                        value={selectedPhase || "_all"} 
                        onValueChange={(val) => setSelectedPhase(val === "_all" ? "" : val)}
                        disabled={!selectedSociety || phases.length === 0}
                      >
                        <SelectTrigger className="pl-10 h-11 rounded-xl glass-card border-2 border-transparent bg-card/80 backdrop-blur-xl focus:border-primary">
                          <SelectValue placeholder="Select Phase/Sector" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="_all">All Phases</SelectItem>
                          {phases.map((phase) => (
                            <SelectItem key={phase.name} value={phase.name}>
                              {phase.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Block Selection */}
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <Select 
                        value={selectedBlock || "_all"} 
                        onValueChange={(val) => setSelectedBlock(val === "_all" ? "" : val)}
                        disabled={!selectedPhase || blocks.length === 0}
                      >
                        <SelectTrigger className="pl-10 h-11 rounded-xl glass-card border-2 border-transparent bg-card/80 backdrop-blur-xl focus:border-primary">
                          <SelectValue placeholder="Select Block" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="_all">All Blocks</SelectItem>
                          {blocks.map((block) => (
                            <SelectItem key={block.name} value={block.name}>
                              {block.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Selected Location Display */}
                  {selectedSociety && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Searching in:</span>
                      <div className="flex items-center gap-1 font-medium">
                        <span>{getSocietyById(selectedSociety)?.name}</span>
                        {selectedPhase && (
                          <>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedPhase}</span>
                          </>
                        )}
                        {selectedBlock && (
                          <>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedBlock}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Search Button */}
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      variant="hero" 
                      className="flex-1 h-11"
                      disabled={!selectedSociety}
                    >
                      <SearchIcon className="w-5 h-5 mr-2" />
                      Find Agents in {selectedSociety ? getSocietyById(selectedSociety)?.name : "Society"}
                    </Button>
                  </div>
                </div>
              )}
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
                      {searchMode === "society" ? (
                        <div>
                          <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p className="text-muted-foreground">
                            No agents found in {getSocietyById(selectedSociety)?.name}
                            {selectedPhase && ` - ${selectedPhase}`}
                            {selectedBlock && ` - ${selectedBlock}`}
                          </p>
                          <p className="text-sm text-muted-foreground/70 mt-2">
                            Try selecting a different phase or block, or check back later
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No agents found for "{searchQuery}"</p>
                      )}
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
