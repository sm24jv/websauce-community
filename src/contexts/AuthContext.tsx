import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole, UserStatus } from "@/types";
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
    console.log("Auth provider initializing");
    
    // Check current session
    const checkSession = async () => {
      try {
        // Check local storage for user info
        const storedUser = getCurrentUser();
        if (storedUser) {
          console.log("User found in local storage:", storedUser.id);
          setUser(storedUser);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Session check error:", error);
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: loggedInUser, error } = await authLogin(email, password);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error,
          variant: "destructive",
        });
        throw new Error(error);
      }
      
      if (loggedInUser) {
        setUser(loggedInUser);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${loggedInUser.email}!`,
        });
      }
    } catch (error) {
      console.error("Login error in context:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "There was a problem logging you out.",
        variant: "destructive",
      });
    }
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
