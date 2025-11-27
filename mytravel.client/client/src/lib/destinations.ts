// Destination interface definition
export interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
  continent: "Europe" | "Asia" | "North America" | "South America" | "Africa" | "Oceania";
  code: string; // Airport/city code
  type: "city" | "beach" | "mountain" | "island" | "countryside";
  popular: boolean;
}

// Predefined list of destinations for search boxes
export const destinationsList: Destination[] = [
  // Europe
  { id: "eur-1", name: "Paris, France", city: "Paris", country: "France", continent: "Europe", code: "PAR", type: "city", popular: true },
  { id: "eur-2", name: "London, United Kingdom", city: "London", country: "United Kingdom", continent: "Europe", code: "LON", type: "city", popular: true },
  { id: "eur-3", name: "Rome, Italy", city: "Rome", country: "Italy", continent: "Europe", code: "ROM", type: "city", popular: true },
  { id: "eur-4", name: "Barcelona, Spain", city: "Barcelona", country: "Spain", continent: "Europe", code: "BCN", type: "city", popular: true },
  { id: "eur-5", name: "Santorini, Greece", city: "Santorini", country: "Greece", continent: "Europe", code: "JTR", type: "island", popular: true },
  { id: "eur-6", name: "Amsterdam, Netherlands", city: "Amsterdam", country: "Netherlands", continent: "Europe", code: "AMS", type: "city", popular: true },
  { id: "eur-7", name: "Swiss Alps, Switzerland", city: "Zermatt", country: "Switzerland", continent: "Europe", code: "ZRH", type: "mountain", popular: true },
  { id: "eur-8", name: "Vienna, Austria", city: "Vienna", country: "Austria", continent: "Europe", code: "VIE", type: "city", popular: false },
  { id: "eur-9", name: "Prague, Czech Republic", city: "Prague", country: "Czech Republic", continent: "Europe", code: "PRG", type: "city", popular: false },
  { id: "eur-10", name: "Amalfi Coast, Italy", city: "Amalfi", country: "Italy", continent: "Europe", code: "NAP", type: "beach", popular: true },
  { id: "eur-11", name: "Dubrovnik, Croatia", city: "Dubrovnik", country: "Croatia", continent: "Europe", code: "DBV", type: "beach", popular: false },
  { id: "eur-12", name: "Reykjavik, Iceland", city: "Reykjavik", country: "Iceland", continent: "Europe", code: "REK", type: "city", popular: false },
  
  // Asia
  { id: "asi-1", name: "Tokyo, Japan", city: "Tokyo", country: "Japan", continent: "Asia", code: "TYO", type: "city", popular: true },
  { id: "asi-2", name: "Kyoto, Japan", city: "Kyoto", country: "Japan", continent: "Asia", code: "KIX", type: "city", popular: true },
  { id: "asi-3", name: "Bali, Indonesia", city: "Bali", country: "Indonesia", continent: "Asia", code: "DPS", type: "island", popular: true },
  { id: "asi-4", name: "Maldives", city: "Malé", country: "Maldives", continent: "Asia", code: "MLE", type: "island", popular: true },
  { id: "asi-5", name: "Singapore", city: "Singapore", country: "Singapore", continent: "Asia", code: "SIN", type: "city", popular: true },
  { id: "asi-6", name: "Bangkok, Thailand", city: "Bangkok", country: "Thailand", continent: "Asia", code: "BKK", type: "city", popular: true },
  { id: "asi-7", name: "Phuket, Thailand", city: "Phuket", country: "Thailand", continent: "Asia", code: "HKT", type: "beach", popular: true },
  { id: "asi-8", name: "Hong Kong", city: "Hong Kong", country: "Hong Kong", continent: "Asia", code: "HKG", type: "city", popular: true },
  { id: "asi-9", name: "Seoul, South Korea", city: "Seoul", country: "South Korea", continent: "Asia", code: "ICN", type: "city", popular: false },
  { id: "asi-10", name: "Kuala Lumpur, Malaysia", city: "Kuala Lumpur", country: "Malaysia", continent: "Asia", code: "KUL", type: "city", popular: true },
  { id: "asi-11", name: "Langkawi, Malaysia", city: "Langkawi", country: "Malaysia", continent: "Asia", code: "LGK", type: "island", popular: true },
  { id: "asi-12", name: "Hanoi, Vietnam", city: "Hanoi", country: "Vietnam", continent: "Asia", code: "HAN", type: "city", popular: false },
  { id: "asi-13", name: "Dubai, UAE", city: "Dubai", country: "United Arab Emirates", continent: "Asia", code: "DXB", type: "city", popular: true },
  
  // North America
  { id: "nam-1", name: "New York City, USA", city: "New York", country: "United States", continent: "North America", code: "NYC", type: "city", popular: true },
  { id: "nam-2", name: "Los Angeles, USA", city: "Los Angeles", country: "United States", continent: "North America", code: "LAX", type: "city", popular: true },
  { id: "nam-3", name: "Miami, USA", city: "Miami", country: "United States", continent: "North America", code: "MIA", type: "beach", popular: true },
  { id: "nam-4", name: "Las Vegas, USA", city: "Las Vegas", country: "United States", continent: "North America", code: "LAS", type: "city", popular: true },
  { id: "nam-5", name: "San Francisco, USA", city: "San Francisco", country: "United States", continent: "North America", code: "SFO", type: "city", popular: false },
  { id: "nam-6", name: "Cancun, Mexico", city: "Cancun", country: "Mexico", continent: "North America", code: "CUN", type: "beach", popular: true },
  { id: "nam-7", name: "Toronto, Canada", city: "Toronto", country: "Canada", continent: "North America", code: "YYZ", type: "city", popular: false },
  { id: "nam-8", name: "Vancouver, Canada", city: "Vancouver", country: "Canada", continent: "North America", code: "YVR", type: "city", popular: false },
  { id: "nam-9", name: "Hawaii, USA", city: "Honolulu", country: "United States", continent: "North America", code: "HNL", type: "island", popular: true },
  
  // South America
  { id: "sam-1", name: "Rio de Janeiro, Brazil", city: "Rio de Janeiro", country: "Brazil", continent: "South America", code: "GIG", type: "beach", popular: true },
  { id: "sam-2", name: "Buenos Aires, Argentina", city: "Buenos Aires", country: "Argentina", continent: "South America", code: "EZE", type: "city", popular: false },
  { id: "sam-3", name: "Machu Picchu, Peru", city: "Cusco", country: "Peru", continent: "South America", code: "CUZ", type: "mountain", popular: true },
  { id: "sam-4", name: "Cartagena, Colombia", city: "Cartagena", country: "Colombia", continent: "South America", code: "CTG", type: "beach", popular: false },
  
  // Africa
  { id: "afr-1", name: "Cape Town, South Africa", city: "Cape Town", country: "South Africa", continent: "Africa", code: "CPT", type: "city", popular: true },
  { id: "afr-2", name: "Marrakech, Morocco", city: "Marrakech", country: "Morocco", continent: "Africa", code: "RAK", type: "city", popular: true },
  { id: "afr-3", name: "Zanzibar, Tanzania", city: "Zanzibar", country: "Tanzania", continent: "Africa", code: "ZNZ", type: "island", popular: false },
  { id: "afr-4", name: "Cairo, Egypt", city: "Cairo", country: "Egypt", continent: "Africa", code: "CAI", type: "city", popular: true },
  { id: "afr-5", name: "Seychelles", city: "Victoria", country: "Seychelles", continent: "Africa", code: "SEZ", type: "island", popular: true },
  { id: "afr-6", name: "Mauritius", city: "Port Louis", country: "Mauritius", continent: "Africa", code: "MRU", type: "island", popular: true },
  
  // Oceania
  { id: "oce-1", name: "Sydney, Australia", city: "Sydney", country: "Australia", continent: "Oceania", code: "SYD", type: "city", popular: true },
  { id: "oce-2", name: "Melbourne, Australia", city: "Melbourne", country: "Australia", continent: "Oceania", code: "MEL", type: "city", popular: false },
  { id: "oce-3", name: "Gold Coast, Australia", city: "Gold Coast", country: "Australia", continent: "Oceania", code: "OOL", type: "beach", popular: false },
  { id: "oce-4", name: "Auckland, New Zealand", city: "Auckland", country: "New Zealand", continent: "Oceania", code: "AKL", type: "city", popular: false },
  { id: "oce-5", name: "Queenstown, New Zealand", city: "Queenstown", country: "New Zealand", continent: "Oceania", code: "ZQN", type: "mountain", popular: true },
  { id: "oce-6", name: "Fiji", city: "Suva", country: "Fiji", continent: "Oceania", code: "SUV", type: "island", popular: true },
  { id: "oce-7", name: "Bora Bora, French Polynesia", city: "Bora Bora", country: "French Polynesia", continent: "Oceania", code: "BOB", type: "island", popular: true },
];

// Helper functions
export function getPopularDestinations(): Destination[] {
  return destinationsList.filter(d => d.popular);
}

export function getDestinationsByContinent(continent: Destination["continent"]): Destination[] {
  return destinationsList.filter(d => d.continent === continent);
}

export function getDestinationsByType(type: Destination["type"]): Destination[] {
  return destinationsList.filter(d => d.type === type);
}

export function searchDestinations(query: string): Destination[] {
  const lowerQuery = query.toLowerCase();
  return destinationsList.filter(d => 
    d.name.toLowerCase().includes(lowerQuery) ||
    d.city.toLowerCase().includes(lowerQuery) ||
    d.country.toLowerCase().includes(lowerQuery) ||
    d.code.toLowerCase().includes(lowerQuery)
  );
}

export function getDestinationById(id: string): Destination | undefined {
  return destinationsList.find(d => d.id === id);
}
