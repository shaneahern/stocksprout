import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { crossPlatformStorage } from '@stocksprout/shared/storage';

export interface User {
  id: string;
  username?: string | null;
  email: string;
  name: string;
  phone?: string | null;
  profileImageUrl?: string | null;
  bankAccountNumber?: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  isLoading: boolean;
}

interface SignupData {
  username?: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  bankAccountNumber?: string;
  profileImageUrl?: string;
}

interface UpdateProfileData {
  name?: string;
  profileImageUrl?: string;
  bankAccountNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const loadStoredToken = async () => {
      try {
        const storedToken = await crossPlatformStorage.getItem('token');
        
        if (storedToken) {
          setToken(storedToken);
          fetchProfile(storedToken);
        } else {
          console.log('AuthContext: No stored token found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load stored token:', error);
        setIsLoading(false);
      }
    };
    
    loadStoredToken();
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json() as User;
        setUser(userData);
      } else {
        // Token is invalid, remove it
        await crossPlatformStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      await crossPlatformStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          // Support both email and username for login
          email: emailOrUsername,
          username: emailOrUsername,
          password 
        }),
      });

      // Check if response has content before parsing JSON
      const text = await response.text();
      
      if (!text) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}. Server returned empty response.`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse login response:', text);
        throw new Error(`Server error: Invalid response format. ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      await crossPlatformStorage.setItem('token', data.token);
    } catch (error) {
      console.error('AuthContext: login error', error);
      throw error;
    }
  };

  const signup = async (signupData: SignupData) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      // Check if response has content before parsing JSON
      const text = await response.text();
      
      if (!text) {
        throw new Error(`Signup failed: ${response.status} ${response.statusText}. Server returned empty response.`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse signup response:', text);
        throw new Error(`Server error: Invalid response format. ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Signup failed');
      }

      setToken(data.token);
      setUser(data.user);
      await crossPlatformStorage.setItem('token', data.token);
    } catch (error) {
      console.error('AuthContext: signup error', error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await crossPlatformStorage.removeItem('token');
  };

  const updateProfile = async (updates: UpdateProfileData) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json() as { message?: string };
        throw new Error(error.message || 'Failed to update profile');
      }

      const updatedUser = await response.json() as User;
      setUser(updatedUser);
    } catch (error) {
      console.error('AuthContext: updateProfile error', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      signup,
      logout,
      updateProfile,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Legacy exports for backwards compatibility
export type { SignupData as ContributorSignupData };
