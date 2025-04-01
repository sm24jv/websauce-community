
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole, UserStatus } from "@/types";

export const login = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    console.log("Attempting login with:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error("Login auth error:", error);
      return { user: null, error: error.message };
    }
    
    if (!data.user) {
      console.error("No user returned after login");
      return { user: null, error: "User not found" };
    }
    
    // Get the user profile from the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError || !profileData) {
      console.error("Profile fetch error:", profileError);
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
      status: profileData.status as UserStatus,
      start_date: profileData.start_date,
      end_date: profileData.end_date
    };
    
    // Store the full session in localStorage for session management
    localStorage.setItem("websauce_session", JSON.stringify(data.session));
    localStorage.setItem("websauce_user", JSON.stringify(user));
    
    console.log("Login successful:", user);
    return { user, error: null };
  } catch (error) {
    console.error("Login error:", error);
    return { user: null, error: "An unexpected error occurred during login" };
  }
};

export const logout = async (): Promise<void> => {
  console.log("Logging out user");
  await supabase.auth.signOut();
  localStorage.removeItem("websauce_user");
  localStorage.removeItem("websauce_session");
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
    console.log("Requesting password reset for:", email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) {
      console.error("Password reset request error:", error);
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
    console.log("Resetting password");
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      console.error("Password reset error:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
};

// Modified to use the client-side signup method
export const createUser = async (email: string, password: string, userData: Omit<User, 'id' | 'email'>): Promise<User | null> => {
  try {
    console.log("Creating user:", email, userData);
    
    // Use signUp instead of admin.createUser (which only works on the server)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: userData.role,
          status: userData.status,
          start_date: userData.start_date,
          end_date: userData.end_date
        }
      }
    });

    if (error || !data.user) {
      console.error("Error creating user:", error);
      return null;
    }

    console.log("User created successfully in auth:", data.user.id);
    
    // Check if the profile was created by the trigger
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching created user profile:", profileError);
      
      // If the trigger didn't create the profile, create it manually
      if (profileError.code === 'PGRST116') { // Record not found
        console.log("Profile not created by trigger, creating manually");
        const { data: manualProfile, error: manualError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            email: email,
            role: userData.role,
            status: userData.status,
            start_date: userData.start_date,
            end_date: userData.end_date
          }])
          .select()
          .single();
          
        if (manualError) {
          console.error("Error creating profile manually:", manualError);
          return null;
        }
        
        return manualProfile ? {
          ...manualProfile,
          role: manualProfile.role as UserRole,
          status: manualProfile.status as UserStatus,
        } : null;
      }
      
      return null;
    }

    return profile ? {
      ...profile,
      role: profile.role as UserRole,
      status: profile.status as UserStatus,
    } : null;
  } catch (error) {
    console.error("Error in createUser:", error);
    return null;
  }
};
