import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile, saveUserProfile } from '../services/firestoreService';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    pass: string,
    name: string,
    phone: string,
    role?: UserRole
  ) => Promise<void>;
  signInAsGuest: () => Promise<User>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Known admin emails from project configuration
const ADMIN_EMAILS = ['faresmeriem62@gmail.com', 'admin@smashart-hydra.dz'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (user: User | null) => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        // If email matches designated admin, ensure admin role
        if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
          profile.role = 'admin';
        }
        setUserProfile(profile);
      } else {
        // Create initial profile for user
        const isEmailAdmin = !!(user.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || (user.isAnonymous ? 'Client Invité' : 'Client'),
          phone: '',
          role: isEmailAdmin ? 'admin' : 'customer',
          createdAt: new Date().toISOString(),
        };
        await saveUserProfile(user.uid, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Could not fetch user profile:', err);
      // Fallback
      const isEmailAdmin = !!(user.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
      setUserProfile({
        uid: user.uid,
        email: user.email || '',
        name: user.isAnonymous ? 'Client Invité' : 'Client',
        phone: '',
        role: isEmailAdmin ? 'admin' : 'customer',
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await fetchProfile(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    await fetchProfile(credential.user);
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    name: string,
    phone: string,
    requestedRole: UserRole = 'customer'
  ) => {
    const isEmailAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    const finalRole: UserRole = isEmailAdmin ? 'admin' : requestedRole;

    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const profile: UserProfile = {
      uid: cred.user.uid,
      email,
      name,
      phone,
      role: finalRole,
      createdAt: new Date().toISOString(),
    };
    await saveUserProfile(cred.user.uid, profile);
    setUserProfile(profile);
  };

  const signInAsGuest = async (): Promise<User> => {
    if (currentUser) return currentUser;
    const cred = await signInAnonymously(auth);
    await fetchProfile(cred.user);
    return cred.user;
  };

  const logOut = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser);
    }
  };

  const isAdmin =
    userProfile?.role === 'admin' ||
    !!(currentUser?.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase()));

  const role: UserRole = isAdmin ? 'admin' : 'customer';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role,
        isAdmin,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        logOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
