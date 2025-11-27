import { ItineraryPlanner } from "@/components/itinerary-planner";

export default function Planner() {
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
