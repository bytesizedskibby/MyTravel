import { Hero } from "@/components/hero";
import { DestinationCard } from "@/components/destination-card";
import { destinations, testimonials } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowRight, Quote } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      <Hero />

      {/* Featured Destinations */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Popular Destinations
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Explore our top-rated locations voted by travelers like you.
            </p>
          </div>
          <div className="hidden md:block">
            <Button asChild variant="ghost" className="group text-primary">
              <Link href="/destinations">
                View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="w-full">
            <Link href="/destinations">View All Destinations</Link>
          </Button>
        </div>
      </section>

      {/* Promotional Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-8 md:p-16 text-primary-foreground relative overflow-hidden">
            {/* Decor */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
                Plan Your Dream Trip Now!
              </h2>
              <p className="text-lg text-primary-foreground/90 mb-8 leading-relaxed">
                Get exclusive deals on flights and hotels when you book through MyTravel. 
                Sign up today to unlock member-only prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" variant="secondary" className="font-semibold text-secondary-foreground">
                  <Link href="/booking">Start Planning</Link>
                </Button>
                
                <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Link href="/login">Create Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">
          What Travelers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-card p-8 rounded-2xl shadow-sm border border-border relative">
              <Quote className="absolute top-6 left-6 h-8 w-8 text-primary/20" />
              <p className="text-muted-foreground italic mb-6 relative z-10 pt-4">
                "{t.content}"
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold mr-3">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{t.name}</h4>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
