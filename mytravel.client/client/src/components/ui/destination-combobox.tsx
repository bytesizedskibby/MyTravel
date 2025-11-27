"use client"

import * as React from "react"
import { Check, ChevronsUpDown, MapPin, Plane } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { destinationsList, getPopularDestinations, type Destination } from "@/lib/destinations"

interface DestinationComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  showCode?: boolean
  filterByType?: Destination["type"]
  filterByContinent?: Destination["continent"]
}

export function DestinationCombobox({
  value,
  onValueChange,
  placeholder = "Select destination...",
  className,
  showCode = false,
  filterByType,
  filterByContinent,
}: DestinationComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Filter destinations based on props
  const filteredDestinations = React.useMemo(() => {
    let destinations = destinationsList
    
    if (filterByType) {
      destinations = destinations.filter(d => d.type === filterByType)
    }
    
    if (filterByContinent) {
      destinations = destinations.filter(d => d.continent === filterByContinent)
    }
    
    return destinations
  }, [filterByType, filterByContinent])

  const popularDestinations = React.useMemo(() => {
    return filteredDestinations.filter(d => d.popular)
  }, [filteredDestinations])

  const selectedDestination = React.useMemo(() => {
    return destinationsList.find(d => d.id === value)
  }, [value])

  // Group destinations by continent for better UX
  const groupedDestinations = React.useMemo(() => {
    const groups: Record<string, Destination[]> = {}
    
    filteredDestinations.forEach(dest => {
      if (!groups[dest.continent]) {
        groups[dest.continent] = []
      }
      groups[dest.continent].push(dest)
    })
    
    return groups
  }, [filteredDestinations])

  const handleSelect = (destinationId: string) => {
    const newValue = destinationId === value ? "" : destinationId
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          {selectedDestination ? (
            <span className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{selectedDestination.name}</span>
              {showCode && (
                <span className="text-muted-foreground text-xs">
                  ({selectedDestination.code})
                </span>
              )}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search destinations..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No destination found.</CommandEmpty>
            
            {/* Show popular destinations when not searching */}
            {!searchValue && popularDestinations.length > 0 && (
              <CommandGroup heading="Popular Destinations">
                {popularDestinations.slice(0, 6).map((destination) => (
                  <CommandItem
                    key={destination.id}
                    value={`${destination.name} ${destination.code} ${destination.country}`}
                    onSelect={() => handleSelect(destination.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === destination.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{destination.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {destination.continent} • {destination.code}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {/* Show grouped destinations when searching or scrolling */}
            {Object.entries(groupedDestinations).map(([continent, destinations]) => (
              <CommandGroup key={continent} heading={continent}>
                {destinations.map((destination) => (
                  <CommandItem
                    key={destination.id}
                    value={`${destination.name} ${destination.code} ${destination.country}`}
                    onSelect={() => handleSelect(destination.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === destination.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{destination.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {destination.type} • {destination.code}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Variant for flight search with From/To icons
interface FlightDestinationComboboxProps extends DestinationComboboxProps {
  variant?: "from" | "to"
}

export function FlightDestinationCombobox({
  variant = "from",
  placeholder,
  ...props
}: FlightDestinationComboboxProps) {
  const defaultPlaceholder = variant === "from" ? "Where from?" : "Where to?"
  
  return (
    <DestinationCombobox
      {...props}
      placeholder={placeholder || defaultPlaceholder}
      showCode={true}
    />
  )
}
