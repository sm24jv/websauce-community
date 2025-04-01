import { User, UserRole, UserStatus } from "@/types";
import { FirebaseUtils } from '@/integrations/firebase';
import { FirebaseError } from 'firebase/app';

// Helper to convert Firebase error codes to user-friendly messages
const getFirebaseAuthErrorMessage = (error: any): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'This email address is already in use.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      // Add more cases as needed
      default:
        console.error("Unhandled Firebase Auth Error:", error);
        return 'An unexpected authentication error occurred.';
    }
  }
  console.error("Non-Firebase Auth Error:", error);
  return 'An unexpected error occurred.';
};

export const login = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    console.log("Attempting Firebase login with:", email);
    const firebaseUser = await FirebaseUtils.signIn(email, password);
    console.log("Firebase login successful, fetching profile for:", firebaseUser.uid);

    const userProfile = await FirebaseUtils.getUserProfile(firebaseUser.uid);

    if (!userProfile) {
      console.error("User profile not found after login for UID:", firebaseUser.uid);
      // Attempt to sign out the user as their profile doesn't exist
      await FirebaseUtils.signOut();
      localStorage.removeItem("websauce_user");
      return { user: null, error: "User profile not found. Please contact support." };
    }

    // Check user status and membership validity
    if (userProfile.status !== "active") {
      await FirebaseUtils.signOut();
      localStorage.removeItem("websauce_user");
      return { user: null, error: "Your account is not active. Please contact an administrator." };
    }
    const now = new Date();
    const startDate = new Date(userProfile.start_date);
    const endDate = new Date(userProfile.end_date);
    if (now < startDate || now > endDate) {
      await FirebaseUtils.signOut();
      localStorage.removeItem("websauce_user");
      return { user: null, error: "Your membership is not active for the current date." };
    }

    localStorage.setItem("websauce_user", JSON.stringify(userProfile));
    console.log("Full login successful:", userProfile);
    return { user: userProfile, error: null };

  } catch (error) {
    console.error("Firebase login error:", error);
    const errorMessage = getFirebaseAuthErrorMessage(error);
    return { user: null, error: errorMessage };
  }
};

export const logout = async (): Promise<void> => {
  try {
    console.log("Logging out user via Firebase");
    await FirebaseUtils.signOut();
  } catch (error) {
    console.error("Firebase logout error:", error);
    // Even if Firebase logout fails, clear local storage
  } finally {
    localStorage.removeItem("websauce_user");
    // Remove session if it was stored previously (though less critical now)
    localStorage.removeItem("websauce_session");
  }
};

// Keep this function as is for synchronous checks where needed,
// but AuthContext will be the source of truth for the current user session.
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem("websauce_user");
  return userJson ? JSON.parse(userJson) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser(); // Or rely on AuthContext state if preferred
};

export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser(); // Or rely on AuthContext state
  return user ? user.role === role : false;
};

export const requestPasswordReset = async (email: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    console.log("Requesting Firebase password reset for:", email);
    await FirebaseUtils.resetPassword(email);
    return { success: true, error: null };
  } catch (error) {
    console.error("Firebase password reset request error:", error);
    const errorMessage = getFirebaseAuthErrorMessage(error);
    return { success: false, error: errorMessage };
  }
};

// This function handles UPDATING the password for an already authenticated user
// The flow after clicking the reset link is handled by Firebase automatically
export const updatePassword = async (password: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    console.log("Updating Firebase user password");
    await FirebaseUtils.updatePassword(password);
    return { success: true, error: null };
  } catch (error) {
    console.error("Firebase password update error:", error);
    const errorMessage = getFirebaseAuthErrorMessage(error);
    return { success: false, error: errorMessage };
  }
};

export const createUser = async (email: string, password: string, userData: Omit<User, 'id' | 'email'>): Promise<User | null> => {
  let firebaseUserUid: string | null = null;
  try {
    console.log("Creating Firebase user:", email);
    const firebaseUser = await FirebaseUtils.createUser(email, password);
    firebaseUserUid = firebaseUser.uid;
    console.log("Firebase user created:", firebaseUserUid);

    console.log("Creating user profile in Firestore:", firebaseUserUid);
    const profileData = { email, ...userData }; // Add email to the profile data
    await FirebaseUtils.createUserProfile(firebaseUserUid, profileData);
    console.log("Firestore profile created successfully");

    // Return the full user object
    const newUser: User = {
      id: firebaseUserUid,
      email: email,
      role: userData.role,
      status: userData.status,
      start_date: userData.start_date,
      end_date: userData.end_date
    };
    return newUser;

  } catch (error) {
    console.error("Error in createUser:", error);
    // Optional: Clean up - If Firestore profile creation fails, maybe delete the Auth user?
    // This adds complexity (error handling for cleanup) and might not be desired.
    // if (firebaseUserUid) {
    //   console.warn("Attempting to clean up partially created user:", firebaseUserUid);
    //   // Need a deleteUser function in FirebaseUtils (using Admin SDK ideally, or client-side delete if absolutely necessary)
    // }
    const errorMessage = getFirebaseAuthErrorMessage(error);
    // Propagate the specific error message
    throw new Error(errorMessage);
  }
};
