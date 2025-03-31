
import { User, UserRole } from "@/types";

// Mock authentication functions (replace with Supabase integration later)
export const login = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  // Mock users for demonstration
  const mockUsers: User[] = [
    {
      id: "1",
      email: "admin@websauce.com",
      role: "admin",
      status: "active",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      email: "user@websauce.com",
      role: "user",
      status: "active",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      email: "paused@websauce.com",
      role: "user",
      status: "paused",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      email: "expired@websauce.com",
      role: "user",
      status: "active",
      start_date: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Mock passwords for demonstration (in a real app these would be hashed)
  const validCredentials = [
    { email: "admin@websauce.com", password: "admin123" },
    { email: "user@websauce.com", password: "user123" },
    { email: "paused@websauce.com", password: "paused123" },
    { email: "expired@websauce.com", password: "expired123" },
  ];

  // Check credentials
  const isValidCredential = validCredentials.find(
    (cred) => cred.email === email && cred.password === password
  );

  if (!isValidCredential) {
    return { user: null, error: "Invalid email or password" };
  }

  // Find user
  const user = mockUsers.find((u) => u.email === email);
  
  if (!user) {
    return { user: null, error: "User not found" };
  }

  // Check if user is active
  if (user.status !== "active") {
    return { user: null, error: "Your account is not active. Please contact an administrator." };
  }

  // Check if membership is valid
  const now = new Date();
  const startDate = new Date(user.start_date);
  const endDate = new Date(user.end_date);
  
  if (now < startDate || now > endDate) {
    return { user: null, error: "Your membership is not active for the current date." };
  }

  return { user, error: null };
};

export const logout = (): void => {
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
  // Mock API call for password reset
  return { success: true, error: null };
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; error: string | null }> => {
  // Mock API call for password reset
  return { success: true, error: null };
};
