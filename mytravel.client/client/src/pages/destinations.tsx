import { destinations, type TravelDestination } from "@/lib/data";
import { DestinationCard } from "@/components/destination-card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Filter, Map as MapIcon, List, Search, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Available filter options
const continentOptions = ["Europe", "Asia", "North America", "South America", "Africa", "Oceania"] as const;
const activityOptions = ["Beaches", "Hiking", "Cultural", "City Break", "Wildlife", "Relaxation"] as const;

export default function Destinations() {
  const [priceRange, setPriceRange] = useState([10000]); // MYR - start with max to show all
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedContinents, setSelectedContinents] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  // Fix map rendering issues when switching tabs
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [viewMode]);

  // Filter destinations based on all criteria
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      // Search filter - check title, location, description, and tags
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          dest.title.toLowerCase().includes(query) ||
          dest.location.toLowerCase().includes(query) ||
          dest.description.toLowerCase().includes(query) ||
          dest.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Price filter
      if (dest.price > priceRange[0]) return false;

      // Continent filter
      if (selectedContinents.length > 0) {
        if (!selectedContinents.includes(dest.continent)) return false;
      }

      // Activity filter
      if (selectedActivities.length > 0) {
        const destActivity = dest.activity.toLowerCase();
        const destTags = dest.tags.map(t => t.toLowerCase());
        const matchesActivity = selectedActivities.some(activity => {
          const activityLower = activity.toLowerCase();
          return destActivity.includes(activityLower) || 
                 destTags.some(tag => tag.includes(activityLower) || activityLower.includes(tag));
        });
        if (!matchesActivity) return false;
      }

      return true;
    });
  }, [searchQuery, priceRange, selectedContinents, selectedActivities]);

  // Toggle continent selection
  const toggleContinent = (continent: string) => {
    setSelectedContinents(prev => 
      prev.includes(continent) 
        ? prev.filter(c => c !== continent)
        : [...prev, continent]
    );
  };

  // Toggle activity selection
  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange([10000]);
    setSelectedContinents([]);
    setSelectedActivities([]);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || priceRange[0] < 10000 || selectedContinents.length > 0 || selectedActivities.length > 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-4">Discover Destinations</h1>
          <p className="text-muted-foreground">Find hidden gems across the world.</p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-lg">
          <Button 
            variant={viewMode === "list" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("list")}
            className="gap-2"
          >
            <List className="h-4 w-4" /> List
          </Button>
          <Button 
            variant={viewMode === "map" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setViewMode("map")}
            className="gap-2"
          >
            <MapIcon className="h-4 w-4" /> Map
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-8 h-fit sticky top-24 z-10">
          <div>
            <Label className="text-sm font-medium mb-2 block">Search Destination</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 flex items-center">
              <Filter className="h-4 w-4 mr-2" /> Filters
            </h3>
            
            <div className="space-y-6">
              {/* Price Filter */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <Label>Max Price (MYR)</Label>
                  <span className="font-medium text-primary">{priceRange[0].toLocaleString()}</span>
                </div>
                <Slider 
                  value={priceRange}
                  max={10000} 
                  min={500}
                  step={100} 
                  onValueChange={setPriceRange}
                  className="py-2"
                />
              </div>

              {/* Continent Filter */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Continent</Label>
                <div className="space-y-2">
                  {continentOptions.map((c) => (
                    <div key={c} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`c-${c}`} 
                        checked={selectedContinents.includes(c)}
                        onCheckedChange={() => toggleContinent(c)}
                      />
                      <label htmlFor={`c-${c}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                        {c}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Filter */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Activity</Label>
                <div className="space-y-2">
                  {activityOptions.map((a) => (
                    <div key={a} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`a-${a}`}
                        checked={selectedActivities.includes(a)}
                        onCheckedChange={() => toggleActivity(a)}
                      />
                      <label htmlFor={`a-${a}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                        {a}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {hasActiveFilters && (
              <Button className="w-full mt-8" variant="secondary" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" /> Clear Filters
              </Button>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-h-[600px]">
          {/* Results count */}
          <div className="mb-4 text-sm text-muted-foreground">
            {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''} found
            {hasActiveFilters && (
              <span className="ml-1">
                (filtered from {destinations.length} total)
              </span>
            )}
          </div>

          {viewMode === "list" ? (
            filteredDestinations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDestinations.map((dest) => (
                  <DestinationCard key={dest.id} destination={dest} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No destinations found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )
          ) : (
            <div className="h-[600px] rounded-xl overflow-hidden border border-border shadow-lg sticky top-24">
               <MapContainer 
                  center={[20, 0]} 
                  zoom={2} 
                  scrollWheelZoom={true} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredDestinations.map((dest) => (
                     dest.coordinates && (
                      <Marker key={dest.id} position={[dest.coordinates.lat, dest.coordinates.lng]}>
                        <Popup>
                          <div className="text-center">
                            <h3 className="font-bold">{dest.title}</h3>
                            <p className="text-xs">MYR {dest.price.toLocaleString()}</p>
                            <a href={`/destinations/${dest.id}`} className="text-primary text-xs hover:underline">View Details</a>
                          </div>
                        </Popup>
                      </Marker>
                     )
                  ))}
                </MapContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
