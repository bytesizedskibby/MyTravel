import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plane, Hotel, Map as MapIcon, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");

  if (items.length === 0 && !success) {
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

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    // Mock Payment Logic
    setTimeout(() => {
      // Remove spaces for validation
      const cleanCardNumber = cardNumber.replace(/\s/g, "");

      if (cleanCardNumber === "4242424242424242") {
        // Success Scenario
        setSuccess(true);
        clearCart();
        toast({
          title: "Payment Successful!",
          description: "Your booking has been confirmed. Check your email for the itinerary.",
        });
      } else if (cleanCardNumber === "4000000000000000") {
        // Failure Scenario
        setError("Card declined. Please try a different payment method.");
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: "Your card was declined by the bank.",
        });
      } else {
        // Default Success for other numbers (or make it fail, but let's be nice for testing unless specific fail card used)
        // Actually, let's make it fail if not the success card to force using the test card
        if (cleanCardNumber.startsWith("42")) {
             setSuccess(true);
             clearCart();
        } else {
             setError("Invalid card number for testing. Use 4242 4242 4242 4242 for success.");
        }
      }
      setIsProcessing(false);
    }, 2000);
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
        <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-full mb-6">
          <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
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
              <CardDescription>Enter your payment information to complete the booking.</CardDescription>
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
                
                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>

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
                  {isProcessing ? "Processing..." : `Pay $${total}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
