import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Clock, Plane, Hotel, Car } from "lucide-react";

export default function AdminBookings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Bookings Management</h1>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          <p className="text-muted-foreground">
            Manage and track all travel bookings on the platform.
          </p>
        </div>
      </div>

      {/* Placeholder Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">New bookings</p>
          </CardContent>
        </Card>
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Preview</CardTitle>
          <CardDescription>
            This module will be available in a future update
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold">Planned Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  View and manage all bookings in one place
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Filter by status, date, and destination
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Approve or reject pending bookings
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Send notifications to customers
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Export booking reports
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Booking Types</h3>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 rounded-lg border p-3 opacity-60">
                  <Plane className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Flight Bookings</div>
                    <div className="text-sm text-muted-foreground">Manage flight reservations</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3 opacity-60">
                  <Hotel className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Hotel Bookings</div>
                    <div className="text-sm text-muted-foreground">Manage accommodation reservations</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3 opacity-60">
                  <Car className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="font-medium">Car Rentals</div>
                    <div className="text-sm text-muted-foreground">Manage vehicle rentals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
