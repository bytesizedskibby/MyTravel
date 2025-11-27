import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Globe, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false); // true if code sent
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ email: registerEmail, password: registerPassword });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    try {
      await apiRequest("POST", "/api/forgotPassword", { email: forgotEmail });
      toast({ title: "Code sent", description: "Check your email (or server console) for the reset code." });
      setIsResetting(true);
    } catch (error: any) {
      toast({ 
        title: "Request failed", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotLoading(true);
    try {
      await apiRequest("POST", "/api/resetPassword", { email: forgotEmail, resetCode, newPassword });
      toast({ title: "Password reset", description: "You can now login with your new password." });
      setIsResetting(false);
      setActiveTab("login");
      setLoginEmail(forgotEmail);
    } catch (error: any) {
      toast({ 
        title: "Reset failed", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Welcome to MyTravel
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to access personalized travel deals.
          </p>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      required 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button 
                        type="button" 
                        onClick={() => setActiveTab("forgot")}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input 
                      id="reg-email" 
                      type="email" 
                      placeholder="you@example.com" 
                      required 
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input 
                      id="reg-password" 
                      type="password" 
                      required 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Account
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="forgot">
                 {!isResetting ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-medium">Reset Password</h3>
                        <p className="text-sm text-muted-foreground">Enter your email to receive a reset code.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <Input 
                          id="forgot-email" 
                          type="email" 
                          placeholder="you@example.com" 
                          required 
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full" size="lg" disabled={isForgotLoading}>
                        {isForgotLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send Reset Code
                      </Button>
                      <div className="text-center mt-2">
                        <button type="button" onClick={() => setActiveTab("login")} className="text-sm text-primary hover:underline">
                          Back to Login
                        </button>
                      </div>
                    </form>
                 ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-medium">Set New Password</h3>
                        <p className="text-sm text-muted-foreground">Enter the code sent to {forgotEmail}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reset-code">Reset Code</Label>
                        <Input 
                          id="reset-code" 
                          type="text" 
                          required 
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input 
                          id="new-password" 
                          type="password" 
                          required 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full" size="lg" disabled={isForgotLoading}>
                        {isForgotLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Reset Password
                      </Button>
                      <div className="text-center mt-2">
                        <button type="button" onClick={() => setIsResetting(false)} className="text-sm text-primary hover:underline">
                          Back
                        </button>
                      </div>
                    </form>
                 )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
