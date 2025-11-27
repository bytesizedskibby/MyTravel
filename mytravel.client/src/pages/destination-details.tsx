import { useLocation, useRoute } from "wouter";
import { destinations } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Star, Calendar, DollarSign, Globe, Languages } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from "react";

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

export default function DestinationDetails() {
  const [, params] = useRoute("/destinations/:id");
  const [, setLocation] = useLocation();
  const destination = destinations.find(d => d.id === params?.id);

  // Force re-render for Leaflet when destination changes or loads
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [destination]);

  if (!destination) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Destination not found</h2>
        <Button onClick={() => setLocation("/destinations")} className="mt-4">
          Back to Destinations
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img 
          src={destination.image} 
          alt={destination.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute top-6 left-4 md:left-8">
          <Button 
            variant="secondary" 
            size="sm" 
            className="gap-2"
            onClick={() => setLocation("/destinations")}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {destination.tags.map(tag => (
                <span key={tag} className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-2 drop-shadow-sm">
              {destination.title}
            </h1>
            <div className="flex items-center text-lg text-muted-foreground">
              <MapPin className="h-5 w-5 mr-2" />
              {destination.location}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-serif font-bold mb-2">About this place</h2>
                    <div className="flex items-center gap-2 text-amber-500 font-medium">
                      <Star className="h-5 w-5 fill-current" />
                      <span>{destination.rating}</span>
                      <span className="text-muted-foreground">({destination.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Starting from</p>
                    <p className="text-3xl font-serif font-bold text-primary">MYR {destination.price}</p>
                  </div>
                </div>
                
                <Separator />
                
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {destination.details?.about || destination.description}
                </p>

                <div>
                  <h3 className="font-bold text-lg mb-4">Highlights</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {destination.details?.highlights?.map((highlight) => (
                      <div key={highlight} className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                        <span className="font-medium">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Section */}
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="h-[400px] w-full z-0 relative">
                {destination.coordinates && (
                  <MapContainer 
                    center={[destination.coordinates.lat, destination.coordinates.lng]} 
                    zoom={10} 
                    scrollWheelZoom={false} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[destination.coordinates.lat, destination.coordinates.lng]}>
                      <Popup>
                        {destination.title}
                      </Popup>
                    </Marker>
                  </MapContainer>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg sticky top-24">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-serif font-bold text-xl">Trip Essentials</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Best Time to Visit</p>
                      <p className="text-sm text-muted-foreground">{destination.details?.bestTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Languages className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Language</p>
                      <p className="text-sm text-muted-foreground">{destination.details?.language}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Currency</p>
                      <p className="text-sm text-muted-foreground">{destination.details?.currency}</p>
                    </div>
                  </div>
                </div>

                <Separator />
                
                <Button className="w-full h-12 text-lg" onClick={() => setLocation("/booking")}>
                  Book Now
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Free cancellation up to 24h before trip
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
