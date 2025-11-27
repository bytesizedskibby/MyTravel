import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Hotel, Map as MapIcon, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function BookingForm() {
  const [date, setDate] = useState<Date>();

  return (
    <Card className="w-full shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Book Your Trip</CardTitle>
        <CardDescription>Secure your flights, hotels, and tours instantly.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hotels" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="hotels" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Hotel className="mr-2 h-4 w-4" /> Hotels
            </TabsTrigger>
            <TabsTrigger value="flights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Plane className="mr-2 h-4 w-4" /> Flights
            </TabsTrigger>
            <TabsTrigger value="tours" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MapIcon className="mr-2 h-4 w-4" /> Tours
            </TabsTrigger>
          </TabsList>

          {/* Hotels Form */}
          <TabsContent value="hotels" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" placeholder="Where are you going?" />
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
            <Button className="w-full mt-4" size="lg">Search Hotels</Button>
          </TabsContent>

          {/* Flights Form */}
          <TabsContent value="flights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Input id="from" placeholder="City or Airport" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input id="to" placeholder="City or Airport" />
              </div>
              <div className="space-y-2">
                <Label>Departure</Label>
                <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground">
                  <CalendarIcon className="mr-2 h-4 w-4" /> Pick a date
                </Button>
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
            <Button className="w-full mt-4" size="lg">Search Flights</Button>
          </TabsContent>
          
           {/* Tours Form */}
           <TabsContent value="tours" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="City or Region" />
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
            <Button className="w-full mt-4" size="lg">Find Experiences</Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
