
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types";

export const login = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      return { user: null, error: error.message };
    }
    
    if (!data.user) {
      return { user: null, error: "User not found" };
    }
    
    // Get the user profile from the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError || !profileData) {
      return { user: null, error: "User profile not found" };
    }
    
    // Check if user is active
    if (profileData.status !== "active") {
      return { user: null, error: "Your account is not active. Please contact an administrator." };
    }
    
    // Check if membership is valid
    const now = new Date();
    const startDate = new Date(profileData.start_date);
    const endDate = new Date(profileData.end_date);
    
    if (now < startDate || now > endDate) {
      return { user: null, error: "Your membership is not active for the current date." };
    }
    
    // Build the user object
    const user: User = {
      id: data.user.id,
      email: profileData.email,
      role: profileData.role as UserRole,
      status: profileData.status,
      start_date: profileData.start_date,
      end_date: profileData.end_date
    };
    
    return { user, error: null };
  } catch (error) {
    console.error("Login error:", error);
    return { user: null, error: "An unexpected error occurred during login" };
  }
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
  localStorage.removeItem("websauce_user");
};

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem("websauce_user");
  return userJson ? JSON.parse(userJson) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user ? user.role === role : false;
};

export const requestPasswordReset = async (email: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

export const resetPassword = async (password: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};
