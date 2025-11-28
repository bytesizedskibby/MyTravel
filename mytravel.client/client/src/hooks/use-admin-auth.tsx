import { createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type AdminLoginData = {
  email: string;
  password: string;
};

type AdminAuthContextType = {
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
  adminLoginMutation: UseMutationResult<{ isAdmin: boolean }, Error, AdminLoginData>;
  adminLogoutMutation: UseMutationResult<void, Error, void>;
};

export const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data,
    error,
    isLoading,
  } = useQuery<{ isAdmin: boolean } | null, Error>({
    queryKey: ["/api/admin/verify"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/verify", { credentials: "include" });
        if (res.status === 401) {
          return null;
        }
        if (!res.ok) {
          throw new Error("Failed to verify admin status");
        }
        return await res.json();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const adminLoginMutation = useMutation({
    mutationFn: async (credentials: AdminLoginData) => {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Admin login failed");
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/admin/verify"], data);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the Admin Dashboard.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Admin Login Failed",
        description: "Invalid admin credentials.",
        variant: "destructive",
      });
    },
  });

  const adminLogoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/verify"], null);
      toast({
        title: "Logged Out",
        description: "You have been logged out of the admin panel.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin: data?.isAdmin ?? false,
        isLoading,
        error,
        adminLoginMutation,
        adminLogoutMutation,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
