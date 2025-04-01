import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { firebaseAuth } from '@/integrations/firebase';

/**
 * Custom hook to handle Firebase authentication state
 * @returns Current Firebase user and loading state
 */
export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return { user, loading };
} 