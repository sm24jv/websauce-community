import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  sendEmailVerification,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  serverTimestamp,
  DocumentData,
  orderBy
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserRole, UserStatus } from '@/types';

// Define the base URL for action links (use environment variable if possible)
const ACTION_LINK_BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'https://academy.websauce.be';

// Auth functions
export const createUser = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  try {
    // Add ActionCodeSettings for email verification
    const actionCodeSettings = {
        url: `${ACTION_LINK_BASE_URL}/verify-email`, // Redirect to custom page
        handleCodeInApp: true, // Indicates the action will be handled by the app
    };
    await sendEmailVerification(userCredential.user, actionCodeSettings);
    console.log("Verification email sent to:", email, "with settings:", actionCodeSettings);
  } catch (verificationError) {
    // Log the error but don't fail the whole user creation process
    // Maybe the email provider is down, but the user account is still valid
    console.error("Failed to send verification email:", verificationError);
    // Optionally, you could add specific error handling here, like informing the user
  }
  return userCredential.user;
};

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const resetPassword = async (email: string) => {
  const actionCodeSettings = {
      url: `${ACTION_LINK_BASE_URL}/reset-password`, // Redirect to custom page
      handleCodeInApp: true,
  };
  await sendPasswordResetEmail(auth, email, actionCodeSettings);
  console.log("Password reset email sent to:", email, "with settings:", actionCodeSettings);
};

export const updatePassword = async (newPassword: string) => {
  const user = auth.currentUser;
  if (user) {
    await firebaseUpdatePassword(user, newPassword);
  } else {
    throw new Error('No authenticated user');
  }
};

// Firestore functions
export const createUserProfile = async (userId: string, userData: Omit<User, 'id'>) => {
  await setDoc(doc(db, 'users', userId), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      email: data.email,
      role: data.role as UserRole,
      status: data.status as UserStatus,
      start_date: data.start_date,
      end_date: data.end_date,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
  
  return null;
};

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// Firestore collection operations (generic)
export const createDocument = async (collectionName: string, data: any) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const createDocumentWithId = async (collectionName: string, id: string, data: any) => {
  await setDoc(doc(db, collectionName, id), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return id;
};

export const getDocument = async <T extends DocumentData>(collectionName: string, id: string): Promise<(T & { id: string }) | null> => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...(docSnap.data() as T) };
  }
  
  return null;
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteDocument = async (collectionName: string, id: string) => {
  await deleteDoc(doc(db, collectionName, id));
};

export const getCollection = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// New function specifically for fetching users sorted by createdAt descending
export const getUsersSortedByCreationDate = async () => {
  const usersCollection = collection(db, 'users');
  // Add the orderBy clause
  const q = query(usersCollection, orderBy('createdAt', 'desc')); 
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const queryCollection = async (collectionName: string, field: string, value: any) => {
  const q = query(collection(db, collectionName), where(field, '==', value));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}; 