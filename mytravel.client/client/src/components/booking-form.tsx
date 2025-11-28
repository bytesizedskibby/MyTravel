import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Hotel, Map as MapIcon, CalendarIcon, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DestinationCombobox, FlightDestinationCombobox } from "@/components/ui/destination-combobox";
import { useCart } from "@/context/cart-context";
import { searchFlights, searchHotels, searchTours, Flight, Hotel as HotelType, Tour } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { CartSheet } from "@/components/cart-sheet";
import { getDestinationById, destinationsList } from "@/lib/destinations";

export function BookingForm() {
  const [activeTab, setActiveTab] = useState("flights");
  const [date, setDate] = useState<Date>();
  
  // Search State
  const [hotelDestination, setHotelDestination] = useState<string>("");
  const [flightFrom, setFlightFrom] = useState<string>("");
  const [flightTo, setFlightTo] = useState<string>("");
  const [tourLocation, setTourLocation] = useState<string>("");

  // Results State
  const [flightResults, setFlightResults] = useState<Flight[]>([]);
  const [hotelResults, setHotelResults] = useState<HotelType[]>([]);
  const [tourResults, setTourResults] = useState<Tour[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const destinationParam = params.get("destination");
    
    if (destinationParam) {
      // Try to find a match in destinationsList
      const match = destinationsList.find(d => 
        destinationParam.toLowerCase().includes(d.city.toLowerCase()) || 
        destinationParam.toLowerCase().includes(d.name.toLowerCase()) ||
        d.name.toLowerCase().includes(destinationParam.toLowerCase())
      );
      
      if (match) {
        setHotelDestination(match.id);
        setFlightTo(match.id);
        setTourLocation(match.id);
        setActiveTab("hotels"); 
      }
    }
  }, []);

  const getDestinationName = (id: string) => {
    const dest = getDestinationById(id);
    return dest ? dest.city : id;
  };

  const getDestinationId = (name: string) => {
    const dest = destinationsList.find(d => name.toLowerCase().includes(d.city.toLowerCase()));
    return dest ? dest.id : "";
  };

  const handleSearchFlights = () => {
    const location = getDestinationName(flightTo);
    const results = searchFlights(location);
    setFlightResults(results);
    setShowResults(true);
  };

  const handleSearchHotels = () => {
    const location = getDestinationName(hotelDestination);
    const results = searchHotels(location);
    setHotelResults(results);
    setShowResults(true);
  };

  const handleSearchTours = () => {
    const location = getDestinationName(tourLocation);
    const results = searchTours(location);
    setTourResults(results);
    setShowResults(true);
  };

  const addToCart = (item: any, type: 'flight' | 'hotel' | 'tour') => {
    let title = "";
    let details = "";
    let price = 0;

    if (type === 'flight') {
      const f = item as Flight;
      title = `${f.airline} to ${f.to}`;
      details = `${f.from} - ${f.to} | ${f.departureTime}`;
      price = f.price;
      
      // Seamless transition: Pre-fill hotel destination and switch tab
      const destId = getDestinationId(f.to);
      setHotelDestination(destId);
      setTourLocation(destId);
      setActiveTab("hotels");
      setShowResults(false);
      toast({ title: "Flight added!", description: "Now, let's find a hotel in " + f.to });
    } else if (type === 'hotel') {
      const h = item as HotelType;
      title = h.name;
      details = `${h.location} | ${h.rating} Stars`;
      price = h.pricePerNight;
      
      // Seamless transition: Pre-fill tour location and switch tab
      const destId = getDestinationId(h.location);
      setTourLocation(destId);
      setActiveTab("tours");
      setShowResults(false);
      toast({ title: "Hotel added!", description: "Check out some tours in " + h.location });
    } else {
      const t = item as Tour;
      title = t.title;
      details = `${t.duration} | ${t.type}`;
      price = t.price;
      toast({ title: "Tour added!", description: "Your trip is coming together!" });
    }

    addItem({ type, title, details, price, image: item.image });
  };

  return (
    <div className="space-y-6">
      <Card className="w-full shadow-lg border-border/50 relative">
        <div className="absolute top-4 right-4 z-10">
          <CartSheet />
        </div>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Book Your Trip</CardTitle>
          <CardDescription>Secure your flights, hotels, and tours instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="flights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Plane className="mr-2 h-4 w-4" /> Flights
              </TabsTrigger>
              <TabsTrigger value="hotels" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Hotel className="mr-2 h-4 w-4" /> Hotels
              </TabsTrigger>
              <TabsTrigger value="tours" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MapIcon className="mr-2 h-4 w-4" /> Tours
              </TabsTrigger>
            </TabsList>

            {/* Flights Form */}
            <TabsContent value="flights" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <FlightDestinationCombobox 
                    variant="from"
                    value={flightFrom}
                    onValueChange={setFlightFrom}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <FlightDestinationCombobox 
                    variant="to"
                    value={flightTo}
                    onValueChange={setFlightTo}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departure</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground">
                        <CalendarIcon className="mr-2 h-4 w-4" /> {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full mt-4" size="lg" onClick={handleSearchFlights}>Search Flights</Button>
            </TabsContent>

            {/* Hotels Form */}
            <TabsContent value="hotels" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <DestinationCombobox 
                    value={hotelDestination}
                    onValueChange={setHotelDestination}
                    placeholder="Where are you going?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Guests</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select guests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Adult</SelectItem>
                      <SelectItem value="2">2 Adults</SelectItem>
                      <SelectItem value="3">2 Adults, 1 Child</SelectItem>
                      <SelectItem value="4">Family (4+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="deluxe">Deluxe</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full mt-4" size="lg" onClick={handleSearchHotels}>Search Hotels</Button>
            </TabsContent>
            
             {/* Tours Form */}
             <TabsContent value="tours" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <DestinationCombobox 
                    value={tourLocation}
                    onValueChange={setTourLocation}
                    placeholder="City or Region"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Activity Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Activities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="food">Food & Drink</SelectItem>
                      <SelectItem value="relaxation">Relaxation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full mt-4" size="lg" onClick={handleSearchTours}>Find Experiences</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results Section */}
      {showResults && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-semibold">
            Available {activeTab === 'flights' ? 'Flights' : activeTab === 'hotels' ? 'Hotels' : 'Tours'}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {activeTab === 'flights' && flightResults.map(flight => (
              <Card key={flight.id} className="flex flex-col sm:flex-row items-center justify-between p-4">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Plane className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{flight.airline}</h4>
                    <p className="text-sm text-muted-foreground">{flight.departureTime} - {flight.arrivalTime}</p>
                    <p className="text-xs text-muted-foreground">{flight.duration} • {flight.class}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold">${flight.price}</span>
                  <Button onClick={() => addToCart(flight, 'flight')}>Select</Button>
                </div>
              </Card>
            ))}

            {activeTab === 'hotels' && hotelResults.map(hotel => (
              <Card key={hotel.id} className="flex flex-col sm:flex-row items-center justify-between p-4">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden">
                    {hotel.image && <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{hotel.name}</h4>
                    <p className="text-sm text-muted-foreground">{hotel.location}</p>
                    <div className="flex gap-1 mt-1">
                      {hotel.amenities.map(a => (
                        <span key={a} className="text-xs bg-secondary px-2 py-0.5 rounded">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xl font-bold block">${hotel.pricePerNight}</span>
                    <span className="text-xs text-muted-foreground">per night</span>
                  </div>
                  <Button onClick={() => addToCart(hotel, 'hotel')}>Select</Button>
                </div>
              </Card>
            ))}

            {activeTab === 'tours' && tourResults.map(tour => (
              <Card key={tour.id} className="flex flex-col sm:flex-row items-center justify-between p-4">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden">
                    {tour.image && <img src={tour.image} alt={tour.title} className="h-full w-full object-cover" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{tour.title}</h4>
                    <p className="text-sm text-muted-foreground">{tour.duration} • {tour.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold">${tour.price}</span>
                  <Button onClick={() => addToCart(tour, 'tour')}>Select</Button>
                </div>
              </Card>
            ))}

            {((activeTab === 'flights' && flightResults.length === 0) ||
              (activeTab === 'hotels' && hotelResults.length === 0) ||
              (activeTab === 'tours' && tourResults.length === 0)) && (
                <div className="text-center py-8 text-muted-foreground">
                  No results found. Try a different search.
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
