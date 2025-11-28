import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Destinations from "@/pages/destinations";
import DestinationDetails from "@/pages/destination-details";
import Planner from "@/pages/planner";
import Booking from "@/pages/booking";
import Checkout from "@/pages/checkout";
import Blog from "@/pages/blog";
import BlogDetail from "@/pages/blog-detail";
import BlogEditor from "@/pages/blog-editor";
import Login from "@/pages/login";
import { Layout } from "@/components/layout";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/context/cart-context";
import { BlogProvider } from "@/context/blog-context";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ProtectedAdminRoute } from "@/components/admin/protected-admin-route";
import AdminLogin from "@/pages/admin/admin-login";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import AdminUsers from "@/pages/admin/admin-users";
import AdminBookings from "@/pages/admin/admin-bookings";
import AdminBlog from "@/pages/admin/admin-blog";
import { usePing } from "@/hooks/use-ping";

function Router() {
  return (
    <Switch>
      {/* Standalone Pages */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Login} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/users">
        {() => (
          <ProtectedAdminRoute>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </ProtectedAdminRoute>
        )}
      </Route>
      <Route path="/admin/bookings">
        {() => (
          <ProtectedAdminRoute>
            <AdminLayout>
              <AdminBookings />
            </AdminLayout>
          </ProtectedAdminRoute>
        )}
      </Route>
      <Route path="/admin/blog">
        {() => (
          <ProtectedAdminRoute>
            <AdminLayout>
              <AdminBlog />
            </AdminLayout>
          </ProtectedAdminRoute>
        )}
      </Route>
      <Route path="/admin">
        {() => (
          <ProtectedAdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedAdminRoute>
        )}
      </Route>
      
      {/* App Layout Pages */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/destinations" component={Destinations} />
            <Route path="/destinations/:id" component={DestinationDetails} />
            <Route path="/planner" component={Planner} />
            <Route path="/booking" component={Booking} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/new" component={BlogEditor} />
            <Route path="/blog/edit/:id" component={BlogEditor} />
            <Route path="/blog/:id" component={BlogDetail} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  // Ping server to track online users
  usePing();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <BlogProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </CartProvider>
          </BlogProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
