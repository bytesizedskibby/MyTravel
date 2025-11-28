import { destinations } from "./data";

// Blog Post Types
export type BlogCategory = "solo-travel" | "family-trips" | "luxury-travel";

export interface BlogAuthor {
  id: string;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EditorContent = any; // Lexical serialized state - using any to avoid strict type issues with mock data

export interface BlogPost {
  id: string;
  title: string;
  category: BlogCategory;
  content: EditorContent | null; // Lexical serialized state
  excerpt: string;
  image: string;
  author: BlogAuthor;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

// Helper function to get author initials
export function getAuthorInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Category display names
export const blogCategoryLabels: Record<BlogCategory, string> = {
  "solo-travel": "Solo Travel",
  "family-trips": "Family Trips",
  "luxury-travel": "Luxury Travel",
};

// Mock Blog Posts with rich content
export const mockBlogPosts: BlogPost[] = [
  {
    id: "blog-1",
    title: "10 Hidden Gems in Europe You Must Visit",
    category: "solo-travel",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Europe is home to countless breathtaking destinations, but some of the most magical places remain off the beaten path. While cities like Paris, Rome, and Barcelona attract millions of tourists each year, there are hidden gems scattered across the continent that offer equally stunning experiences without the crowds.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "1. Hallstatt, Austria",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h2",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "This picturesque village sits on the shores of Lake Hallstatt, surrounded by towering Alpine peaks. With its charming pastel-colored houses and rich salt-mining history, Hallstatt feels like stepping into a fairy tale. Visit early morning or late afternoon to avoid the day-trippers and experience true tranquility.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "2. Colmar, France",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h2",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Often called 'Little Venice,' Colmar in the Alsace region features half-timbered houses painted in vibrant colors lining cobblestone streets. The town's blend of French and German influences creates a unique cultural experience, and its wine route through the surrounding vineyards is legendary.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    excerpt: "Move over Paris and Rome. Here are 10 underrated European destinations that deserve a spot on your bucket list.",
    image: destinations[0]?.image || "",
    author: { id: "user-1", name: "Sarah Jenkins" },
    createdAt: "2024-10-12T10:00:00Z",
    updatedAt: "2024-10-12T10:00:00Z",
    published: true,
  },
  {
    id: "blog-2",
    title: "A Guide to Solo Travel in Japan",
    category: "solo-travel",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Japan is one of the safest and most rewarding destinations for solo travelers. From the neon-lit streets of Tokyo to the serene temples of Kyoto, the country offers an incredible mix of ancient traditions and cutting-edge modernity. Here's everything you need to know about traveling alone in the Land of the Rising Sun.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Getting Around: The JR Pass",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h2",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "The Japan Rail Pass is your best friend for long-distance travel. Purchase it before arriving in Japan (it's only available to tourists) and enjoy unlimited travel on JR trains, including most shinkansen (bullet trains). A 7-day pass pays for itself after just one Tokyo-Kyoto round trip.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Dining Solo: Embrace the Counter",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h2",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Japanese dining culture is perfect for solo travelers. Ramen shops, sushi counters, and izakayas all feature counter seating where dining alone is completely normal. Many restaurants also have ticket machines where you order and pay before sitting down, eliminating any language barrier concerns.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    excerpt: "Everything you need to know about traveling alone in Japan, from rail passes to dining etiquette.",
    image: destinations[3]?.image || "",
    author: { id: "user-2", name: "James Chen" },
    createdAt: "2024-09-28T14:30:00Z",
    updatedAt: "2024-09-28T14:30:00Z",
    published: true,
  },
  {
    id: "blog-3",
    title: "Luxury on a Budget: Maldives Edition",
    category: "luxury-travel",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Yes, it is possible to experience the Maldives without emptying your bank account. While the destination is known for ultra-luxury resorts with eye-watering price tags, savvy travelers can enjoy crystal-clear waters and pristine beaches on a fraction of the typical budget.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Stay on Local Islands",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h2",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Since 2009, the Maldives has allowed guesthouses on local islands. Towns like Maafushi, Thulusdhoo, and Dhigurah offer budget-friendly accommodations starting at $50-80 per night, complete with access to stunning bikini beaches and excellent diving spots.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Book Resort Day Passes",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h2",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Many luxury resorts offer day passes that include lunch, pool access, and beach time. For around $100-200, you can experience resort life without the overnight rates. It's the perfect way to splurge for a day while keeping overall costs down.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    excerpt: "Yes, it is possible to experience the Maldives without breaking the bank. Here are our top tips.",
    image: destinations[1]?.image || "",
    author: { id: "user-3", name: "Emily Rodriguez" },
    createdAt: "2024-11-05T09:15:00Z",
    updatedAt: "2024-11-05T09:15:00Z",
    published: true,
  },
  {
    id: "blog-4",
    title: "Planning the Perfect Family Trip to Switzerland",
    category: "family-trips",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Switzerland is a dream destination for families, offering stunning Alpine scenery, outdoor adventures for all ages, and world-class infrastructure that makes traveling with kids a breeze. Here's how to plan an unforgettable Swiss family vacation.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Best Time to Visit",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h2",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Summer (June-August) is ideal for hiking, lake swimming, and cable car rides. Winter (December-March) offers excellent skiing at family-friendly resorts like Grindelwald and Verbier. Shoulder seasons provide fewer crowds and lower prices.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Kid-Friendly Activities",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h2",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Take the Glacier Express for a scenic train journey, visit the Swiss Transport Museum in Lucerne, or explore the Ballenberg Open-Air Museum. Most mountain areas have dedicated children's trails with interactive stations and adventure playgrounds.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    excerpt: "From scenic train rides to kid-friendly hiking trails, Switzerland offers endless adventures for the whole family.",
    image: destinations[2]?.image || "",
    author: { id: "user-4", name: "The Miller Family" },
    createdAt: "2024-10-20T16:45:00Z",
    updatedAt: "2024-10-20T16:45:00Z",
    published: true,
  },
  {
    id: "blog-5",
    title: "Ultimate Luxury Honeymoon in Santorini",
    category: "luxury-travel",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Santorini's dramatic caldera views, world-famous sunsets, and exclusive cave hotels make it one of the most romantic destinations on Earth. Here's how to plan the ultimate luxury honeymoon on this Greek island paradise.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Where to Stay",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h2",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Oia and Imerovigli offer the most luxurious accommodations with private plunge pools and unobstructed caldera views. Look for cave suites carved into the volcanic cliffs – they stay naturally cool and provide an unforgettable atmosphere.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Romantic Experiences",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h2",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Book a private sunset catamaran cruise, arrange a couples' wine tasting at Santo Wines, or dine at Selene for Michelin-quality Greek cuisine. Don't miss watching the sunset from Oia Castle – arrive an hour early to secure the best spot.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    excerpt: "Plan the perfect romantic getaway to Santorini with our guide to the best luxury hotels, dining, and experiences.",
    image: destinations[0]?.image || "",
    author: { id: "user-5", name: "Alexandra Costa" },
    createdAt: "2024-11-10T11:00:00Z",
    updatedAt: "2024-11-10T11:00:00Z",
    published: true,
  },
  {
    id: "blog-6",
    title: "Tokyo with Teens: A Family Adventure Guide",
    category: "family-trips",
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Traveling to Tokyo with teenagers can be an incredible bonding experience. The city's unique blend of anime culture, cutting-edge technology, and delicious food will keep even the most skeptical teen engaged. Here's how to plan a trip everyone will love.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Must-Visit Neighborhoods",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h2",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Harajuku is a must for fashion-forward teens, while Akihabara will delight anime and gaming enthusiasts. Shibuya's famous crossing and trendy shops appeal to all ages. For a quieter experience, explore the traditional streets of Yanaka.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Teen-Approved Activities",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "heading",
            version: 1,
            tag: "h2",
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Visit teamLab Borderless for immersive digital art, try a robot restaurant show, or spend a day at Tokyo DisneySea. Take a sushi-making class together, or challenge each other at a retro arcade in Nakano Broadway.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    },
    excerpt: "Keep your teenagers entertained in Tokyo with this guide to the best neighborhoods, activities, and food spots.",
    image: destinations[3]?.image || "",
    author: { id: "user-4", name: "The Miller Family" },
    createdAt: "2024-11-15T08:30:00Z",
    updatedAt: "2024-11-15T08:30:00Z",
    published: true,
  },
];

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
