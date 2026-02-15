import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Sparkles, Loader2, X, AlertCircle, Map, DollarSign, Home, Building2, Layers, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Bytez from "bytez.js";
import { AgentCard } from "@/components/agents/AgentCard";
import { fetchAgentsByArea, fetchAgentsBySociety } from "@/lib/agentService";
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

interface AreaSearchResult {
  name: string;
  description: string;
  amenities: string[];
  highlights: string[];
}

interface HomeSearchPanelProps {
  onAreaFound?: (area: AreaSearchResult) => void;
}

const amenityIcons: Record<string, string> = {
  "Schools": "🏫",
  "Healthcare": "🏥",
  "Shopping": "🛍️",
  "Transport": "🚇",
  "Parks": "🌳",
  "Safety": "🔒",
  "Business": "💼",
  "Markets": "🏪",
  "Entertainment": "🎭",
  "Restaurants": "🍽️",
};

const pakistaniAreas = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Gujranwala",
  "DHA Karachi", "DHA Lahore", "DHA Islamabad", "Bahria Town", "Gulberg", "Cantt", "Defence", "Clifton",
  "Defence Housing Authority", "DHA Phase 1", "DHA Phase 2", "DHA Phase 3", "DHA Phase 4", "DHA Phase 5",
  "North Nazimabad", "Gulshan-e-Iqbal", "Mohammadi", "Lyari", "Saddar", "F-7", "F-8", "G-6", "G-7"
];

const citiesAndAreas: Record<string, string[]> = {
  "Karachi": ["DHA Karachi", "Defence", "Clifton", "Saddar", "North Nazimabad", "Gulshan-e-Iqbal", "Mohammadi", "Lyari"],
  "Lahore": ["DHA Lahore", "Bahria Town", "Gulberg", "Cantt", "Defence", "F-7", "F-8", "Mall Road", "Johar Town"],
  "Islamabad": ["DHA Islamabad", "F-7", "F-8", "G-6", "G-7", "Sector F", "Sector G", "Blue Area", "Red Area"],
  "Rawalpindi": ["Bahria Town", "Defence", "Cantt", "Adiala Road", "Sadiqabad", "Raja Bazaar"],
  "Faisalabad": ["DHA Faisalabad", "Sargodha Road", "Jinnah Colony", "Ghulam Muhammad Abad"],
  "Multan": ["DHA Multan", "Cantt", "South Bypass", "Nawan Shehr"],
  "Peshawar": ["Peshawar Cantt", "Defence", "Sadar Bazar", "Hayatabad"],
  "Quetta": ["Quetta Cantt", "Zarghoon Road", "Satellite Town"],
  "Gujranwala": ["DHA Gujranwala", "Cantt", "Cheema Town", "Jinnah Park"]
};

const priceRanges = [
  { label: "Under PKR 10 Lac", value: "0-1000000" },
  { label: "PKR 10L - 25L", value: "1000000-2500000" },
  { label: "PKR 25L - 50L", value: "2500000-5000000" },
  { label: "PKR 50L - 1Cr", value: "5000000-10000000" },
  { label: "PKR 1Cr - 2.5Cr", value: "10000000-25000000" },
  { label: "PKR 2.5Cr+", value: "25000000-999999999" },
  { label: "All Prices", value: "all" }
];

const BYTEZ_API_KEY = "9b9fcd249b61ec762cb4314b43269e54";
const sdk = new Bytez(BYTEZ_API_KEY);
const geminiModel = sdk.model("google/gemini-2.5-pro");

export function HomeSearchPanel({ onAreaFound }: HomeSearchPanelProps) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AreaSearchResult | null>(null);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<string | null>(null);
  const [amenityDetails, setAmenityDetails] = useState<string>("");
  const [loadingAmenityDetails, setLoadingAmenityDetails] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [filteredAgents, setFilteredAgents] = useState<AgentData[]>([]);
  const [agentsToShow, setAgentsToShow] = useState(4);
  
  // Filter states
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<string>("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  
  // Society filter states
  const [selectedSociety, setSelectedSociety] = useState<string>("");
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const [showSocietyDropdown, setShowSocietyDropdown] = useState(false);
  const [showPhaseDropdown, setShowPhaseDropdown] = useState(false);
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [availableSocieties, setAvailableSocieties] = useState<HousingSociety[]>(HOUSING_SOCIETIES);
  const [availablePhases, setAvailablePhases] = useState<Phase[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>([]);

  const cities = Object.keys(citiesAndAreas);
  const availableAreas = selectedCity ? citiesAndAreas[selectedCity] : [];
  
  // Update societies when city changes
  useEffect(() => {
    if (selectedCity) {
      const societies = getSocietiesByCity(selectedCity);
      setAvailableSocieties(societies.length > 0 ? societies : HOUSING_SOCIETIES);
    } else {
      setAvailableSocieties(HOUSING_SOCIETIES);
    }
    // Reset society selection when city changes
    setSelectedSociety("");
    setSelectedPhase("");
    setSelectedBlock("");
    setAvailablePhases([]);
    setAvailableBlocks([]);
  }, [selectedCity]);
  
  // Auto-search function for society-based search
  const searchBySociety = async (society: string, phase: string, block: string) => {
    if (!society) return;
    
    setLoading(true);
    setError("");
    try {
      const societyData = getSocietyById(society);
      const agents = await fetchAgentsBySociety(society, phase, block);
      setFilteredAgents(agents);
      
      // Build location name for display
      let locationName = societyData?.name || society;
      if (phase) locationName += ` - ${phase}`;
      if (block) locationName += ` - ${block}`;
      
      setResult({
        name: locationName,
        description: `Showing agents with properties in ${locationName}. ${societyData?.city ? `Located in ${societyData.city}.` : ''}`,
        amenities: ["Gated Community", "24/7 Security", "Parks", "Schools", "Commercial Areas", "Healthcare"],
        highlights: [
          "Premium housing society",
          "Verified agents available",
          `${agents.length} agent${agents.length !== 1 ? 's' : ''} found`
        ],
      });
    } catch (err) {
      setError("Failed to search by society. Please try again.");
      setFilteredAgents([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Update phases when society changes and auto-search
  useEffect(() => {
    if (selectedSociety) {
      const phases = getPhasesForSociety(selectedSociety);
      setAvailablePhases(phases);
      setSelectedPhase("");
      setSelectedBlock("");
      setAvailableBlocks([]);
      // Auto-search when society is selected
      searchBySociety(selectedSociety, "", "");
    } else {
      setAvailablePhases([]);
      setSelectedPhase("");
      setSelectedBlock("");
      setAvailableBlocks([]);
      // Clear results when society is deselected
      if (!searchInput && !selectedCity && !selectedArea) {
        setResult(null);
        setFilteredAgents([]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSociety]);
  
  // Update blocks when phase changes and auto-search
  useEffect(() => {
    if (selectedSociety && selectedPhase) {
      const blocks = getBlocksForPhase(selectedSociety, selectedPhase);
      setAvailableBlocks(blocks);
      setSelectedBlock("");
      // Auto-search when phase is selected
      searchBySociety(selectedSociety, selectedPhase, "");
    } else if (selectedSociety) {
      setAvailableBlocks([]);
      setSelectedBlock("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSociety, selectedPhase]);
  
  // Auto-search when block changes
  useEffect(() => {
    if (selectedSociety && selectedPhase && selectedBlock) {
      searchBySociety(selectedSociety, selectedPhase, selectedBlock);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlock]);

  // Get filtered price label
  const getPriceLabel = () => {
    if (!selectedPrice) return "Select Price Range";
    return priceRanges.find(p => p.value === selectedPrice)?.label || "Select Price Range";
  };

  const handleSearch = async (area: string) => {
    if (!area.trim()) {
      setError("Please enter an area name");
      return;
    }

    setLoading(true);
    setError("");
    setShowSuggestions(false);

    try {
      let areaResult: AreaSearchResult | null = null;
      let aiAvailable = true;

      try {
        const prompt = `You are a real estate expert for Pakistan. Provide a detailed overview of ${area} in Pakistan.

Write 3-4 lines (about 50-80 words) describing this area including:
- Location significance and connectivity
- Type of neighborhood (residential, commercial, or mixed)
- Notable landmarks or features
- Real estate market appeal and lifestyle

Then list 6 popular amenities nearby (no exact coordinates).
      
Format your response exactly as:
Description: [Write 3-4 detailed lines about the area here]
Amenities: School, Hospital, Market, Park, Mosque, Gym`;

        const { error, output } = await geminiModel.run([
          { role: "user", content: prompt }
        ]);

        if (error) {
          throw new Error(typeof error === 'string' ? error : "AI request failed");
        }

        const response = output?.content || output?.message?.content || "";

        // Parse the response
        const descriptionMatch = response.match(/Description:\s*(.+?)(?=Amenities:|$)/s);
        const amenitiesMatch = response.match(/Amenities:\s*(.+?)$/s);

        const description = descriptionMatch ? descriptionMatch[1].trim() : response;
        const amenitiesText = amenitiesMatch ? amenitiesMatch[1].trim() : "School, Hospital, Market, Park, Mosque, Gym";
        const amenitiesArray = amenitiesText.split(",").map((a: string) => a.trim()).filter((a: string) => a);

        areaResult = {
          name: area,
          description: description,
          amenities: amenitiesArray.slice(0, 6),
          highlights: [
            "AI-powered insights from Gemini",
            "Real-time area analysis",
            "Click amenities for more details"
          ],
        };
      } catch (geminiErr) {
        // If Gemini API fails, still fetch agents but without area intelligence
        aiAvailable = false;
        areaResult = {
          name: area,
          description: "Showing agents from database",
          amenities: [],
          highlights: [
            "Live agent listings available",
            "Database connection active",
            "Searching verified agents..."
          ],
        };
        
        // Check if it's a quota error
        const geminiErrorMsg = geminiErr instanceof Error ? geminiErr.message : "";
        if (geminiErrorMsg.includes("429") || geminiErrorMsg.includes("quota") || geminiErrorMsg.includes("Quota exceeded")) {
          setError("⏳ AI insights temporarily unavailable (quota exceeded), but showing agents from database.");
        }
      }

      if (areaResult) {
        setResult(areaResult);
        onAreaFound?.(areaResult);
      }
      
      // Always fetch agents from database, regardless of AI availability
      const agents = await fetchAgentsByArea(area);
      setFilteredAgents(agents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch information";
      
      // Check if it's a quota exceeded error
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("Quota exceeded")) {
        setError("🔄 System Under Consideration - API quota exceeded. Please try again in a few moments, or search for major cities like Karachi, Lahore, Islamabad, or DHA.");
      } else {
        setError(`Error: ${errorMessage}. Please try again.`);
      }
      
      setResult(null);
      setFilteredAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (area: string) => {
    setSearchInput(area);
    setShowSuggestions(false);
    handleSearch(area);
  };

  const getAmenityDetail = async (area: string, amenity: string) => {
    // Toggle if clicking the same amenity
    if (selectedAmenity === amenity) {
      setSelectedAmenity(null);
      setAmenityDetails("");
      return;
    }

    setSelectedAmenity(amenity);
    setLoadingAmenityDetails(true);
    setAmenityDetails("");

    try {
      const prompt = `For ${area} in Pakistan, provide 2-3 brief examples of ${amenity} (no specific addresses).

Format your response EXACTLY as a simple list with maximum 10 lines total:
Example 1: [Name] - [Brief 1 line description]
Example 2: [Name] - [Brief 1 line description]
Example 3: [Name] - [Brief 1 line description]

Keep each example to one line only. No markdown, no asterisks, no special formatting. If specific examples don't exist, provide general information about ${amenity} in the region in the same format.`;

      const { error, output } = await geminiModel.run([
        { role: "user", content: prompt }
      ]);

      if (error) {
        throw new Error(typeof error === 'string' ? error : "Failed to fetch details");
      }

      let response = output?.content || output?.message?.content || "";

      // Clean up markdown formatting
      response = response
        .replace(/\*\*|__/g, '') // Remove bold markers
        .replace(/\*|_/g, '') // Remove italic markers
        .replace(/#+\s/g, '') // Remove headers
        .replace(/`/g, '') // Remove code markers
        .trim();

      // Limit to 10 lines
      const lines = response.split('\n').filter((line: string) => line.trim());
      const limitedResponse = lines.slice(0, 10).join('\n');

      setAmenityDetails(limitedResponse);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unable to fetch details";
      setAmenityDetails(`Information temporarily unavailable. Please try again.`);
    } finally {
      setLoadingAmenityDetails(false);
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setResult(null);
    setError("");
    setShowSuggestions(false);
    setFilteredAgents([]);
    setAgentsToShow(4);
    setSelectedCity("");
    setSelectedArea("");
    setSelectedPrice("");
    setSelectedSociety("");
    setSelectedPhase("");
    setSelectedBlock("");
    setAvailablePhases([]);
    setAvailableBlocks([]);
  };

  const handleFilterSearch = async () => {
    // If society is selected, search by society
    if (selectedSociety) {
      setLoading(true);
      setError("");
      try {
        const society = getSocietyById(selectedSociety);
        const agents = await fetchAgentsBySociety(selectedSociety, selectedPhase, selectedBlock);
        setFilteredAgents(agents);
        
        // Build location name for display
        let locationName = society?.name || selectedSociety;
        if (selectedPhase) locationName += ` - ${selectedPhase}`;
        if (selectedBlock) locationName += ` - ${selectedBlock}`;
        
        setResult({
          name: locationName,
          description: `Showing agents with properties in ${locationName}. ${society?.city ? `Located in ${society.city}.` : ''}`,
          amenities: ["Gated Community", "24/7 Security", "Parks", "Schools", "Commercial Areas", "Healthcare"],
          highlights: [
            "Premium housing society",
            "Verified agents available",
            `${agents.length} agent${agents.length !== 1 ? 's' : ''} found`
          ],
        });
      } catch (err) {
        setError("Failed to search by society. Please try again.");
        setFilteredAgents([]);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Otherwise use area search
    const searchArea = selectedArea || selectedCity || searchInput;
    if (searchArea.trim()) {
      handleSearch(searchArea);
    } else {
      setError("Please select a city/area/society or enter a search term");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Filter Section */}
      <div className="space-y-3">
        
        {/* Housing Society Filters */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-semibold text-foreground">Search by Housing Society</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Society Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSocietyDropdown(!showSocietyDropdown);
                  setShowCityDropdown(false);
                  setShowAreaDropdown(false);
                  setShowPriceDropdown(false);
                  setShowPhaseDropdown(false);
                  setShowBlockDropdown(false);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-card border-2 border-border hover:border-orange-500/50 transition-all text-left flex items-center justify-between gap-2 text-sm font-medium text-foreground glass-card"
              >
                <span className="flex items-center gap-2 flex-1 truncate">
                  <Building2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="truncate">
                    {selectedSociety ? getSocietyById(selectedSociety)?.name : "Select Society"}
                  </span>
                </span>
                <span className={`text-orange-500 transition-transform ${showSocietyDropdown ? "rotate-180" : ""}`}>▼</span>
              </button>
              
              {showSocietyDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border-2 border-orange-500/30 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto">
                  {availableSocieties.map((society) => (
                    <button
                      key={society.id}
                      onClick={() => {
                        setSelectedSociety(society.id);
                        setShowSocietyDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 transition-all border-b border-border/30 last:border-0 text-sm flex items-center gap-2 ${
                        selectedSociety === society.id 
                          ? "bg-orange-500/20 text-orange-600 font-medium" 
                          : "hover:bg-orange-500/10 text-foreground"
                      }`}
                    >
                      <Building2 className="w-4 h-4 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span>{society.name}</span>
                        <span className="text-xs text-muted-foreground">{society.city}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phase/Sector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  if (selectedSociety && availablePhases.length > 0) {
                    setShowPhaseDropdown(!showPhaseDropdown);
                    setShowCityDropdown(false);
                    setShowAreaDropdown(false);
                    setShowPriceDropdown(false);
                    setShowSocietyDropdown(false);
                    setShowBlockDropdown(false);
                  }
                }}
                disabled={!selectedSociety || availablePhases.length === 0}
                className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all text-left flex items-center justify-between gap-2 text-sm font-medium glass-card ${
                  selectedSociety && availablePhases.length > 0
                    ? "bg-card border-border hover:border-blue-500/50 text-foreground cursor-pointer"
                    : "bg-muted/30 border-border/50 text-muted-foreground cursor-not-allowed opacity-50"
                }`}
              >
                <span className="flex items-center gap-2 flex-1 truncate">
                  <Layers className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">
                    {!selectedSociety ? "Select Society First" : selectedPhase || "Select Phase/Sector"}
                  </span>
                </span>
                <span className={`text-blue-500 transition-transform ${showPhaseDropdown ? "rotate-180" : ""}`}>▼</span>
              </button>
              
              {showPhaseDropdown && selectedSociety && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border-2 border-blue-500/30 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto">
                  {availablePhases.map((phase) => (
                    <button
                      key={phase.name}
                      onClick={() => {
                        setSelectedPhase(phase.name);
                        setShowPhaseDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 transition-all border-b border-border/30 last:border-0 text-sm flex items-center gap-2 ${
                        selectedPhase === phase.name 
                          ? "bg-blue-500/20 text-blue-600 font-medium" 
                          : "hover:bg-blue-500/10 text-foreground"
                      }`}
                    >
                      <Layers className="w-4 h-4 flex-shrink-0" />
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
                  if (selectedPhase && availableBlocks.length > 0) {
                    setShowBlockDropdown(!showBlockDropdown);
                    setShowCityDropdown(false);
                    setShowAreaDropdown(false);
                    setShowPriceDropdown(false);
                    setShowSocietyDropdown(false);
                    setShowPhaseDropdown(false);
                  }
                }}
                disabled={!selectedPhase || availableBlocks.length === 0}
                className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all text-left flex items-center justify-between gap-2 text-sm font-medium glass-card ${
                  selectedPhase && availableBlocks.length > 0
                    ? "bg-card border-border hover:border-purple-500/50 text-foreground cursor-pointer"
                    : "bg-muted/30 border-border/50 text-muted-foreground cursor-not-allowed opacity-50"
                }`}
              >
                <span className="flex items-center gap-2 flex-1 truncate">
                  <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="truncate">
                    {!selectedPhase ? "Select Phase First" : selectedBlock || "Select Block"}
                  </span>
                </span>
                <span className={`text-purple-500 transition-transform ${showBlockDropdown ? "rotate-180" : ""}`}>▼</span>
              </button>
              
              {showBlockDropdown && selectedPhase && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border-2 border-purple-500/30 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto">
                  {availableBlocks.map((block) => (
                    <button
                      key={block.name}
                      onClick={() => {
                        setSelectedBlock(block.name);
                        setShowBlockDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 transition-all border-b border-border/30 last:border-0 text-sm flex items-center gap-2 ${
                        selectedBlock === block.name 
                          ? "bg-purple-500/20 text-purple-600 font-medium" 
                          : "hover:bg-purple-500/10 text-foreground"
                      }`}
                    >
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      {block.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Selected Society Path Display */}
          {selectedSociety && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Searching in:</span>
              <div className="flex items-center gap-1 font-medium text-orange-600">
                <span>{getSocietyById(selectedSociety)?.name}</span>
                {selectedPhase && (
                  <>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-blue-600">{selectedPhase}</span>
                  </>
                )}
                {selectedBlock && (
                  <>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-purple-600">{selectedBlock}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Applied Filters Badge */}
        {(selectedCity || selectedArea || selectedPrice || selectedSociety) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedCity && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                🏙️ {selectedCity}
                <button
                  onClick={() => setSelectedCity("")}
                  className="ml-1 hover:opacity-70"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedArea && (
              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                📍 {selectedArea}
                <button
                  onClick={() => setSelectedArea("")}
                  className="ml-1 hover:opacity-70"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedPrice && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-500/30">
                💰 {getPriceLabel()}
                <button
                  onClick={() => setSelectedPrice("")}
                  className="ml-1 hover:opacity-70"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedSociety && (
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-600 border-orange-500/30">
                🏘️ {getSocietyById(selectedSociety)?.name}
                <button
                  onClick={() => {
                    setSelectedSociety("");
                    setSelectedPhase("");
                    setSelectedBlock("");
                  }}
                  className="ml-1 hover:opacity-70"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedPhase && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                📍 {selectedPhase}
                <button
                  onClick={() => {
                    setSelectedPhase("");
                    setSelectedBlock("");
                  }}
                  className="ml-1 hover:opacity-70"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedBlock && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-600 border-purple-500/30">
                🏠 {selectedBlock}
                <button
                  onClick={() => setSelectedBlock("")}
                  className="ml-1 hover:opacity-70"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Manual Search Input */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Or search manually:</p>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <Input
                placeholder="Search any area in Pakistan (e.g., DHA Lahore, Karachi, Bahria Town)"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(searchInput);
                  }
                }}
                className="pl-10 text-base"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <Button
              onClick={() => handleSearch(searchInput)}
              disabled={loading || !searchInput.trim()}
              className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && searchInput && !result && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
              {pakistaniAreas.filter((area) =>
                area.toLowerCase().includes(searchInput.toLowerCase())
              ).slice(0, 8).map((area) => (
                <button
                  key={area}
                  onClick={() => handleSuggestionClick(area)}
                  className="w-full text-left px-4 py-2.5 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-0 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">{area}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">{error}</p>
            <p className="text-xs text-destructive/80 mt-1">Try searching for major Pakistani cities or areas like Karachi, Lahore, Islamabad, or DHA.</p>
          </div>
        </div>
      )}

      {/* Results Card */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Area Header */}
          <Card className="glass-card border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl">
                    📍
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{result.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">AI-Powered Area Intelligence</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Analysis
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Description */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">📍</span>
                Area Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{result.description}</p>
            </CardContent>
          </Card>

          {/* Amenities */}
          {result.amenities && result.amenities.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Key Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {/* Map Card Button */}
                  <button
                    onClick={() => {
                      setSelectedAmenity(null);
                      setShowMap(!showMap);
                    }}
                    className={`p-3 rounded-lg transition-all cursor-pointer group ${
                      showMap
                        ? "bg-blue-500/20 border-blue-500/50 border-2"
                        : "bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40"
                    }`}
                  >
                    <p className="text-2xl mb-1">🗺️</p>
                    <p className="text-xs font-medium text-foreground">Map</p>
                    <p className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1">View Map</p>
                  </button>

                  {/* Amenity Buttons */}
                  {result.amenities.map((amenity, idx) => {
                    const icon = amenityIcons[amenity] || "✓";
                    const isSelected = selectedAmenity === amenity;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setShowMap(false);
                          getAmenityDetail(result.name, amenity);
                        }}
                        className={`p-3 rounded-lg transition-all cursor-pointer group ${
                          isSelected
                            ? "bg-primary/20 border-primary/50 border-2"
                            : "bg-accent/10 border border-accent/20 hover:bg-accent/20 hover:border-accent/40"
                        }`}
                      >
                        <p className="text-2xl mb-1">{icon}</p>
                        <p className="text-xs font-medium text-foreground">{amenity}</p>
                        <p className="text-xs text-primary/60 opacity-0 group-hover:opacity-100 transition-opacity mt-1">Click for details</p>
                      </button>
                    );
                  })}
                </div>

                {/* Map Display Card */}
                {showMap && (
                  <div className="mt-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                          <Map className="w-4 h-4 text-blue-600" />
                          {result.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">Interactive Map</p>
                      </div>
                      <button
                        onClick={() => setShowMap(false)}
                        className="text-muted-foreground hover:text-foreground flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-blue-500/30 bg-background shadow-sm">
                      <iframe
                        width="100%"
                        height={350}
                        frameBorder={0}
                        style={{ border: 0 }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent('73.5,30.5,75.5,32.5')}&layer=mapnik&marker=${encodeURIComponent('31.5,74.0')}`}
                        allowFullScreen={true}
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">OpenStreetMap - Free Map Data</p>
                  </div>
                )}

                {/* Amenity Details Dropdown */}
                {selectedAmenity && (
                  <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">
                          {selectedAmenity}
                        </h4>
                        <p className="text-xs text-muted-foreground">in {result.name}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAmenity(null);
                          setAmenityDetails("");
                        }}
                        className="text-muted-foreground hover:text-foreground flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {loadingAmenityDetails ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Loading nearby options...</span>
                      </div>
                    ) : amenityDetails ? (
                      <div className="space-y-1.5">
                        {amenityDetails.split('\n').map((line, idx) => (
                          line.trim() && (
                            <div key={idx} className="text-xs text-muted-foreground leading-relaxed p-2 bg-background/50 rounded border border-border/30">
                              {line.trim()}
                            </div>
                          )
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No details available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Highlights */}
          {result.highlights && result.highlights.length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Key Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className="text-primary font-bold flex-shrink-0">✓</span>
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-3">
              Now browse verified agents in <span className="font-semibold text-foreground">{result.name}</span> below
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="default"
                className="flex-1 bg-gradient-to-r from-primary to-accent"
                onClick={clearSearch}
              >
                Search Another Area
              </Button>
            </div>
          </div>

          {/* Verified Agents Section */}
          {filteredAgents.length > 0 && (
            <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Verified Agents in {result.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} available
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredAgents.slice(0, agentsToShow).map((agent) => (
                    <AgentCard 
                      key={agent.id} 
                      agent={agent}
                      onViewProfile={(id) => {
                        // Build URL with society filter params
                        const filterParams = new URLSearchParams();
                        if (selectedSociety) filterParams.append('society_id', selectedSociety);
                        if (selectedPhase) filterParams.append('society_phase', selectedPhase);
                        if (selectedBlock) filterParams.append('society_block', selectedBlock);
                        const queryString = filterParams.toString();
                        navigate(`/agent/${id}${queryString ? '?' + queryString : ''}`);
                      }}
                    />
                  ))}
                </div>
                {agentsToShow < filteredAgents.length && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setAgentsToShow(prev => prev + 4)}
                  >
                    Show More Agents
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="p-8 text-center rounded-xl bg-muted/30 border border-border/50">
          <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            Search for any area in Pakistan to see AI-powered insights and find verified agents
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Popular areas: DHA, Bahria Town, Gulberg, Karachi, Lahore, Islamabad
          </p>
        </div>
      )}
    </div>
  );
}
