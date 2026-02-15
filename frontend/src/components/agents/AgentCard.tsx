import { Star, CheckCircle, Building2, MapPin, MessageSquare, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Agent {
  id: string;
  name: string;
  agency: string;
  avatar: string;
  experience: number;
  properties: number;
  rating: number;
  reviews: number;
  verified: boolean;
  area: string;
}

interface AgentCardProps {
  agent: Agent;
  onViewProfile?: (id: string) => void;
  onContact?: (id: string) => void;
}

export function AgentCard({ agent, onViewProfile, onContact }: AgentCardProps) {
  return (
    <Card variant="interactive" className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header with Avatar */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-primary/20">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {agent.verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-verified flex items-center justify-center ring-2 ring-card">
                  <CheckCircle className="w-4 h-4 text-verified-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg truncate">{agent.name}</h3>
                {agent.verified && (
                  <Badge variant="verified" className="shrink-0">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{agent.agency}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{agent.area}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between py-3 border-y border-border/50">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{agent.experience}</p>
              <p className="text-xs text-muted-foreground">Years Exp</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{agent.properties}</p>
              <p className="text-xs text-muted-foreground">Properties</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <p className="text-lg font-bold text-foreground">{Math.round(agent.rating)}</p>
              </div>
              <p className="text-xs text-muted-foreground">{agent.reviews} reviews</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewProfile?.(agent.id)}
          >
            <Building2 className="w-4 h-4" />
            View Profile
          </Button>
          <Button
            variant="hero"
            className="flex-1"
            onClick={() => onContact?.(agent.id)}
          >
            <Phone className="w-4 h-4" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Sample agents data
export const sampleAgents: Agent[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    agency: "Elite Realty Group",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    experience: 8,
    properties: 45,
    rating: 4.9,
    reviews: 128,
    verified: true,
    area: "Karachi, Pakistan",
  },
  {
    id: "2",
    name: "Michael Chen",
    agency: "Prime Properties",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    experience: 12,
    properties: 78,
    rating: 4.8,
    reviews: 256,
    verified: true,
    area: "Lahore, Pakistan",
  },
  {
    id: "3",
    name: "Emily Davis",
    agency: "Luxury Homes Inc",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    experience: 5,
    properties: 32,
    rating: 4.7,
    reviews: 89,
    verified: true,
    area: "Islamabad, Pakistan",
  },
  {
    id: "4",
    name: "David Wilson",
    agency: "City Living Realtors",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    experience: 15,
    properties: 120,
    rating: 4.9,
    reviews: 342,
    verified: true,
    area: "Multan, Pakistan",
  },
  {
    id: "5",
    name: "Hassan Khan",
    agency: "DHA Properties",
    avatar: "https://images.unsplash.com/photo-1500595046891-16dabe73a8ba?w=200&h=200&fit=crop",
    experience: 10,
    properties: 67,
    rating: 4.8,
    reviews: 201,
    verified: true,
    area: "Karachi, Pakistan",
  },
  {
    id: "6",
    name: "Ayesha Malik",
    agency: "Bahria Town Specialists",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    experience: 7,
    properties: 52,
    rating: 4.6,
    reviews: 145,
    verified: true,
    area: "Lahore, Pakistan",
  },
  {
    id: "7",
    name: "Ahmed Hassan",
    agency: "Prime Realtor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    experience: 9,
    properties: 38,
    rating: 4.7,
    reviews: 112,
    verified: true,
    area: "Islamabad, Pakistan",
  },
  {
    id: "8",
    name: "Fatima Syed",
    agency: "DHA Lahore Specialists",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    experience: 11,
    properties: 89,
    rating: 4.9,
    reviews: 267,
    verified: true,
    area: "Lahore, Pakistan",
  },
  {
    id: "9",
    name: "Usman Ali",
    agency: "Rawalpindi Property Hub",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    experience: 6,
    properties: 41,
    rating: 4.5,
    reviews: 98,
    verified: true,
    area: "Rawalpindi, Pakistan",
  },
];
