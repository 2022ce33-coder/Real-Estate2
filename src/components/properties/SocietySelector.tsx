import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Layers } from "lucide-react";
import {
  HOUSING_SOCIETIES,
  getSocietiesByCity,
  getPhasesForSociety,
  getBlocksForPhase,
  type HousingSociety,
  type Phase,
  type Block,
} from "@/lib/housingSocieties";

interface SocietySelectorProps {
  city?: string;
  value?: {
    societyId: string;
    phase: string;
    block: string;
  };
  onChange: (value: { societyId: string; phase: string; block: string }) => void;
  showLabels?: boolean;
  required?: boolean;
  className?: string;
}

export function SocietySelector({
  city,
  value = { societyId: "", phase: "", block: "" },
  onChange,
  showLabels = true,
  required = false,
  className = "",
}: SocietySelectorProps) {
  const [societies, setSocieties] = useState<HousingSociety[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Update societies when city changes
  useEffect(() => {
    if (city) {
      const citySocieties = getSocietiesByCity(city);
      setSocieties(citySocieties);
    } else {
      setSocieties(HOUSING_SOCIETIES);
    }
    // Reset selections when city changes
    if (city && value.societyId) {
      const society = HOUSING_SOCIETIES.find(s => s.id === value.societyId);
      if (society && society.city.toLowerCase() !== city.toLowerCase()) {
        onChange({ societyId: "", phase: "", block: "" });
      }
    }
  }, [city]);

  // Update phases when society changes
  useEffect(() => {
    if (value.societyId) {
      const societyPhases = getPhasesForSociety(value.societyId);
      setPhases(societyPhases);
      // Auto-select "Main" phase if it exists and no phase selected
      if (!value.phase && societyPhases.length === 1) {
        onChange({ ...value, phase: societyPhases[0].name });
      }
    } else {
      setPhases([]);
    }
  }, [value.societyId]);

  // Update blocks when phase changes
  useEffect(() => {
    if (value.societyId && value.phase) {
      const phaseBlocks = getBlocksForPhase(value.societyId, value.phase);
      setBlocks(phaseBlocks);
    } else {
      setBlocks([]);
    }
  }, [value.societyId, value.phase]);

  const handleSocietyChange = (societyId: string) => {
    onChange({ societyId, phase: "", block: "" });
  };

  const handlePhaseChange = (phase: string) => {
    onChange({ ...value, phase, block: "" });
  };

  const handleBlockChange = (block: string) => {
    onChange({ ...value, block });
  };

  const selectedSociety = HOUSING_SOCIETIES.find(s => s.id === value.societyId);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Society Selection */}
      <div className="space-y-2">
        {showLabels && (
          <Label className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Housing Society {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <Select value={value.societyId || "_none"} onValueChange={(val) => handleSocietyChange(val === "_none" ? "" : val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a housing society" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="_none">None (Other Location)</SelectItem>
            {societies.map((society) => (
              <SelectItem key={society.id} value={society.id}>
                <div className="flex items-center gap-2">
                  <span>{society.name}</span>
                  {!city && (
                    <Badge variant="outline" className="text-xs">
                      {society.city}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedSociety?.description && (
          <p className="text-xs text-muted-foreground">{selectedSociety.description}</p>
        )}
      </div>

      {/* Phase/Sector Selection */}
      {phases.length > 0 && (
        <div className="space-y-2">
          {showLabels && (
            <Label className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              Phase / Sector {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          <Select value={value.phase} onValueChange={handlePhaseChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select phase or sector" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {phases.map((phase) => (
                <SelectItem key={phase.name} value={phase.name}>
                  {phase.name} ({phase.blocks.length} blocks)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Block Selection */}
      {blocks.length > 0 && (
        <div className="space-y-2">
          {showLabels && (
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Block / Area {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          <Select value={value.block} onValueChange={handleBlockChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select block or area" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {blocks.map((block) => (
                <SelectItem key={block.name} value={block.name}>
                  <div className="flex items-center gap-2">
                    <span>{block.name}</span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {block.type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Selected Location Summary */}
      {(value.societyId || value.phase || value.block) && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-1">Selected Location:</p>
          <p className="text-sm font-medium">
            {[
              selectedSociety?.name,
              value.phase !== 'Main' ? value.phase : null,
              value.block
            ].filter(Boolean).join(' → ')}
          </p>
        </div>
      )}
    </div>
  );
}

export default SocietySelector;
