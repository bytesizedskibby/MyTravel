import { BookingForm } from "@/components/booking-form";
import { TripSummary } from "@/components/trip-summary";

export default function Booking() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
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

        <div className="lg:col-span-1">
          <TripSummary />
        </div>
      </div>
    </div>
  );
}
