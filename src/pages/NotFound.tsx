import { Home, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="absolute inset-0 hero-pattern" />
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl floating" />
      <div className="absolute bottom-1/4 right-10 w-60 h-60 rounded-full bg-accent/10 blur-3xl floating" style={{ animationDelay: "2s" }} />
      
      <div className="relative text-center max-w-md mx-auto">
        {/* 404 Number */}
        <h1 className="text-[150px] sm:text-[200px] font-bold leading-none gradient-text">
          404
        </h1>
        
        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 -mt-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          Oops! The property you're looking for seems to have moved to a different address.
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" asChild>
            <Link to="/">
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
