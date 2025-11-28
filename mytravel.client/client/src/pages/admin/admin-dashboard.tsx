import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, UserPlus, Activity, TrendingUp, Calendar, CalendarCheck, DollarSign, Clock } from "lucide-react";

type AdminStats = {
  totalUsers: number;
  activeUsersCount: number;
  currentlyOnline: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
};

type BookingStats = {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  bookingsToday: number;
  bookingsThisWeek: number;
  bookingsThisMonth: number;
};

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: bookingStats, isLoading: bookingStatsLoading } = useQuery<BookingStats>({
    queryKey: ["/api/admin/bookings/stats"],
    refetchInterval: 30000,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const userStatCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      description: "All registered users",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Users",
      value: stats?.activeUsersCount ?? 0,
      description: "Users with active accounts",
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Currently Online",
      value: stats?.currentlyOnline ?? 0,
      description: "Users active in last 5 minutes",
      icon: Activity,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "New Today",
      value: stats?.newUsersToday ?? 0,
      description: "Registered today",
      icon: UserPlus,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "New This Week",
      value: stats?.newUsersThisWeek ?? 0,
      description: "Last 7 days",
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "New This Month",
      value: stats?.newUsersThisMonth ?? 0,
      description: "Last 30 days",
      icon: Calendar,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ];

  const bookingStatCards = [
    {
      title: "Total Bookings",
      value: bookingStats?.totalBookings ?? 0,
      description: "All time",
      icon: CalendarCheck,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      isLoading: bookingStatsLoading,
    },
    {
      title: "Pending Bookings",
      value: bookingStats?.pendingBookings ?? 0,
      description: "Awaiting action",
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      isLoading: bookingStatsLoading,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(bookingStats?.totalRevenue ?? 0),
      description: "Confirmed bookings",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      isLoading: bookingStatsLoading,
      isFormatted: true,
    },
    {
      title: "Bookings This Month",
      value: bookingStats?.bookingsThisMonth ?? 0,
      description: "Last 30 days",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      isLoading: bookingStatsLoading,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the MyTravel Admin Dashboard. Here's an overview of your platform.
        </p>
      </div>

      {/* Booking Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Bookings Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {bookingStatCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {stat.isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">
                    {stat.isFormatted ? stat.value : (stat.value as number).toLocaleString()}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Stats Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userStatCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                )}
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <a 
              href="/admin/users" 
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Manage Users</div>
                <div className="text-sm text-muted-foreground">View, search, and manage user accounts</div>
              </div>
            </a>
            <a 
              href="/admin/bookings" 
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <CalendarCheck className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">View Bookings</div>
                <div className="text-sm text-muted-foreground">Manage travel bookings and update statuses</div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Platform health overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Server</span>
              <span className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Authentication</span>
              <span className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Operational
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
