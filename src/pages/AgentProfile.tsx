import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Star, Grid, List, Building2, Filter, Home, Building, LandPlot, Hotel, Search, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyCard, Property } from "@/components/properties/PropertyCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  getSocietyById, 
  HOUSING_SOCIETIES, 
  getPhasesForSociety, 
  getBlocksForPhase,
  type HousingSociety,
  type Phase,
  type Block
} from "@/lib/housingSocieties";

// Property type categories
const PROPERTY_TABS = [
  { id: "all", label: "All", icon: Building2 },
  { id: "residential", label: "Residential", icon: Home, types: ["house", "residential", "home", "villa", "bungalow", "farmhouse"] },
  { id: "apartment", label: "Apartment", icon: Hotel, types: ["apartment", "flat", "penthouse", "studio"] },
  { id: "commercial", label: "Commercial", icon: Building, types: ["commercial", "office", "shop", "plaza", "warehouse", "showroom"] },
  { id: "land", label: "Land", icon: LandPlot, types: ["land", "plot", "agricultural", "industrial land", "residential plot", "commercial plot"] },
];

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
  const location = useLocation();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAllProperties, setShowAllProperties] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Society search states
  const [searchSociety, setSearchSociety] = useState<string>("");
  const [searchPhase, setSearchPhase] = useState<string>("");
  const [searchBlock, setSearchBlock] = useState<string>("");
  const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
  const [showPhaseDropdown, setShowPhaseDropdown] = useState(false);
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [availablePhases, setAvailablePhases] = useState<Phase[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>([]);
  
  // Get society filter params from URL
  const params = new URLSearchParams(location.search);
  const societyId = params.get("society_id");
  const societyPhase = params.get("society_phase");
  const societyBlock = params.get("society_block");
  const hasFilter = societyId || societyPhase || societyBlock;
  const societyData = societyId ? getSocietyById(societyId) : null;

  useEffect(() => {
    if (agentId) {
      fetchAgentDetails();
      fetchAgentProperties();
    }
  }, [agentId, societyId, societyPhase, societyBlock]);

  // Initialize search dropdowns from URL params
  useEffect(() => {
    if (societyId) {
      setSearchSociety(societyId);
      const phases = getPhasesForSociety(societyId);
      setAvailablePhases(phases);
      
      if (societyPhase) {
        setSearchPhase(societyPhase);
        const blocks = getBlocksForPhase(societyId, societyPhase);
        setAvailableBlocks(blocks);
        
        if (societyBlock) {
          setSearchBlock(societyBlock);
        }
      }
    }
  }, [societyId, societyPhase, societyBlock]);

  // Update phases when society changes
  useEffect(() => {
    if (searchSociety) {
      const phases = getPhasesForSociety(searchSociety);
      setAvailablePhases(phases);
    } else {
      setAvailablePhases([]);
    }
    setSearchPhase("");
    setSearchBlock("");
    setAvailableBlocks([]);
  }, [searchSociety]);

  // Update blocks when phase changes
  useEffect(() => {
    if (searchSociety && searchPhase) {
      const blocks = getBlocksForPhase(searchSociety, searchPhase);
      setAvailableBlocks(blocks);
    } else {
      setAvailableBlocks([]);
    }
    setSearchBlock("");
  }, [searchSociety, searchPhase]);

  // Apply society search filter
  const applySocietyFilter = () => {
    const params = new URLSearchParams();
    if (searchSociety) params.set('society_id', searchSociety);
    if (searchPhase) params.set('society_phase', searchPhase);
    if (searchBlock) params.set('society_block', searchBlock);
    
    navigate(`/agent/${agentId}?${params.toString()}`);
  };

  // Clear society filter
  const clearSocietyFilter = () => {
    setSearchSociety("");
    setSearchPhase("");
    setSearchBlock("");
    setAvailablePhases([]);
    setAvailableBlocks([]);
    navigate(`/agent/${agentId}`);
  };

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
      // Build URL with society filter params if present
      let url = `http://localhost:3001/api/agents/${agentId}/properties`;
      const filterParams = new URLSearchParams();
      if (societyId) filterParams.append('society_id', societyId);
      if (societyPhase) filterParams.append('society_phase', societyPhase);
      if (societyBlock) filterParams.append('society_block', societyBlock);
      
      if (filterParams.toString()) {
        url += `?${filterParams.toString()}`;
      }
      
      console.log('=== Fetching Agent Properties ===');
      console.log('URL:', url);
      console.log('Filters:', { societyId, societyPhase, societyBlock });
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Response:', data.success ? `${data.data?.length} properties` : 'failed');
      
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
          societyId: prop.society_id,
          societyPhase: prop.society_phase,
          societyBlock: prop.society_block,
          propertyType: prop.property_type,
        }));
        
        console.log('Transformed properties:', transformedProperties.map(p => ({
          title: p.title,
          societyId: p.societyId,
          societyPhase: p.societyPhase,
          societyBlock: p.societyBlock,
        })));
        
        setProperties(transformedProperties);
        
        // Filter properties by society if filter is applied
        if (hasFilter && !showAllProperties) {
          const filtered = transformedProperties.filter((prop: any) => {
            // If societyId filter is set, property must have matching societyId
            if (societyId) {
              if (!prop.societyId || prop.societyId.toLowerCase() !== societyId.toLowerCase()) {
                return false;
              }
            }
            // If societyPhase filter is set, property must have matching societyPhase
            if (societyPhase) {
              if (!prop.societyPhase || prop.societyPhase.toLowerCase() !== societyPhase.toLowerCase()) {
                return false;
              }
            }
            // If societyBlock filter is set, property must have matching societyBlock
            if (societyBlock) {
              if (!prop.societyBlock || prop.societyBlock.toLowerCase() !== societyBlock.toLowerCase()) {
                return false;
              }
            }
            return true;
          });
          console.log('Filtered properties:', filtered.length, 'out of', transformedProperties.length);
          setFilteredProperties(filtered);
        } else {
          setFilteredProperties(transformedProperties);
        }
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
  // Filter properties by type based on active tab
  const propertiesByTab = useMemo(() => {
    const propsToFilter = hasFilter && !showAllProperties ? filteredProperties : properties;
    
    if (activeTab === "all") {
      return propsToFilter;
    }
    
    const tabConfig = PROPERTY_TABS.find((t) => t.id === activeTab);
    if (!tabConfig || !tabConfig.types) {
      return propsToFilter;
    }
    
    return propsToFilter.filter((prop: any) => {
      const propType = (prop.type || prop.propertyType || prop.property_type || "").toLowerCase();
      return tabConfig.types.some((type) => propType.includes(type));
    });
  }, [activeTab, hasFilter, showAllProperties, filteredProperties, properties]);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Back Button */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

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
          {/* Society Search Panel */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Search by Housing Society</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Society Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSocietyDropdown(!showSocietyDropdown);
                      setShowPhaseDropdown(false);
                      setShowBlockDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-muted/50 flex items-center justify-between transition-colors"
                  >
                    <span className={searchSociety ? "text-foreground" : "text-muted-foreground"}>
                      {searchSociety ? getSocietyById(searchSociety)?.name : "Select Society"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {showSocietyDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {HOUSING_SOCIETIES.map((society) => (
                        <button
                          key={society.id}
                          onClick={() => {
                            setSearchSociety(society.id);
                            setShowSocietyDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors text-sm"
                        >
                          {society.name}
                          <span className="text-xs text-muted-foreground ml-2">({society.city})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phase Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      if (availablePhases.length > 0) {
                        setShowPhaseDropdown(!showPhaseDropdown);
                        setShowSocietyDropdown(false);
                        setShowBlockDropdown(false);
                      }
                    }}
                    disabled={availablePhases.length === 0}
                    className={`w-full px-4 py-2.5 rounded-lg border border-border bg-background flex items-center justify-between transition-colors ${
                      availablePhases.length > 0 ? "hover:bg-muted/50" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <span className={searchPhase ? "text-foreground" : "text-muted-foreground"}>
                      {searchPhase || "Select Phase"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {showPhaseDropdown && availablePhases.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {availablePhases.map((phase) => (
                        <button
                          key={phase.name}
                          onClick={() => {
                            setSearchPhase(phase.name);
                            setShowPhaseDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors text-sm"
                        >
                          {phase.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Block Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      if (availableBlocks.length > 0) {
                        setShowBlockDropdown(!showBlockDropdown);
                        setShowSocietyDropdown(false);
                        setShowPhaseDropdown(false);
                      }
                    }}
                    disabled={availableBlocks.length === 0}
                    className={`w-full px-4 py-2.5 rounded-lg border border-border bg-background flex items-center justify-between transition-colors ${
                      availableBlocks.length > 0 ? "hover:bg-muted/50" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <span className={searchBlock ? "text-foreground" : "text-muted-foreground"}>
                      {searchBlock || "Select Block"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {showBlockDropdown && availableBlocks.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {availableBlocks.map((block) => (
                        <button
                          key={block.name}
                          onClick={() => {
                            setSearchBlock(block.name);
                            setShowBlockDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors text-sm"
                        >
                          {block.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={applySocietyFilter} 
                    disabled={!searchSociety}
                    className="flex-1"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  {(searchSociety || hasFilter) && (
                    <Button variant="outline" onClick={clearSocietyFilter} size="icon">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Society Filter Badge */}
          {hasFilter && (
            <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Showing properties in:</span>
                  {societyData && (
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-600">
                      <Building2 className="w-3 h-3 mr-1" />
                      {societyData.name}
                    </Badge>
                  )}
                  {societyPhase && (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">
                      {societyPhase}
                    </Badge>
                  )}
                  {societyBlock && (
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-600">
                      {societyBlock}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAllProperties(!showAllProperties);
                    if (!showAllProperties) {
                      setFilteredProperties(properties);
                    } else {
                      // Re-apply filter with strict matching
                      const filtered = properties.filter((prop: any) => {
                        if (societyId) {
                          if (!prop.societyId || prop.societyId.toLowerCase() !== societyId.toLowerCase()) {
                            return false;
                          }
                        }
                        if (societyPhase) {
                          if (!prop.societyPhase || prop.societyPhase.toLowerCase() !== societyPhase.toLowerCase()) {
                            return false;
                          }
                        }
                        if (societyBlock) {
                          if (!prop.societyBlock || prop.societyBlock.toLowerCase() !== societyBlock.toLowerCase()) {
                            return false;
                          }
                        }
                        return true;
                      });
                      setFilteredProperties(filtered);
                    }
                  }}
                >
                  {showAllProperties ? "Show Filtered" : "Show All Properties"}
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Properties</h2>
              <p className="text-muted-foreground">
                {propertiesByTab.length} {propertiesByTab.length === 1 ? 'property' : 'properties'} {hasFilter && !showAllProperties ? 'in this area' : 'available'}
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

          {/* Property Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start mb-6 h-auto flex-wrap gap-2 bg-transparent p-0">
              {PROPERTY_TABS.map((tab) => {
                const Icon = tab.icon;
                const count = tab.id === "all" 
                  ? (hasFilter && !showAllProperties ? filteredProperties : properties).length
                  : (hasFilter && !showAllProperties ? filteredProperties : properties).filter((prop: any) => {
                      const propType = (prop.propertyType || prop.property_type || "").toLowerCase();
                      return tab.types?.some((type) => propType.includes(type));
                    }).length;
                
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-full border border-border data-[state=active]:border-primary"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {count}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading properties...</p>
              </div>
            ) : propertiesByTab.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {hasFilter 
                    ? `No ${activeTab === "all" ? "" : activeTab} properties in this area. Click 'Show All Properties' to see all listings.`
                    : `No ${activeTab === "all" ? "" : activeTab} properties available from this agent`}
                </p>
              </div>
            ) : (
              <div
                className={`${
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }`}
              >
                {propertiesByTab.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    view={viewMode}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
