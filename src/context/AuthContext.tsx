import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AccountType } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    email: string;
    full_name: string;
    phone?: string;
    city?: string;
    account_type: AccountType;
    business_name?: string;
    business_address?: string;
    cnic?: string;
    visiting_card_url?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  switchDemoUser: (type: 'guest' | 'individual' | 'dealer' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  updateProfile: async () => {},
  switchDemoUser: () => {},
});

const STORAGE_KEY = 'sellsolar_current_user';
const USERS_STORAGE_KEY = 'sellsolar_all_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USERS;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default to the first dealer or guest
    return INITIAL_USERS[1]; // default as verified dealer Tariq for rich interactive demo
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const signIn = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    // Simulate brief network delay
    await new Promise((r) => setTimeout(r, 300));
    
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setUser(existing);
      setLoading(false);
      return { success: true };
    }

    // Auto create basic user if doesn't exist
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      full_name: email.split('@')[0].replace(/[._]/g, ' '),
      account_type: 'individual',
      created_at: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    setLoading(false);
    return { success: true };
  };

  const signUp = async (data: {
    email: string;
    full_name: string;
    phone?: string;
    city?: string;
    account_type: AccountType;
    business_name?: string;
    business_address?: string;
    cnic?: string;
    visiting_card_url?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      setUser(existing);
      setLoading(false);
      return { success: true };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      city: data.city || 'Lahore',
      account_type: data.account_type,
      business_name: data.business_name,
      business_address: data.business_address,
      cnic: data.cnic,
      visiting_card_url: data.visiting_card_url,
      is_verified_dealer: data.account_type === 'dealer', // auto verified for demo preview
      created_at: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    setLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
  };

  const switchDemoUser = (type: 'guest' | 'individual' | 'dealer' | 'admin') => {
    if (type === 'guest') {
      setUser(null);
    } else if (type === 'individual') {
      const u = users.find((x) => x.account_type === 'individual' && !x.is_admin) || INITIAL_USERS[3];
      setUser(u);
    } else if (type === 'dealer') {
      const u = users.find((x) => x.account_type === 'dealer') || INITIAL_USERS[1];
      setUser(u);
    } else if (type === 'admin') {
      const u = users.find((x) => x.is_admin) || INITIAL_USERS[0];
      setUser(u);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
