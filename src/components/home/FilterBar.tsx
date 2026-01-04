import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Home, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (area.trim()) params.set("area", area.trim());
    if (type) params.set("type", type);
    if (budget) params.set("budget", budget);
    const qs = params.toString();
    navigate(`/search${qs ? `?${qs}` : ""}`);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 rounded-2xl shadow-xl backdrop-blur-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        <div className="relative md:col-span-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="City (e.g., Lahore)"
            value={area}
            onChange={(e) => setArea(e.target.value)}
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
            className="flex h-11 w-full rounded-xl px-10 py-2 text-sm transition-all duration-300 glass-card border-2 border-transparent bg-card/80 backdrop-blur-xl focus:border-primary focus:shadow-glow focus:outline-none appearance-none cursor-pointer"
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
            className="flex h-11 w-full rounded-xl px-10 py-2 text-sm transition-all duration-300 glass-card border-2 border-transparent bg-card/80 backdrop-blur-xl focus:border-primary focus:shadow-glow focus:outline-none appearance-none cursor-pointer"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          >
            {budgets.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <Button type="submit" variant="hero" className="w-full h-11">
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
