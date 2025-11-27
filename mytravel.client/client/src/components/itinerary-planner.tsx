import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { GripVertical, Clock, Plus, Trash2, MapPin, Calendar, Hourglass, Route, Wallet, Timer, Plane, Utensils, Home, Camera, Sparkles, Check, ChevronRight, Download, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DestinationCombobox } from "@/components/ui/destination-combobox";
import { getDestinationById } from "@/lib/destinations";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import jsPDF from "jspdf";

interface ItineraryItem {
  id: string;
  title: string;
  type: "Place" | "Activity" | "Accommodation" | "Food";
  duration: string;
  travelTime: string;
  location: string;
  cost: number;
}

const typeIcons = {
  Activity: Camera,
  Place: MapPin,
  Food: Utensils,
  Accommodation: Home,
};

const typeColors = {
  Activity: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  Accommodation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  Place: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
};

const activityTypes = [
  { value: 'Activity', label: 'Activity', icon: Camera, color: 'blue', description: 'Tours, experiences, adventures' },
  { value: 'Place', label: 'Place', icon: MapPin, color: 'green', description: 'Landmarks, attractions, sights' },
  { value: 'Food', label: 'Food', icon: Utensils, color: 'orange', description: 'Restaurants, cafes, dining' },
  { value: 'Accommodation', label: 'Stay', icon: Home, color: 'purple', description: 'Hotels, hostels, rentals' },
] as const;

const quickDurations = ['30m', '1h', '1.5h', '2h', '3h', '4h'];
const quickTravelTimes = ['5m', '10m', '15m', '20m', '30m', '45m'];

function SortableItem({ item, onDelete, index }: { item: ItineraryItem; onDelete: (id: string) => void; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const TypeIcon = typeIcons[item.type];

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group flex items-start gap-4 p-5 bg-background rounded-xl border-2 transition-all duration-200 mb-4 ${
        isDragging 
          ? 'border-primary shadow-xl scale-[1.02] z-50' 
          : 'border-border hover:border-primary/40 hover:shadow-md'
      }`}
    >
      {/* Order number and drag handle */}
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center">
          {index + 1}
        </div>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary p-1 rounded hover:bg-muted transition-colors">
          <GripVertical className="h-5 w-5" />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
          <h4 className="font-semibold text-foreground text-lg leading-tight">{item.title}</h4>
          <Badge variant="outline" className={`${typeColors[item.type]} flex items-center gap-1.5 px-2.5 py-1`}>
            <TypeIcon className="h-3 w-3" />
            {item.type}
          </Badge>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full" title="Duration">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground font-medium">{item.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full" title="Travel time to reach here">
            <Route className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-700 dark:text-amber-300 font-medium">{item.travelTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{item.location}</span>
          </div>
        </div>
        
        {/* Cost badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full font-semibold text-sm">
          <Wallet className="h-3.5 w-3.5" />
          MYR {item.cost.toLocaleString()}
        </div>
      </div>
      
      {/* Delete button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 shrink-0"
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
  const [isExporting, setIsExporting] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ItineraryItem> & { locationId?: string }>({
    type: "Activity",
    cost: 0
  });
  
  const itineraryRef = useRef<HTMLDivElement>(null);

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
  
  // Parse time strings and calculate totals
  const parseTimeToMinutes = (timeStr: string): number => {
    const hours = timeStr.match(/(\d+)\s*h/i);
    const minutes = timeStr.match(/(\d+)\s*m/i);
    return (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
  };
  
  const formatMinutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };
  
  const { totalTravelTime, totalActivityTime } = useMemo(() => {
    const travelMinutes = items.reduce((acc, item) => acc + parseTimeToMinutes(item.travelTime), 0);
    const activityMinutes = items.reduce((acc, item) => acc + parseTimeToMinutes(item.duration), 0);
    return {
      totalTravelTime: formatMinutesToTime(travelMinutes),
      totalActivityTime: formatMinutesToTime(activityMinutes),
      totalTravelMinutes: travelMinutes,
      totalActivityMinutes: activityMinutes,
      totalMinutes: travelMinutes + activityMinutes,
    };
  }, [items]);

  const handleExportPDF = async () => {
    if (!itineraryRef.current || items.length === 0) return;
    
    setIsExporting(true);
    
    try {
      // Generate PDF content manually instead of using html2canvas
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;
      
      // Title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('My Travel Itinerary', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Summary line
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100);
      const summaryText = `${items.length} Activities | ${new Set(items.map(i => i.location)).size} Locations | Total: ${formatMinutesToTime(parseTimeToMinutes(totalActivityTime) + parseTimeToMinutes(totalTravelTime))}`;
      pdf.text(summaryText, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Divider line
      pdf.setDrawColor(200);
      pdf.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;
      
      // Activities
      pdf.setTextColor(0);
      items.forEach((item, index) => {
        // Check if we need a new page
        if (yPos > 260) {
          pdf.addPage();
          yPos = 20;
        }
        
        // Activity number and title
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${item.title}`, 20, yPos);
        yPos += 7;
        
        // Type badge
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100);
        pdf.text(`Type: ${item.type}`, 25, yPos);
        yPos += 5;
        
        // Details row
        pdf.text(`Duration: ${item.duration}  |  Travel Time: ${item.travelTime}  |  Location: ${item.location}`, 25, yPos);
        yPos += 5;
        
        // Cost
        pdf.setTextColor(34, 139, 34); // Green color
        pdf.text(`Cost: MYR ${item.cost.toLocaleString()}`, 25, yPos);
        pdf.setTextColor(0);
        yPos += 12;
      });
      
      // Final summary section
      yPos += 5;
      pdf.setDrawColor(200);
      pdf.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Trip Summary', 20, yPos);
      yPos += 8;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Activity Time: ${totalActivityTime}`, 25, yPos);
      yPos += 6;
      pdf.text(`Travel Time: ${totalTravelTime}`, 25, yPos);
      yPos += 6;
      pdf.text(`Total Duration: ${formatMinutesToTime(parseTimeToMinutes(totalActivityTime) + parseTimeToMinutes(totalTravelTime))}`, 25, yPos);
      yPos += 8;
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(34, 139, 34);
      pdf.text(`Total Estimated Cost: MYR ${totalCost.toLocaleString()}`, 25, yPos);
      
      // Footer
      pdf.setTextColor(150);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 285, { align: 'center' });
      
      pdf.save('my-travel-itinerary.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 backdrop-blur p-6 rounded-2xl border">
        <div>
          <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Your Itinerary
          </h2>
          <p className="text-muted-foreground mt-1">Drag and drop to reorder your plan. Changes are saved automatically.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105">
              <Plus className="mr-2 h-5 w-5" /> Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-primary/5 to-transparent">
              <DialogTitle className="font-serif text-2xl flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                Add New Activity
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Fill in the details to add a new stop to your itinerary
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddItem} className="px-6 pb-6 space-y-6">
              {/* Activity Type Selection - Visual Cards */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">What type of activity?</Label>
                <div className="grid grid-cols-4 gap-2">
                  {activityTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = newItem.type === type.value;
                    return (
                      <TooltipProvider key={type.value}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setNewItem({...newItem, type: type.value as any})}
                              className={`relative p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                                isSelected 
                                  ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20 shadow-md scale-[1.02]` 
                                  : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                </div>
                              )}
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                isSelected 
                                  ? `bg-${type.color}-100 dark:bg-${type.color}-900/40` 
                                  : 'bg-muted'
                              }`}>
                                <Icon className={`h-5 w-5 ${isSelected ? `text-${type.color}-600 dark:text-${type.color}-400` : 'text-muted-foreground'}`} />
                              </div>
                              <span className={`text-xs font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {type.label}
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            {type.description}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>

              {/* Activity Title with character count */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="title" className="text-sm font-medium">Activity Title</Label>
                  <span className="text-xs text-muted-foreground">{(newItem.title || '').length}/50</span>
                </div>
                <Input 
                  id="title" 
                  placeholder="e.g., Visit the Eiffel Tower, Dinner at local restaurant" 
                  value={newItem.title || ""}
                  onChange={e => setNewItem({...newItem, title: e.target.value.slice(0, 50)})}
                  className="h-11"
                  autoFocus
                  required
                />
              </div>
              
              {/* Duration with Quick Select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Duration
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {quickDurations.map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setNewItem({...newItem, duration: dur})}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        newItem.duration === dur 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
                <Input 
                  id="duration" 
                  placeholder="Or enter custom (e.g. 2h 30m)"
                  value={newItem.duration || ""}
                  onChange={e => setNewItem({...newItem, duration: e.target.value})}
                  className="h-10"
                />
              </div>

              {/* Travel Time with Quick Select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Route className="h-4 w-4 text-amber-500" />
                  Travel Time
                  <span className="text-xs text-muted-foreground font-normal">(to reach this location)</span>
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {quickTravelTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setNewItem({...newItem, travelTime: time})}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        newItem.travelTime === time 
                          ? 'bg-amber-500 text-white border-amber-500' 
                          : 'border-border hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <Input 
                  id="travelTime" 
                  placeholder="Or enter custom travel time"
                  value={newItem.travelTime || ""}
                  onChange={e => setNewItem({...newItem, travelTime: e.target.value})}
                  className="h-10"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Location
                </Label>
                <DestinationCombobox 
                  value={newItem.locationId || ""}
                  onValueChange={(value) => setNewItem({...newItem, locationId: value})}
                  placeholder="Search for a destination..."
                />
              </div>

              {/* Estimated Cost */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-green-600" />
                  Estimated Cost
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">MYR</span>
                  <Input 
                    id="cost" 
                    type="number" 
                    className="pl-14 h-11 text-lg font-semibold" 
                    placeholder="0" 
                    min="0"
                    value={newItem.cost || ""}
                    onChange={e => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              {/* Preview Card */}
              {newItem.title && (
                <div className="bg-muted/30 rounded-xl p-4 border border-dashed">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Preview</p>
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      newItem.type === 'Activity' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      newItem.type === 'Food' ? 'bg-orange-100 dark:bg-orange-900/30' :
                      newItem.type === 'Accommodation' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      {newItem.type === 'Activity' && <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                      {newItem.type === 'Food' && <Utensils className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
                      {newItem.type === 'Accommodation' && <Home className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                      {newItem.type === 'Place' && <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{newItem.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {newItem.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {newItem.duration}</span>}
                        {newItem.travelTime && <span className="flex items-center gap-1 text-amber-600"><Route className="h-3 w-3" /> {newItem.travelTime}</span>}
                        {(newItem.cost ?? 0) > 0 && <span className="flex items-center gap-1 text-green-600"><Wallet className="h-3 w-3" /> MYR {newItem.cost}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setNewItem({ type: "Activity", cost: 0 });
                  }}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={!newItem.title || !newItem.duration}
                  className="min-w-[140px] shadow-md"
                >
                  Add to Itinerary
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Itinerary List */}
        <Card ref={itineraryRef} className="lg:col-span-2 border-2 shadow-lg bg-card/50 backdrop-blur min-h-[450px]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-muted-foreground">
                {items.length > 0 ? `${items.length} ${items.length === 1 ? 'Activity' : 'Activities'} Planned` : 'No Activities Yet'}
              </CardTitle>
              {items.length > 0 && (
                <Badge variant="secondary" className="font-normal">
                  <Timer className="h-3 w-3 mr-1" />
                  Total: {formatMinutesToTime(parseTimeToMinutes(totalActivityTime) + parseTimeToMinutes(totalTravelTime))}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-4">
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
                  <div className="space-y-1">
                    {items.map((item, index) => (
                      <SortableItem key={item.id} item={item} onDelete={handleDelete} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-4 bg-muted/20">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Plane className="h-10 w-10 text-primary/60" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-lg text-foreground">Start planning your adventure</p>
                      <p className="text-sm max-w-xs">Add activities, food stops, and accommodations to create your perfect itinerary.</p>
                    </div>
                    <Button variant="default" size="lg" onClick={() => setIsAddDialogOpen(true)} className="mt-2">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Activity
                    </Button>
                  </div>
                )}
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="h-fit sticky top-24 shadow-xl border-2 overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 pb-4">
            <CardTitle className="font-serif flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-primary" /> Trip Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{items.length}</p>
                <p className="text-xs text-muted-foreground">Activities</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{new Set(items.map(i => i.location)).size}</p>
                <p className="text-xs text-muted-foreground">Locations</p>
              </div>
            </div>
            
            <Separator />
            
            {/* Time Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                Time Breakdown
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Activity Time
                  </span>
                  <span className="font-semibold text-foreground">{totalActivityTime}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Route className="h-3.5 w-3.5" />
                    Travel Time
                  </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{totalTravelTime}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-sm bg-primary/5 -mx-1 px-3 py-2 rounded-lg">
                  <span className="font-medium text-foreground">Total Duration</span>
                  <span className="font-bold text-primary text-base">
                    {formatMinutesToTime(parseTimeToMinutes(totalActivityTime) + parseTimeToMinutes(totalTravelTime))}
                  </span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Cost Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                Estimated Budget
              </h4>
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Total Cost</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">MYR</span>
                  <span className="text-3xl font-bold text-green-700 dark:text-green-300">{totalCost.toLocaleString()}</span>
                </div>
              </div>
              
              {items.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Avg. MYR {Math.round(totalCost / items.length).toLocaleString()} per activity
                </p>
              )}
            </div>
            
            <div className="pt-2 space-y-2">
              <Button 
                className="w-full shadow-md hover:shadow-lg transition-all duration-300" 
                size="lg"
                onClick={handleExportPDF}
                disabled={isExporting || items.length === 0}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Save & Export as PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
