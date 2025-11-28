import { destinations } from "./data";

export interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  price: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  class: "economy" | "business" | "first";
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  pricePerNight: number;
  rating: number;
  image: string;
  amenities: string[];
}

export interface Tour {
  id: string;
  title: string;
  location: string;
  price: number;
  duration: string;
  rating: number;
  image: string;
  type: string;
}

// Mock Flights
export const mockFlights: Flight[] = [
  {
    id: "f1",
    airline: "Aegean Airlines",
    from: "New York",
    to: "Santorini, Greece",
    price: 850,
    duration: "10h 30m",
    departureTime: "10:00 AM",
    arrivalTime: "8:30 PM",
    class: "economy",
  },
  {
    id: "f2",
    airline: "Emirates",
    from: "London",
    to: "Maldives, Asia",
    price: 1200,
    duration: "12h 15m",
    departureTime: "2:00 PM",
    arrivalTime: "2:15 AM (+1)",
    class: "business",
  },
  {
    id: "f3",
    airline: "Swiss Air",
    from: "Paris",
    to: "Switzerland, Europe",
    price: 300,
    duration: "1h 20m",
    departureTime: "9:00 AM",
    arrivalTime: "10:20 AM",
    class: "economy",
  },
  {
    id: "f4",
    airline: "JAL",
    from: "Los Angeles",
    to: "Kyoto, Japan",
    price: 1500,
    duration: "11h 45m",
    departureTime: "11:00 PM",
    arrivalTime: "5:45 AM (+2)",
    class: "economy",
  },
];

// Mock Hotels (linked to destinations)
export const mockHotels: Hotel[] = [
  {
    id: "h1",
    name: "Santorini Palace",
    location: "Santorini, Greece",
    pricePerNight: 250,
    rating: 4.8,
    image: destinations[0]?.image || "",
    amenities: ["Pool", "Wifi", "Breakfast"],
  },
  {
    id: "h2",
    name: "Maldives Water Villa",
    location: "Maldives, Asia",
    pricePerNight: 800,
    rating: 5.0,
    image: destinations[1]?.image || "",
    amenities: ["Ocean View", "Spa", "Private Pool"],
  },
  {
    id: "h3",
    name: "Alpine Lodge",
    location: "Switzerland, Europe",
    pricePerNight: 400,
    rating: 4.7,
    image: destinations[2]?.image || "",
    amenities: ["Ski-in/Ski-out", "Fireplace", "Sauna"],
  },
  {
    id: "h4",
    name: "Kyoto Ryokan",
    location: "Kyoto, Japan",
    pricePerNight: 300,
    rating: 4.9,
    image: destinations[3]?.image || "",
    amenities: ["Onsen", "Tea Ceremony", "Garden"],
  },
];

// Mock Tours
export const mockTours: Tour[] = [
  {
    id: "t1",
    title: "Volcano & Hot Springs",
    location: "Santorini, Greece",
    price: 80,
    duration: "5 hours",
    rating: 4.5,
    image: destinations[0]?.image || "",
    type: "adventure",
  },
  {
    id: "t2",
    title: "Snorkeling Safari",
    location: "Maldives, Asia",
    price: 120,
    duration: "4 hours",
    rating: 4.9,
    image: destinations[1]?.image || "",
    type: "adventure",
  },
  {
    id: "t3",
    title: "Matterhorn Hike",
    location: "Switzerland, Europe",
    price: 50,
    duration: "6 hours",
    rating: 4.8,
    image: destinations[2]?.image || "",
    type: "adventure",
  },
  {
    id: "t4",
    title: "Tea Ceremony Experience",
    location: "Kyoto, Japan",
    price: 60,
    duration: "2 hours",
    rating: 4.7,
    image: destinations[3]?.image || "",
    type: "cultural",
  },
];

export const searchFlights = (to: string) => {
  if (!to) return mockFlights;
  return mockFlights.filter((f) => f.to.toLowerCase().includes(to.toLowerCase()));
};

export const searchHotels = (location: string) => {
  if (!location) return mockHotels;
  return mockHotels.filter((h) => h.location.toLowerCase().includes(location.toLowerCase()));
};

export const searchTours = (location: string) => {
  if (!location) return mockTours;
  return mockTours.filter((t) => t.location.toLowerCase().includes(location.toLowerCase()));
};
