import santoriniImg from "@assets/generated_images/hero_image_of_santorini_sunset.png";
import maldivesImg from "@assets/generated_images/tropical_maldives_beach.png";
import alpsImg from "@assets/generated_images/swiss_alps_landscape.png";
import kyotoImg from "@assets/generated_images/kyoto_street_with_cherry_blossoms.png";
import egyptImg from "@assets/generated_images/egypt_pyramids_sphinx.jpg";
import costaRicaImg from "@assets/generated_images/costa_rica_waterfall.jpg";
import panamaImg from "@assets/generated_images/panama_san_blas.jpg";
import newZealandImg from "@assets/generated_images/new_zealand_aerial.jpg";
import australiaImg from "@assets/generated_images/australia_sydney_opera.jpg";
import kenyaImg from "@assets/generated_images/kenya_giraffe_safari.jpg";
import argentinaImg from "@assets/generated_images/argentina_buenos_aires.jpg";
import brazilImg from "@assets/generated_images/brazil_christ_redeemer.jpg";

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
  },
  // North America
  {
    id: "5",
    title: "Costa Rica Rainforest Adventure",
    location: "Costa Rica, North America",
    image: costaRicaImg,
    price: 1400,
    rating: 4.8,
    reviews: 980,
    tags: ["Nature", "Wildlife", "Adventure"],
    description: "Explore lush rainforests, spot exotic wildlife, and zip-line through the canopy in this eco-paradise.",
    continent: "North America",
    activity: "Wildlife",
    coordinates: { lat: 9.7489, lng: -83.7534 },
    details: {
      about: "Costa Rica is a Central American country known for its beaches, volcanoes, and biodiversity. Roughly a quarter of its area is made up of protected jungle, teeming with wildlife including spider monkeys and quetzal birds.",
      highlights: ["Arenal Volcano", "Monteverde Cloud Forest", "Manuel Antonio", "Tortuguero"],
      bestTime: "December to April",
      language: "Spanish",
      currency: "Costa Rican Colón (CRC)"
    }
  },
  {
    id: "6",
    title: "Panama Canal & City Explorer",
    location: "Panama, North America",
    image: panamaImg,
    price: 1100,
    rating: 4.7,
    reviews: 540,
    tags: ["City Break", "History", "Culture"],
    description: "Witness the engineering marvel of the Panama Canal and explore the vibrant Casco Viejo old town.",
    continent: "North America",
    activity: "Cultural",
    coordinates: { lat: 8.9824, lng: -79.5199 },
    details: {
      about: "Panama is a country on the isthmus linking Central and South America. The Panama Canal, a famous feat of human engineering, cuts through its center, linking the Atlantic and Pacific oceans to create an essential shipping route.",
      highlights: ["Panama Canal", "Casco Viejo", "San Blas Islands", "Biomuseo"],
      bestTime: "December to April",
      language: "Spanish",
      currency: "US Dollar (USD) / Balboa (PAB)"
    }
  },
  // Oceania
  {
    id: "7",
    title: "New Zealand South Island",
    location: "New Zealand, Oceania",
    image: newZealandImg,
    price: 2200,
    rating: 4.9,
    reviews: 1560,
    tags: ["Nature", "Hiking", "Adventure"],
    description: "Discover dramatic fjords, snow-capped mountains, and adventure sports in the stunning South Island.",
    continent: "Oceania",
    activity: "Hiking",
    coordinates: { lat: -45.0312, lng: 168.6626 },
    details: {
      about: "New Zealand's South Island is known for its stunning natural beauty, from the dramatic Milford Sound to the adventure capital Queenstown. The island offers world-class hiking, skiing, and bungee jumping.",
      highlights: ["Milford Sound", "Queenstown", "Franz Josef Glacier", "Mount Cook"],
      bestTime: "December to February (Summer), June to August (Skiing)",
      language: "English, Māori",
      currency: "New Zealand Dollar (NZD)"
    }
  },
  {
    id: "8",
    title: "Australian Outback Safari",
    location: "Australia, Oceania",
    image: australiaImg,
    price: 1900,
    rating: 4.7,
    reviews: 890,
    tags: ["Nature", "Wildlife", "Adventure"],
    description: "Experience the vast red desert, ancient Aboriginal culture, and unique wildlife of the Australian Outback.",
    continent: "Oceania",
    activity: "Wildlife",
    coordinates: { lat: -25.3444, lng: 131.0369 },
    details: {
      about: "The Australian Outback is the vast, remote interior of Australia. It's known for its red earth, ancient rock formations like Uluru, and unique wildlife including kangaroos and emus.",
      highlights: ["Uluru", "Kata Tjuta", "Kings Canyon", "Alice Springs"],
      bestTime: "May to September",
      language: "English",
      currency: "Australian Dollar (AUD)"
    }
  },
  // Africa
  {
    id: "9",
    title: "Egypt Pyramids & Nile Cruise",
    location: "Egypt, Africa",
    image: egyptImg,
    price: 1600,
    rating: 4.8,
    reviews: 2340,
    tags: ["History", "Culture", "Luxury"],
    description: "Marvel at the ancient pyramids of Giza and cruise the legendary Nile River through 5,000 years of history.",
    continent: "Africa",
    activity: "Cultural",
    coordinates: { lat: 29.9792, lng: 31.1342 },
    details: {
      about: "Egypt is a country linking northeast Africa with the Middle East, dating to the time of the pharaohs. Millennia-old monuments sit along the fertile Nile River Valley, including the colossal Pyramids and Great Sphinx.",
      highlights: ["Pyramids of Giza", "Valley of the Kings", "Luxor Temple", "Abu Simbel"],
      bestTime: "October to April",
      language: "Arabic",
      currency: "Egyptian Pound (EGP)"
    }
  },
  {
    id: "10",
    title: "Kenya Safari Experience",
    location: "Kenya, Africa",
    image: kenyaImg,
    price: 2800,
    rating: 4.9,
    reviews: 1120,
    tags: ["Wildlife", "Nature", "Adventure"],
    description: "Witness the Great Migration, spot the Big Five, and stay in luxury safari lodges in the Maasai Mara.",
    continent: "Africa",
    activity: "Wildlife",
    coordinates: { lat: -1.2921, lng: 36.8219 },
    details: {
      about: "Kenya is a country in East Africa with coastline on the Indian Ocean. It encompasses savannah, lakelands, the dramatic Great Rift Valley and mountain highlands. It's also home to wildlife like lions, elephants and rhinos.",
      highlights: ["Maasai Mara", "Amboseli National Park", "Lake Nakuru", "Nairobi National Park"],
      bestTime: "July to October (Great Migration), January to February",
      language: "Swahili, English",
      currency: "Kenyan Shilling (KES)"
    }
  },
  // South America
  {
    id: "11",
    title: "Rio de Janeiro Carnival",
    location: "Brazil, South America",
    image: brazilImg,
    price: 1500,
    rating: 4.8,
    reviews: 1890,
    tags: ["Beach", "Culture", "City Break"],
    description: "Experience the vibrant energy of Rio, from iconic beaches like Copacabana to the world-famous Carnival celebration.",
    continent: "South America",
    activity: "Cultural",
    coordinates: { lat: -22.9068, lng: -43.1729 },
    details: {
      about: "Rio de Janeiro is a huge seaside city in Brazil, famed for its Copacabana and Ipanema beaches, 38m Christ the Redeemer statue atop Mount Corcovado and for Sugarloaf Mountain, a granite peak with cable cars to its summit.",
      highlights: ["Christ the Redeemer", "Sugarloaf Mountain", "Copacabana Beach", "Carnival"],
      bestTime: "December to March (Summer), February (Carnival)",
      language: "Portuguese",
      currency: "Brazilian Real (BRL)"
    }
  },
  {
    id: "12",
    title: "Buenos Aires Tango & Culture",
    location: "Argentina, South America",
    image: argentinaImg,
    price: 1200,
    rating: 4.7,
    reviews: 1450,
    tags: ["Culture", "City Break", "Food"],
    description: "Discover the passionate soul of Argentina through tango, world-class cuisine, and stunning European-style architecture.",
    continent: "South America",
    activity: "Cultural",
    coordinates: { lat: -34.6037, lng: -58.3816 },
    details: {
      about: "Buenos Aires is Argentina's big, cosmopolitan capital city. Its center is the Plaza de Mayo, lined with stately 19th-century buildings including Casa Rosada, the iconic, balconied presidential palace. The city is known for tango, steakhouses, and vibrant nightlife.",
      highlights: ["La Boca", "Recoleta Cemetery", "Teatro Colón", "San Telmo Market"],
      bestTime: "March to May, September to November",
      language: "Spanish",
      currency: "Argentine Peso (ARS)"
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
