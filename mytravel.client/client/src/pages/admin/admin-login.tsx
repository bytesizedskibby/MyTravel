import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Link } from "wouter";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { isAdmin, adminLoginMutation, isLoading } = useAdminAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAdmin && !isLoading) {
      setLocation("/admin");
    }
  }, [isAdmin, isLoading, setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    adminLoginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          setLocation("/admin");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 border border-primary/30">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter your admin credentials to access the dashboard.
          </p>
        </div>

        <Card className="shadow-2xl border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@mytravel.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={adminLoginMutation.isPending}
              >
                {adminLoginMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" />
                )}
                Access Dashboard
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Main Site
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500">
          This area is restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
}
