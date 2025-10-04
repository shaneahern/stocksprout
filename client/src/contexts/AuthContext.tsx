import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  profileImageUrl?: string | null;
  bankAccountNumber?: string | null;
}

export interface Contributor {
  id: string;
  email: string;
  phone?: string | null;
  name: string;
  profileImageUrl?: string | null;
  isRegistered: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  contributor: Contributor | null;
  token: string | null;
  contributorToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  contributorSignin: (email: string, password: string) => Promise<void>;
  contributorSignup: (data: ContributorSignupData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  contributorLogout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  isLoading: boolean;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
  name: string;
  bankAccountNumber?: string;
}

interface ContributorSignupData {
  name: string;
  email: string;
  phone?: string;
  password: string;
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
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [contributorToken, setContributorToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored tokens on mount
    const storedToken = localStorage.getItem('token');
    const storedContributorToken = localStorage.getItem('contributorToken');
    const storedContributorData = localStorage.getItem('contributorData');
    
    
    if (storedContributorToken) {
      setContributorToken(storedContributorToken);
      fetchContributorProfile(storedContributorToken);
    } else if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken);
    } else {
      console.log('AuthContext: No stored tokens found');
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContributorProfile = async (authToken: string) => {
    try {
      // For contributors, we need to decode the JWT to get the contributor ID
      // Since we don't have a dedicated profile endpoint for contributors,
      // we'll store the contributor data in localStorage and retrieve it here
      const storedContributorData = localStorage.getItem('contributorData');
      if (storedContributorData) {
        const contributorData = JSON.parse(storedContributorData);
        setContributor(contributorData);
      } else {
        // Token exists but no stored data, remove it
        localStorage.removeItem('contributorToken');
        setContributorToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch contributor profile:', error);
      localStorage.removeItem('contributorToken');
      localStorage.removeItem('contributorData');
      setContributorToken(null);
      setContributor(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error) {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (profileData: UpdateProfileData) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Profile update failed');
      }

      setUser(data);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const contributorSignin = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/contributors/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Contributor signin failed');
      }

      setContributorToken(data.token);
      setContributor(data.contributor);
      localStorage.setItem('contributorToken', data.token);
      localStorage.setItem('contributorData', JSON.stringify(data.contributor));
      
      // Return the contributor data for immediate use
      return data.contributor;
    } catch (error) {
      console.error('AuthContext: contributorSignin error', error);
      throw error;
    }
  };

  const contributorSignup = async (signupData: ContributorSignupData) => {
    try {
      const response = await fetch('/api/contributors/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Contributor signup failed');
      }

      setContributorToken(data.token);
      setContributor(data.contributor);
      localStorage.setItem('contributorToken', data.token);
      localStorage.setItem('contributorData', JSON.stringify(data.contributor));
      
      // Return the contributor data for immediate use
      return data.contributor;
    } catch (error) {
      throw error;
    }
  };

  const contributorLogout = () => {
    setContributor(null);
    setContributorToken(null);
    localStorage.removeItem('contributorToken');
    localStorage.removeItem('contributorData');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      contributor, 
      token, 
      contributorToken, 
      login, 
      contributorSignin, 
      contributorSignup, 
      signup, 
      logout, 
      contributorLogout, 
      updateProfile, 
      isLoading 
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
