import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/agents/AgentCard";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchAgentsByArea, fetchAllAgents } from "@/lib/agentService";
import type { AgentData } from "@/lib/agentService";

interface FeaturedAgentsSectionProps {
  filteredArea?: string;
}

export function FeaturedAgentsSection({ filteredArea }: FeaturedAgentsSectionProps) {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayTitle, setDisplayTitle] = useState("Featured Verified Agents");

  useEffect(() => {
    fetchAgents();
  }, [filteredArea]);

  useEffect(() => {
    if (filteredArea) {
      setDisplayTitle(`Verified Agents in ${filteredArea}`);
    } else {
      setDisplayTitle("Featured Verified Agents");
    }
  }, [filteredArea]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      let agentsList: AgentData[] = [];

      if (filteredArea) {
        // Fetch agents for the specific area
        agentsList = await fetchAgentsByArea(filteredArea);
      } else {
        // Fetch all agents for featured section on home page
        agentsList = await fetchAllAgents();
      }

      // Limit to 4 for featured section
      agentsList = agentsList.slice(0, 4);
      setAgents(agentsList);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Trusted Professionals</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              {displayTitle}
              {!filteredArea && <span className="gradient-text"> Verified Agents</span>}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl">
              {filteredArea
                ? `Connect with verified real estate agents specializing in ${filteredArea} to find your dream property.`
                : "Connect with our top-rated, verified real estate agents who are ready to help you find your dream property."}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/agents">
              View All Agents
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading agents...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No agents available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onViewProfile={(id) => navigate(`/agent/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
