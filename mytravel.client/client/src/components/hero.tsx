import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import heroImage from "@assets/generated_images/hero_image_of_santorini_sunset.png";
import { useState } from "react";
import { useLocation } from "wouter";
import { DestinationCombobox } from "@/components/ui/destination-combobox";
import { getDestinationById } from "@/lib/destinations";

export function Hero() {
  const [selectedDestination, setSelectedDestination] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDestination) {
      const destination = getDestinationById(selectedDestination);
      if (destination) {
        setLocation(`/destinations?search=${encodeURIComponent(destination.name)}`);
      }
    } else {
      setLocation('/destinations');
    }
  };

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Santorini Sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 bg-gradient-to-b from-black/50 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white space-y-8">
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
          Explore the World <br />
          <span className="italic font-light text-accent">with Ease</span>
        </h1>
        
        <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/90 font-light drop-shadow-md animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
          Discover hidden gems, plan your dream itinerary, and book unforgettable experiences in one seamless journey.
        </p>

        {/* Search Bar */}
        <div className="flex justify-center max-w-3xl mx-auto mt-10 animate-in fade-in scale-in-95 duration-500 delay-300">
          <form 
            onSubmit={handleSearch}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full flex flex-col md:flex-row gap-2 shadow-2xl"
          >
            {/* <div className="flex-1 bg-white rounded-full">
              <DestinationCombobox
                value={selectedDestination}
                onValueChange={setSelectedDestination}
                placeholder="Where do you want to go?"
                className="h-14 border-none shadow-none rounded-full bg-transparent"
              />
            </div> */}
            
            <Button 
              size="lg" 
              type="submit"
              className="h-14 rounded-full px-8 text-base font-semibold shadow-lg hover:scale-105 transition-transform"
            >
              Plan Your Trip Now! <Search className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/70">
        <span className="text-xs tracking-widest uppercase">Scroll to Explore</span>
      </div>
    </div>
  );
}
