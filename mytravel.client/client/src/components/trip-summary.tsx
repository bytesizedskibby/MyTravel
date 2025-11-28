import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { Plane, Hotel, Map as MapIcon, Trash2, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";

export function TripSummary() {
  const { items, removeItem, total } = useCart();
  const [, setLocation] = useLocation();

  const getIcon = (type: string) => {
    switch (type) {
      case "flight": return <Plane className="h-4 w-4" />;
      case "hotel": return <Hotel className="h-4 w-4" />;
      case "tour": return <MapIcon className="h-4 w-4" />;
      default: return <ShoppingCart className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full sticky top-24 shadow-lg border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Trip Summary
        </CardTitle>
        <CardDescription>Your itinerary so far</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Your trip is empty.</p>
            <p className="text-sm mt-1">Start by searching for flights!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between group">
                <div className="flex gap-3">
                  <div className="mt-1 p-2 bg-muted rounded-full h-fit">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground max-w-[180px]">{item.details}</p>
                    <p className="text-sm font-medium mt-1 text-primary">${item.price}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {items.length > 0 && (
        <>
          <Separator />
          <CardFooter className="flex flex-col gap-4 p-6 bg-primary/5">
            <div className="flex justify-between items-center w-full">
              <span className="font-semibold">Total Estimated</span>
              <span className="font-bold text-xl text-primary">${total}</span>
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setLocation("/checkout")}
            >
              Proceed to Checkout
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
