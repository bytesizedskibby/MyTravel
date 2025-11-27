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
import Blog from "@/pages/blog";
import Login from "@/pages/login";
import { Layout } from "@/components/layout";

function Router() {
  return (
    <Switch>
      {/* Standalone Pages */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Login} />
      
      {/* App Layout Pages */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/destinations" component={Destinations} />
            <Route path="/destinations/:id" component={DestinationDetails} />
            <Route path="/planner" component={Planner} />
            <Route path="/booking" component={Booking} />
            <Route path="/blog" component={Blog} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
