import { Sparkles, Shield, Bot, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Search",
    description: "Our intelligent search understands your needs and connects you with the perfect properties and agents.",
    color: "primary",
  },
  {
    icon: Shield,
    title: "Verified Agents",
    description: "All agents undergo thorough verification including CNIC and document checks for your peace of mind.",
    color: "verified",
  },
  {
    icon: Bot,
    title: "Smart Descriptions",
    description: "AI-generated property descriptions that are professional, attractive, and SEO-optimized.",
    color: "accent",
  },
  {
    icon: MapPin,
    title: "Area Intelligence",
    description: "Get detailed insights about any area including amenities, pricing trends, and neighborhood ratings.",
    color: "primary",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Why Choose Us</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            Powered by <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="text-muted-foreground mt-4">
            Experience the future of real estate with our AI-driven platform that makes finding your perfect home effortless.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {features.map((feature) => (
            <Card key={feature.title} variant="interactive" className="text-center p-6">
              <CardContent className="p-0 space-y-4">
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-${feature.color}/10 flex items-center justify-center`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
