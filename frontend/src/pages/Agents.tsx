import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AgentCard } from "@/components/agents/AgentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Users, Star, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  bio?: string;
}

const areas = ["All Areas", "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Gujranwala"];
const experienceLevels = ["Any Experience", "1-3 years", "3-5 years", "5-10 years", "10+ years"];

const Agents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedExperience, setSelectedExperience] = useState("Any Experience");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  // Fetch agents from database
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/agents");
      const data = await response.json();
      if (data.success && data.data) {
        setAgents(data.data);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter agents from real database
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = !searchQuery || 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.email && agent.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesArea = selectedArea === "All Areas" || agent.city === selectedArea;
    return matchesSearch && matchesArea;
  });

  const handleViewProfile = (id: string) => {
    navigate(`/agent/${id}`);
  };

  const handleContact = (id: string) => {
    navigate(`/agent/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">
              Find <span className="gradient-text">Verified Agents</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Connect with trusted real estate professionals in your area
            </p>
          </div>

          {/* Search & Filters */}
          <Card variant="glass" className="mb-8">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    variant="search"
                    placeholder="Search by name or agency..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Area Filter */}
                <div className="relative lg:w-48">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    className="flex h-11 w-full rounded-xl px-10 py-2 text-sm transition-all duration-300 glass-card border-2 border-transparent bg-card/80 backdrop-blur-xl focus:border-primary focus:shadow-glow focus:outline-none appearance-none cursor-pointer"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                  >
                    {areas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                {/* Experience Filter */}
                <div className="relative lg:w-48">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    className="flex h-11 w-full rounded-xl px-10 py-2 text-sm transition-all duration-300 glass-card border-2 border-transparent bg-card/80 backdrop-blur-xl focus:border-primary focus:shadow-glow focus:outline-none appearance-none cursor-pointer"
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                  >
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Verified Toggle */}
                <Button
                  variant={showVerifiedOnly ? "verified" : "outline"}
                  onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                  className="lg:w-auto"
                >
                  <Filter className="w-4 h-4" />
                  Verified Only
                </Button>
              </div>

              {/* Active Filters */}
              {(selectedArea !== "All Areas" || selectedExperience !== "Any Experience" || showVerifiedOnly || searchQuery) && (
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
                  {selectedArea !== "All Areas" && (
                    <button
                      onClick={() => setSelectedArea("All Areas")}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                    >
                      {selectedArea}
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {showVerifiedOnly && (
                    <button
                      onClick={() => setShowVerifiedOnly(false)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-verified/10 text-verified text-sm hover:bg-verified/20 transition-colors"
                    >
                      Verified Only
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredAgents.length}</span> agents
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">Loading agents...</p>
            </div>
          ) : filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={{
                    id: agent.id,
                    name: agent.name,
                    agency: "Real Estate Agent",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + agent.name,
                    experience: 5,
                    properties: 0,
                    rating: 4.8,
                    reviews: 12,
                    verified: true,
                    area: agent.city,
                  }}
                  onViewProfile={handleViewProfile}
                  onContact={handleContact}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No agents found</h3>
              <p className="text-muted-foreground">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Agents;
