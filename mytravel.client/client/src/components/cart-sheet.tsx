import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plane, Hotel, Map as MapIcon } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useLocation } from "wouter";
import posthog from "posthog-js";

export function CartSheet() {
  const { items, removeItem, total } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    // Track checkout initiated in PostHog
    posthog.capture('checkout_initiated', {
      total_items: items.length,
      total_value: total,
      item_types: items.map(i => i.type),
    });
    setIsOpen(false);
    setLocation("/checkout");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "flight": return <Plane className="h-4 w-4" />;
      case "hotel": return <Hotel className="h-4 w-4" />;
      case "tour": return <MapIcon className="h-4 w-4" />;
      default: return <ShoppingCart className="h-4 w-4" />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Your Trip Cart</SheetTitle>
          <SheetDescription>
            Review your selected flights, hotels, and tours before checkout.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[60vh] mt-4 pr-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg bg-card">
                  <div className="flex gap-3">
                    <div className="mt-1 p-2 bg-muted rounded-full">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.details}</p>
                      <p className="text-sm font-medium mt-1">${item.price}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="mt-auto pt-4">
          <Separator className="my-4" />
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-lg">Total</span>
            <span className="font-bold text-xl">${total}</span>
          </div>
          <SheetFooter>
            <Button 
              className="w-full" 
              size="lg" 
              disabled={items.length === 0}
              onClick={handleCheckout}
            >
              Checkout & Pay
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
