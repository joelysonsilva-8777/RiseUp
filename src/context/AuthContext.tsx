import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebase/firebase";

type UserProfile = {
  fullName?: string;
  accountType?: "Empresa" | "Usuário";
  disabilityType?: string;
  preferredActivity?: string;
  email?: string;
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  displayName: string;
  firstName: string;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getFirstName = (name: string) => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "";
  }

  return trimmedName.split(/\s+/)[0];
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const profileSnapshot = await getDoc(doc(firestore, "users", currentUser.uid));
        setProfile(profileSnapshot.exists() ? (profileSnapshot.data() as UserProfile) : null);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const displayName =
    profile?.fullName ?? user?.displayName ?? user?.email?.split("@")[0] ?? "";
  const firstName = getFirstName(displayName);

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        displayName,
        firstName,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};