import santoriniImg from "@assets/generated_images/hero_image_of_santorini_sunset.png";
import maldivesImg from "@assets/generated_images/tropical_maldives_beach.png";
import alpsImg from "@assets/generated_images/swiss_alps_landscape.png";
import kyotoImg from "@assets/generated_images/kyoto_street_with_cherry_blossoms.png";

// Extended destination interface for display cards with full details
export interface DestinationDetails {
  about: string;
  highlights: string[];
  bestTime: string;
  language: string;
  currency: string;
}

export interface TravelDestination {
  id: string;
  title: string;
  location: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  tags: string[];
  description: string;
  continent: string;
  activity: string;
  coordinates: { lat: number; lng: number };
  details: DestinationDetails;
}

export const destinations: TravelDestination[] = [
  {
    id: "1",
    title: "Santorini, Greece",
    location: "Greece, Europe",
    image: santoriniImg,
    price: 1200, // MYR
    rating: 4.9,
    reviews: 1240,
    tags: ["Beach", "Romantic", "Luxury"],
    description: "Experience the world-famous sunset in Oia, wander through white-washed streets, and enjoy crystal clear waters.",
    continent: "Europe",
    activity: "Relaxation",
    coordinates: { lat: 36.3932, lng: 25.4615 },
    details: {
      about: "Santorini is one of the Cyclades islands in the Aegean Sea. It was devastated by a volcanic eruption in the 16th century BC, forever shaping its rugged landscape. The whitewashed, cubiform houses of its 2 principal towns, Fira and Oia, cling to cliffs above an underwater caldera (crater). They overlook the sea, small islands to the west and beaches made up of black, red and white lava pebbles.",
      highlights: ["Oia Sunset", "Red Beach", "Ancient Thera", "Amoudi Bay"],
      bestTime: "April to October",
      language: "Greek",
      currency: "Euro (€)"
    }
  },
  {
    id: "2",
    title: "Maldives Overwater Villas",
    location: "Maldives, Asia",
    image: maldivesImg,
    price: 3800, // MYR
    rating: 5.0,
    reviews: 850,
    tags: ["Beach", "Luxury", "Honeymoon"],
    description: "Stay in a private overwater bungalow surrounded by turquoise lagoons and coral reefs.",
    continent: "Asia",
    activity: "Beaches",
    coordinates: { lat: 3.2028, lng: 73.2207 },
    details: {
      about: "The Maldives, officially the Republic of Maldives, is an archipelagic state in South Asia, situated in the Indian Ocean. It lies southwest of Sri Lanka and India, about 750 kilometres from the Asian continent's mainland.",
      highlights: ["Snorkeling", "Male Fish Market", "Island Hopping", "Underwater Dining"],
      bestTime: "November to April",
      language: "Dhivehi",
      currency: "Maldivian Rufiyaa (MVR)"
    }
  },
  {
    id: "3",
    title: "Swiss Alps Retreat",
    location: "Switzerland, Europe",
    image: alpsImg,
    price: 1800, // MYR
    rating: 4.8,
    reviews: 620,
    tags: ["Nature", "Hiking", "Mountains"],
    description: "Breathe in the fresh mountain air, hike through green meadows, and stay in a cozy wooden cabin.",
    continent: "Europe",
    activity: "Hiking",
    coordinates: { lat: 46.8182, lng: 8.2275 },
    details: {
      about: "The Swiss Alps are the high-altitude region of the Alps in Switzerland. The region is known for its breathtaking scenery, including snow-capped peaks, glaciers, and alpine lakes.",
      highlights: ["Matterhorn", "Jungfraujoch", "Lake Geneva", "Lucerne"],
      bestTime: "June to September (Hiking), December to March (Skiing)",
      language: "German, French, Italian",
      currency: "Swiss Franc (CHF)"
    }
  },
  {
    id: "4",
    title: "Kyoto Cultural Tour",
    location: "Kyoto, Japan",
    image: kyotoImg,
    price: 850, // MYR
    rating: 4.9,
    reviews: 2100,
    tags: ["Culture", "History", "Food"],
    description: "Immerse yourself in Japanese tradition, visit ancient temples, and walk through cherry blossom-lined streets.",
    continent: "Asia",
    activity: "Cultural",
    coordinates: { lat: 35.0116, lng: 135.7681 },
    details: {
      about: "Kyoto, once the capital of Japan, is a city on the island of Honshu. It's famous for its numerous classical Buddhist temples, as well as gardens, imperial palaces, Shinto shrines and traditional wooden houses.",
      highlights: ["Kinkaku-ji", "Fushimi Inari-taisha", "Arashiyama Bamboo Grove", "Gion District"],
      bestTime: "March to May, October to November",
      language: "Japanese",
      currency: "Japanese Yen (¥)"
    }
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Solo Traveler",
    content: "MyTravel made planning my solo trip to Japan so easy. The itinerary tool is a lifesaver!",
    avatar: "SJ"
  },
  {
    id: 2,
    name: "The Miller Family",
    role: "Family Vacation",
    content: "Booking our family trip to the Maldives was seamless. Great recommendations for kid-friendly resorts.",
    avatar: "MF"
  },
  {
    id: 3,
    name: "James Chen",
    role: "Adventure Seeker",
    content: "Found an amazing hidden hiking trail in the Alps thanks to the blog section. Highly recommend!",
    avatar: "JC"
  }
];

export const blogPosts = [
  {
    id: 1,
    title: "10 Hidden Gems in Europe You Must Visit",
    category: "Inspiration",
    date: "Oct 12, 2024",
    image: santoriniImg,
    excerpt: "Move over Paris and Rome. Here are 10 underrated European destinations that deserve a spot on your bucket list."
  },
  {
    id: 2,
    title: "A Guide to Solo Travel in Japan",
    category: "Solo Travel",
    date: "Sep 28, 2024",
    image: kyotoImg,
    excerpt: "Everything you need to know about traveling alone in Japan, from rail passes to dining etiquette."
  },
  {
    id: 3,
    title: "Luxury on a Budget: Maldives Edition",
    category: "Luxury Travel",
    date: "Nov 05, 2024",
    image: maldivesImg,
    excerpt: "Yes, it is possible to experience the Maldives without breaking the bank. Here are our top tips."
  }
];
