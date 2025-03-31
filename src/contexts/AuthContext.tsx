
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { login as authLogin, logout as authLogout, getCurrentUser } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // We'll handle this in the login function
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem("websauce_user");
        }
      }
    );
    
    setLoading(false);
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { user: loggedInUser, error } = await authLogin(email, password);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      });
      setLoading(false);
      throw new Error(error);
    }
    
    if (loggedInUser) {
      localStorage.setItem("websauce_user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${loggedInUser.email}!`,
      });
    }
    
    setLoading(false);
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
