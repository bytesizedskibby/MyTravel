import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import posthog from "posthog-js";
import { useCart } from "@/context/cart-context";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plane, Hotel, Map as MapIcon, CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type UserProfile = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
};

type BookingResponse = {
  id: number;
  message: string;
  totalAmount: number;
  status: string;
};

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [bookingId, setBookingId] = useState<number | null>(null);

  // Form State
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cardError, setCardError] = useState<string | null>(null);

  // Fetch user profile if logged in
  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile", { credentials: "include" });
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
    retry: false,
  });

  const isLoggedIn = !!userProfile;

  // Auto-fill form when user profile loads
  useEffect(() => {
    if (userProfile) {
      if (userProfile.fullName) setName(userProfile.fullName);
      if (userProfile.email) setEmail(userProfile.email);
    }
  }, [userProfile]);

  // Track checkout page view
  useEffect(() => {
    if (items.length > 0) {
      posthog.capture('checkout_viewed', {
        total_items: items.length,
        total_value: total,
        item_types: items.map(i => i.type),
      });
    }
  }, []); // Only fire once on mount

  // Booking mutation
  const bookingMutation = useMutation<BookingResponse, Error, { paymentReference: string }>({
    mutationFn: async ({ paymentReference }) => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          customerEmail: isLoggedIn ? undefined : email,
          customerName: isLoggedIn ? undefined : name,
          paymentReference,
          items: items.map(item => ({
            type: item.type,
            title: item.title,
            details: item.details,
            price: item.price,
            imageUrl: item.image
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create booking");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setBookingId(data.id);
      // Track successful purchase in PostHog
      posthog.capture('purchase_completed', {
        booking_id: data.id,
        total_amount: data.totalAmount,
        total_items: items.length,
        item_types: items.map(i => i.type),
        items: items.map(i => ({ title: i.title, type: i.type, price: i.price })),
      });
      clearCart();
      toast({
        title: "Payment Successful!",
        description: `Booking #${data.id} confirmed. Check your email for the itinerary.`,
      });
    },
    onError: (error) => {
      // Track failed purchase in PostHog
      posthog.capture('purchase_failed', {
        error_message: error.message,
        total_amount: total,
      });
      toast({
        variant: "destructive",
        title: "Booking Error",
        description: error.message || "Payment processed but booking failed. Please contact support.",
      });
    },
  });

  if (items.length === 0 && !bookingMutation.isSuccess) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground">Add some flights, hotels, or tours to get started.</p>
          <Button onClick={() => setLocation("/booking")}>Go to Booking</Button>
        </div>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);

    // Remove spaces for validation
    const cleanCardNumber = cardNumber.replace(/\s/g, "");

    // Simulate card processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock card validation
    if (cleanCardNumber === "4000000000000000") {
      setCardError("Card declined. Please try a different payment method.");
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "Your card was declined by the bank.",
      });
      return;
    }
    
    if (cleanCardNumber !== "4242424242424242" && !cleanCardNumber.startsWith("42")) {
      setCardError("Invalid card number for testing. Use 4242 4242 4242 4242 for success.");
      return;
    }

    // Card is valid, create booking
    const paymentReference = `PAY-${Date.now()}`;
    bookingMutation.mutate({ paymentReference });
  };

  if (bookingMutation.isSuccess) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
        <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-full mb-6">
          <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        {bookingId && (
          <p className="text-lg font-medium text-primary mb-2">Booking Reference: #{bookingId}</p>
        )}
        <p className="text-muted-foreground text-center max-w-md mb-8">
          Thank you for your purchase. Your itinerary and receipt have been sent to your email.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => setLocation("/")} variant="outline">Return Home</Button>
          <Button onClick={() => setLocation("/booking")}>Book Another Trip</Button>
        </div>
      </div>
    );
  }

  const isProcessing = bookingMutation.isPending;
  const error = cardError || (bookingMutation.isError ? bookingMutation.error.message : null);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">
                      {item.type === 'flight' && <Plane className="h-4 w-4 inline mr-1" />}
                      {item.type === 'hotel' && <Hotel className="h-4 w-4 inline mr-1" />}
                      {item.type === 'tour' && <MapIcon className="h-4 w-4 inline mr-1" />}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  <span className="font-medium">${item.price}</span>
                </div>
              ))}
              <Separator className="my-4" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                {isLoggedIn 
                  ? `Booking as ${userProfile?.fullName || userProfile?.email}`
                  : "Enter your payment information to complete the booking."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Show customer info fields only for guests */}
                {!isLoggedIn && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          placeholder="John Doe" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required 
                          disabled={profileLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email"
                          placeholder="john@example.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required 
                          disabled={profileLoading}
                        />
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="card">Card Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="card" 
                      placeholder="0000 0000 0000 0000" 
                      className="pl-9"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Test Card (Success): <span className="font-mono">4242 4242 4242 4242</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Test Card (Fail): <span className="font-mono">4000 0000 0000 0000</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input 
                      id="expiry" 
                      placeholder="MM/YY" 
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input 
                      id="cvc" 
                      placeholder="123" 
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${total}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
