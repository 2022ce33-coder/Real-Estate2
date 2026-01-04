import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedAgentsSection } from "@/components/home/FeaturedAgentsSection";
import { FeaturedPropertiesSection } from "@/components/home/FeaturedPropertiesSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HomeSearchPanel } from "@/components/home/HomeSearchPanel";
import { useState } from "react";

interface AreaSearchResult {
  name: string;
  description: string;
  amenities: string[];
  highlights: string[];
}

const Index = () => {
  const [searchedArea, setSearchedArea] = useState<AreaSearchResult | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Home Search Panel - AI-Powered Area Search */}
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Smart Search</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-2">
                Search Any Area with <span className="gradient-text">AI Insights</span>
              </h2>
              <p className="text-muted-foreground mt-2">
                Get comprehensive information about any area in Pakistan and find verified agents
              </p>
            </div>
            <HomeSearchPanel onAreaFound={setSearchedArea} />
          </div>
        </section>

        {/* Show area details and agents when searched */}
        {searchedArea && (
          <>
            {/* Featured Agents for searched area */}
            <FeaturedAgentsSection filteredArea={searchedArea.name} />
          </>
        )}

        {/* Show default sections if no area is searched */}
        {!searchedArea && (
          <>
            {/* Features */}
            <FeaturesSection />

            {/* Featured Agents */}
            <FeaturedAgentsSection />
          </>
        )}

        {/* Featured Properties */}
        <FeaturedPropertiesSection />

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
          <div className="absolute top-1/4 left-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-60 h-60 rounded-full bg-accent/10 blur-3xl" />
          
          <div className="container relative mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Your <span className="gradient-text">Dream Home</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of happy clients who found their perfect property through our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/properties"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-lg hover:shadow-glow hover:scale-[1.02] transition-all duration-300"
              >
                Browse Properties
              </a>
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl border-2 border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/40 font-semibold transition-all duration-300"
              >
                Become an Agent
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
