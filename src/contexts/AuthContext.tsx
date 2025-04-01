
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole, UserStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { login as authLogin, logout as authLogout, getCurrentUser } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { Session } from "@supabase/supabase-js";

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
    
    // First, set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user profile only if not already done in login function
          if (!user) {
            try {
              // Get the user profile
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error || !data) {
                console.error("Failed to fetch user profile after auth state change:", error);
                return;
              }
              
              const userProfile: User = {
                id: session.user.id,
                email: data.email,
                role: data.role as UserRole,
                status: data.status as UserStatus,
                start_date: data.start_date,
                end_date: data.end_date
              };
              
              setUser(userProfile);
              localStorage.setItem("websauce_user", JSON.stringify(userProfile));
              localStorage.setItem("websauce_session", JSON.stringify(session));
            } catch (error) {
              console.error("Error fetching user profile:", error);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setUser(null);
          localStorage.removeItem("websauce_user");
          localStorage.removeItem("websauce_session");
        }
      }
    );
    
    // Then check current session
    const checkSession = async () => {
      try {
        // First check local storage for user info
        const storedUser = getCurrentUser();
        if (storedUser) {
          console.log("User found in local storage:", storedUser.id);
          setUser(storedUser);
        }
        
        // Verify with Supabase if we have a valid session
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          console.log("Valid session found:", data.session.user.id);
          
          if (!storedUser) {
            // If we have a session but no stored user, fetch profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
              
            if (profileData) {
              const userProfile: User = {
                id: data.session.user.id,
                email: profileData.email,
                role: profileData.role as UserRole,
                status: profileData.status as UserStatus,
                start_date: profileData.start_date,
                end_date: profileData.end_date
              };
              
              setUser(userProfile);
              localStorage.setItem("websauce_user", JSON.stringify(userProfile));
              localStorage.setItem("websauce_session", JSON.stringify(data.session));
            }
          }
        } else if (storedUser) {
          // If we have no valid session but have a stored user, clear it
          console.log("No valid session but user in storage, clearing");
          setUser(null);
          localStorage.removeItem("websauce_user");
          localStorage.removeItem("websauce_session");
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
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
