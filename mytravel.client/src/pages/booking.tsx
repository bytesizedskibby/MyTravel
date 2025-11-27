import { BookingForm } from "@/components/booking-form";
import mapImage from "@assets/generated_images/stylized_illustrated_world_map.png";

export default function Booking() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-4">Ready for Adventure?</h1>
            <p className="text-muted-foreground text-lg">
              Book everything you need for your trip in one place. Flights, hotels, and tours with real-time confirmation.
            </p>
          </div>
          
          <BookingForm />
          
          <div className="bg-accent/20 p-6 rounded-lg border border-accent/50">
            <h4 className="font-bold text-foreground mb-2">Why book with us?</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Best price guarantee</li>
              <li>24/7 customer support</li>
              <li>Free cancellation on most hotels</li>
              <li>Secure payment processing</li>
            </ul>
          </div>
        </div>

        <div className="hidden lg:block sticky top-24">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
            <img src={mapImage} alt="World Map" className="w-full h-auto object-cover bg-muted" />
            <div className="p-4 bg-card">
              <h3 className="font-serif font-bold text-lg">Interactive Map</h3>
              <p className="text-sm text-muted-foreground">Explore destinations and visualize your route.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
