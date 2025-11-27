import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export interface DestinationProps {
  id: string;
  title: string;
  location: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  tags: string[];
  description: string;
}

export function DestinationCard({ destination }: { destination: DestinationProps }) {
  return (
    <Card className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-card">
      <div className="relative h-64 overflow-hidden">
        <img
          src={destination.image}
          alt={destination.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary shadow-sm">
          MYR {destination.price}/night
        </div>
      </div>
      
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
              {destination.title}
            </h3>
            <div className="flex items-center text-muted-foreground mt-1 text-sm">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              {destination.location}
            </div>
          </div>
          <div className="flex items-center bg-accent/50 px-2 py-1 rounded text-xs font-medium">
            <Star className="h-3 w-3 fill-primary text-primary mr-1" />
            {destination.rating} ({destination.reviews})
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {destination.description}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {destination.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 pb-4">
        <Button asChild className="w-full group-hover:bg-primary/90" variant="outline">
          <Link href={`/destinations/${destination.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
