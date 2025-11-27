import { ItineraryPlanner } from "@/components/itinerary-planner";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Planner() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">Itinerary Planner</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Plan your dream trip effortlessly. Drag and drop activities to organize your day, 
            and we'll calculate the estimated cost and time for you.
          </p>
        </div>

        <ItineraryPlanner />
      </div>
    </div>
  );
}
