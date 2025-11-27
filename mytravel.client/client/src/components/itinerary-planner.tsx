import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GripVertical, Clock, Plus, Trash2, MapPin, Calendar, Hourglass } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DestinationCombobox } from "@/components/ui/destination-combobox";
import { getDestinationById } from "@/lib/destinations";

interface ItineraryItem {
  id: string;
  title: string;
  type: "Place" | "Activity" | "Accommodation" | "Food";
  duration: string;
  travelTime: string;
  location: string;
  cost: number;
}

function SortableItem({ item, onDelete }: { item: ItineraryItem; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="group flex items-center gap-4 p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-all shadow-sm mb-3"
    >
      <div {...attributes} {...listeners} className="cursor-move text-muted-foreground hover:text-primary p-1">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-foreground text-lg">{item.title}</h4>
          <span className={`text-xs font-medium px-2 py-1 rounded-full 
            ${item.type === 'Activity' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
              item.type === 'Food' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 
              item.type === 'Accommodation' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 
              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            }`}>
            {item.type}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center bg-secondary/10 px-2 py-1 rounded" title="Duration">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {item.duration}
          </div>
           <div className="flex items-center bg-secondary/10 px-2 py-1 rounded" title="Estimated Travel Time">
            <Hourglass className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Travel: {item.travelTime}
          </div>
          <div className="flex items-center bg-secondary/10 px-2 py-1 rounded">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {item.location}
          </div>
          <div className="flex items-center font-medium text-foreground">
            <span className="mr-1">MYR</span>
            {item.cost}
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        onClick={() => onDelete(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ItineraryPlanner() {
  const [items, setItems] = useState<ItineraryItem[]>([
    { id: "1", title: "Breakfast at Café de Paris", type: "Food", duration: "1h", travelTime: "15m", location: "Paris, France", cost: 110 },
    { id: "2", title: "Louvre Museum Tour", type: "Activity", duration: "3h", travelTime: "20m", location: "Paris, France", cost: 200 },
    { id: "3", title: "Lunch at River Seine", type: "Food", duration: "1.5h", travelTime: "10m", location: "Paris, France", cost: 260 },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ItineraryItem> & { locationId?: string }>({
    type: "Activity",
    cost: 0
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get location name from destination ID or use the raw location value
    let locationName = newItem.location || "";
    if (newItem.locationId) {
      const destination = getDestinationById(newItem.locationId);
      if (destination) {
        locationName = destination.name;
      }
    }
    
    if (!newItem.title || !newItem.duration || !locationName) return;

    const item: ItineraryItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: newItem.title,
      type: newItem.type as any,
      duration: newItem.duration,
      travelTime: newItem.travelTime || "0m",
      location: locationName,
      cost: Number(newItem.cost) || 0,
    };

    setItems([...items, item]);
    setIsAddDialogOpen(false);
    setNewItem({ type: "Activity", cost: 0 });
  };

  const totalCost = items.reduce((acc, item) => acc + item.cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold">Your Itinerary</h2>
          <p className="text-muted-foreground">Drag and drop to reorder your plan.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg hover:shadow-primary/20 transition-all">
              <Plus className="mr-2 h-4 w-4" /> Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Add New Activity</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Activity Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Visit Museum" 
                  value={newItem.title || ""}
                  onChange={e => setNewItem({...newItem, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={newItem.type} 
                    onValueChange={v => setNewItem({...newItem, type: v as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activity">Activity</SelectItem>
                      <SelectItem value="Place">Place</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Accommodation">Accommodation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input 
                    id="duration" 
                    placeholder="e.g. 2h, 30m"
                    value={newItem.duration || ""}
                    onChange={e => setNewItem({...newItem, duration: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                 <Label htmlFor="travelTime">Est. Travel Time (to get here)</Label>
                 <Input 
                    id="travelTime" 
                    placeholder="e.g. 15m, 1h"
                    value={newItem.travelTime || ""}
                    onChange={e => setNewItem({...newItem, travelTime: e.target.value})}
                  />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <DestinationCombobox 
                  value={newItem.locationId || ""}
                  onValueChange={(value) => setNewItem({...newItem, locationId: value})}
                  placeholder="Select a destination"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Estimated Cost (MYR)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">MYR</span>
                  <Input 
                    id="cost" 
                    type="number" 
                    className="pl-12" 
                    placeholder="0.00" 
                    value={newItem.cost || ""}
                    onChange={e => setNewItem({...newItem, cost: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add to Itinerary</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Itinerary List */}
        <Card className="lg:col-span-2 border-none shadow-md bg-card/50 backdrop-blur min-h-[400px]">
          <CardContent className="p-6">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.length > 0 ? (
                  items.map((item) => (
                    <SortableItem key={item.id} item={item} onDelete={handleDelete} />
                  ))
                ) : (
                  <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">Your itinerary is empty</p>
                      <p className="text-sm">Start adding activities to plan your day!</p>
                    </div>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                      Add First Activity
                    </Button>
                  </div>
                )}
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="h-fit sticky top-24 shadow-lg border-border/60">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="font-serif flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Trip Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Activities</span>
                <span className="font-medium">{items.length} Items</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Destinations</span>
                <span className="font-medium">{new Set(items.map(i => i.location)).size} Locations</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Estimated Total Cost</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-medium text-primary self-start mt-1">MYR</span>
                <span className="text-3xl font-bold text-foreground">{totalCost.toLocaleString()}</span>
              </div>
            </div>
            
            <Button className="w-full shadow-md hover:shadow-lg transition-all" size="lg">
              Save Itinerary
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
