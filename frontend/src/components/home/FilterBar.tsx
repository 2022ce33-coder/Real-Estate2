import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Home, DollarSign, Building2, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  HOUSING_SOCIETIES, 
  getSocietiesByCity, 
  getPhasesForSociety, 
  getBlocksForPhase,
  type HousingSociety,
  type Phase,
  type Block
} from "@/lib/housingSocieties";

const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Gujranwala"];
const types = [
  { label: "Any Type", value: "" },
  { label: "Apartment", value: "Apartment" },
  { label: "House", value: "House" },
  { label: "Villa", value: "Villa" },
  { label: "Commercial", value: "Commercial" },
  { label: "Land", value: "Land" },
];
const budgets = [
  { label: "Any Budget", value: "" },
  { label: "Under PKR 100K", value: "0-100000" },
  { label: "PKR 100K - PKR 300K", value: "100000-300000" },
  { label: "PKR 300K - PKR 500K", value: "300000-500000" },
  { label: "PKR 500K - PKR 1M", value: "500000-1000000" },
  { label: "PKR 1M+", value: "1000000+" },
];

export default function FilterBar() {
  const [area, setArea] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Society filters
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSociety, setSelectedSociety] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  
  // Cascading options
  const [availableSocieties, setAvailableSocieties] = useState<HousingSociety[]>([]);
  const [availablePhases, setAvailablePhases] = useState<Phase[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>([]);

  const navigate = useNavigate();

  // Update societies when city changes
  useEffect(() => {
    if (selectedCity) {
      const societies = getSocietiesByCity(selectedCity);
      setAvailableSocieties(societies);
      setSelectedSociety("");
      setSelectedPhase("");
      setSelectedBlock("");
      setAvailablePhases([]);
      setAvailableBlocks([]);
    } else {
      // Show all societies when no city is selected
      setAvailableSocieties(HOUSING_SOCIETIES);
      setSelectedSociety("");
      setSelectedPhase("");
      setSelectedBlock("");
      setAvailablePhases([]);
      setAvailableBlocks([]);
    }
  }, [selectedCity]);

  // Update phases when society changes
  useEffect(() => {
    if (selectedSociety) {
      const phases = getPhasesForSociety(selectedSociety);
      setAvailablePhases(phases);
      setSelectedPhase("");
      setSelectedBlock("");
      setAvailableBlocks([]);
    } else {
      setAvailablePhases([]);
      setSelectedPhase("");
      setSelectedBlock("");
      setAvailableBlocks([]);
    }
  }, [selectedSociety]);

  // Update blocks when phase changes
  useEffect(() => {
    if (selectedSociety && selectedPhase) {
      const blocks = getBlocksForPhase(selectedSociety, selectedPhase);
      setAvailableBlocks(blocks);
      setSelectedBlock("");
    } else {
      setAvailableBlocks([]);
      setSelectedBlock("");
    }
  }, [selectedSociety, selectedPhase]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    
    // Basic filters
    if (area.trim()) params.set("area", area.trim());
    if (type) params.set("type", type);
    if (budget) params.set("budget", budget);
    
    // Society filters
    if (selectedSociety) params.set("society", selectedSociety);
    if (selectedPhase) params.set("phase", selectedPhase);
    if (selectedBlock) params.set("block", selectedBlock);
    
    const qs = params.toString();
    navigate(`/search${qs ? `?${qs}` : ""}`);
  };

  const selectClassName = "flex h-11 w-full rounded-xl px-10 py-2 text-sm transition-all duration-300 glass-card border-2 border-transparent bg-card/80 backdrop-blur-xl focus:border-primary focus:shadow-glow focus:outline-none appearance-none cursor-pointer";

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 rounded-2xl shadow-xl backdrop-blur-lg">
      {/* Main Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        <div className="relative md:col-span-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="City (e.g., Lahore)"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              // Also set city filter for society dropdown
              if (cities.includes(e.target.value)) {
                setSelectedCity(e.target.value);
              }
            }}
            list="city-options"
          />
          <datalist id="city-options">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="relative">
          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <select
            className={selectClassName}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {types.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <select
            className={selectClassName}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          >
            {budgets.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" variant="hero" className="flex-1 h-11">
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={() => setShowAdvanced(!showAdvanced)}
            title={showAdvanced ? "Hide filters" : "More filters"}
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Advanced Society Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-border/50 animate-fade-in">
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Filter by Housing Society
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Society Selection */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                className={selectClassName}
                value={selectedSociety}
                onChange={(e) => setSelectedSociety(e.target.value)}
              >
                <option value="">Select Society</option>
                {(availableSocieties.length > 0 ? availableSocieties : HOUSING_SOCIETIES).map((society) => (
                  <option key={society.id} value={society.id}>
                    {society.name} ({society.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Phase Selection */}
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                className={selectClassName}
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                disabled={!selectedSociety || availablePhases.length === 0}
              >
                <option value="">
                  {!selectedSociety ? "Select Society First" : "All Phases/Sectors"}
                </option>
                {availablePhases.map((phase) => (
                  <option key={phase.name} value={phase.name}>
                    {phase.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Block Selection */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                className={selectClassName}
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                disabled={!selectedPhase || availableBlocks.length === 0}
              >
                <option value="">
                  {!selectedPhase ? "Select Phase First" : "All Blocks"}
                </option>
                {availableBlocks.map((block) => (
                  <option key={block.name} value={block.name}>
                    {block.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Selected Location Display */}
          {selectedSociety && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Searching in:</span>
              <div className="flex items-center gap-1 font-medium text-primary">
                <span>{HOUSING_SOCIETIES.find(s => s.id === selectedSociety)?.name}</span>
                {selectedPhase && (
                  <>
                    <span className="text-muted-foreground">→</span>
                    <span>{selectedPhase}</span>
                  </>
                )}
                {selectedBlock && (
                  <>
                    <span className="text-muted-foreground">→</span>
                    <span>{selectedBlock}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
