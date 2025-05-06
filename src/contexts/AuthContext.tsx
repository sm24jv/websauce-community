import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { login as authLogin, logout as authLogout } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { firebaseAuth, FirebaseUtils } from "@/integrations/firebase";
import { User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: User | null;       // Application User type
  firebaseUser: FirebaseUser | null; // Firebase User type
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // Application user profile
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null); // Firebase auth user
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthProvider initializing: Setting up Firebase auth listener...");
    setLoading(true);

    const unsubscribe = firebaseAuth.onAuthStateChanged(async (fbUser) => {
      console.log("Firebase Auth State Changed. Firebase User:", fbUser?.uid);
      setFirebaseUser(fbUser); // Set the firebase user object

      if (fbUser) {
        try {
          // Firebase user is logged in, fetch application profile
          console.log("Fetching user profile from Firestore for UID:", fbUser.uid);
          const userProfile = await FirebaseUtils.getUserProfile(fbUser.uid);
          console.log("Firestore Profile Received:", userProfile);

          if (userProfile) {
            // Check status (applies to all)
            if (userProfile.status !== "active") {
              console.warn("User account is not active:", userProfile.id);
              toast({ title: "Account inactief", description: "Je account is niet actief. Neem contact op met een beheerder.", variant: "destructive" });
              await authLogout(); // Sign out user from Firebase and clear local storage
              setUser(null);
            } else {
              // Check dates ONLY if not admin
              let datesValid = true; // Assume valid for admin
              if (userProfile.role !== 'admin') {
                 if (!userProfile.start_date || !userProfile.end_date) {
                     console.warn("User missing required start/end dates:", userProfile.id);
                     toast({ title: "Profielfout", description: "Lidmaatschapsdatuminformatie ontbreekt. Neem contact op met support.", variant: "destructive" });
                     datesValid = false;
                 } else {
                    const now = new Date();
                    const startDate = new Date(userProfile.start_date);
                    const endDate = new Date(userProfile.end_date);
                    if (now < startDate || now > endDate) {
                      console.warn("User membership is not valid for today:", userProfile.id);
                      toast({ title: "Lidmaatschap ongeldig", description: "Je lidmaatschap is niet actief voor de huidige datum.", variant: "destructive" });
                      datesValid = false;
                    }
                 }
              }

              if (datesValid) {
                  console.log("Setting application user:", userProfile.id);
                  setUser(userProfile);
                  localStorage.setItem("websauce_user", JSON.stringify(userProfile));
              } else {
                  // Dates invalid for non-admin, log out
                  await authLogout();
                  setUser(null);
              }
            }
          } else {
            console.warn("User profile not found in Firestore for logged-in Firebase user:", fbUser.uid);
            // Optional: Sign out the user if their profile is missing?
            // await authLogout();
            // toast({ title: "Profielfout", description: "Kon gebruikersprofiel niet laden. Neem contact op met support.", variant: "destructive" });
            setUser(null); // Ensure app user is null if profile is missing
            localStorage.removeItem("websauce_user");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
          localStorage.removeItem("websauce_user");
          // Consider logging out the firebase user as well if profile fetch fails critically
          // await authLogout();
        }
      } else {
        // Firebase user is logged out
        console.log("Firebase user is logged out. Clearing application user state.");
        setUser(null);
        localStorage.removeItem("websauce_user");
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("AuthProvider cleanup: Unsubscribing Firebase auth listener.");
      unsubscribe();
    };
  }, []); // Run only once on mount

  const login = async (email: string, password: string) => {
    // setLoading(true); // Let the listener handle true loading state based on auth changes
    try {
      // authLogin handles Firebase sign-in AND profile fetching/validation
      const { user: loggedInUser, error } = await authLogin(email, password);

      if (error) {
        // Toast the specific error from authLogin
        toast({
          title: "Inloggen mislukt",
          description: error,
          variant: "destructive",
        });
        // IMPORTANT: Re-throw the error so the calling component knows it failed
        throw new Error(error);
      } else if (loggedInUser) {
        // User state is set by the onAuthStateChanged listener,
        // we just show a success message here.
        toast({
          title: "Succesvol ingelogd",
          description: `Welkom terug, ${loggedInUser.email}!`,
        });
        // Successful login, no error to throw
      }
      // If no user and no error (shouldn't happen with current authLogin), treat as error
      else {
        const fallbackError = "Inloggen mislukt: Onbekende fout.";
         toast({
          title: "Inloggen mislukt",
          description: fallbackError,
          variant: "destructive",
        });
        throw new Error(fallbackError);
      }

    } catch (error: any) {
      // Catch errors from authLogin or unexpected errors
      console.error("Login error in context handler:", error);
      // Ensure the error is propagated
      throw error; // Re-throw the original error or the new Error created above

    } finally {
      // The onAuthStateChanged listener is responsible for setting loading to false
      // after authentication state is confirmed and profile (if any) is fetched.
      // Do NOT set loading false here.
    }
  };

  const logout = async () => {
    console.log("Initiating logout from context...");
    // No need to setLoading(true) here, listener will handle state changes
    try {
      await authLogout(); // This calls Firebase signOut and clears local storage
      // The onAuthStateChanged listener will automatically set user and firebaseUser to null
      toast({
        title: "Uitgelogd",
        description: "Je bent succesvol uitgelogd.",
      });
      console.log("Logout successful via context.");
    } catch (error) {
      console.error("Logout error in context:", error);
      toast({
        title: "Fout bij uitloggen",
        description: "Er was een probleem met uitloggen.",
        variant: "destructive",
      });
      // Ensure local state is cleared even if Firebase logout fails
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem("websauce_user");
    }
    // No finally setLoading(false) needed, listener handles it
  };

  // Provide both user (profile) and firebaseUser (auth object) if needed
  const value = { user, firebaseUser, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth moet binnen een AuthProvider worden gebruikt");
  }
  return context;
};
