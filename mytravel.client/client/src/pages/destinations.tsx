import { destinations } from "@/lib/data";
import { DestinationCard } from "@/components/destination-card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, Map as MapIcon, List } from "lucide-react";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DestinationCombobox } from "@/components/ui/destination-combobox";

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

export default function Destinations() {
  const [priceRange, setPriceRange] = useState([5000]); // MYR
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchDestination, setSearchDestination] = useState<string>("");

  // Fix map rendering issues when switching tabs
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [viewMode]);

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
            <DestinationCombobox 
              value={searchDestination}
              onValueChange={setSearchDestination}
              placeholder="Search places..."
            />
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
                  <span className="font-medium text-primary">{priceRange[0]}</span>
                </div>
                <Slider 
                  defaultValue={[5000]} 
                  max={10000} 
                  step={100} 
                  onValueChange={setPriceRange}
                  className="py-2"
                />
              </div>

              {/* Continent Filter */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Continent</Label>
                <div className="space-y-2">
                  {["Europe", "Asia", "North America", "Africa", "Oceania"].map((c) => (
                    <div key={c} className="flex items-center space-x-2">
                      <Checkbox id={`c-${c}`} />
                      <label htmlFor={`c-${c}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                  {["Beaches", "Hiking", "Cultural", "City Break", "Wildlife"].map((a) => (
                    <div key={a} className="flex items-center space-x-2">
                      <Checkbox id={`a-${a}`} />
                      <label htmlFor={`a-${a}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {a}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Button className="w-full mt-8" variant="secondary">Apply Filters</Button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-h-[600px]">
          {viewMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
              {/* Duplicate for fullness */}
              {destinations.map((dest) => (
                <DestinationCard key={`${dest.id}-dup`} destination={{...dest, id: `${dest.id}-dup`}} />
              ))}
            </div>
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
                  {destinations.map((dest) => (
                     dest.coordinates && (
                      <Marker key={dest.id} position={[dest.coordinates.lat, dest.coordinates.lng]}>
                        <Popup>
                          <div className="text-center">
                            <h3 className="font-bold">{dest.title}</h3>
                            <p className="text-xs">MYR {dest.price}</p>
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
