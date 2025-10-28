import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Check for stored token on mount
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchProfile(storedToken);
        }
        else {
            console.log('AuthContext: No stored token found');
            setIsLoading(false);
        }
    }, []);
    const fetchProfile = async (authToken) => {
        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
            else {
                // Token is invalid, remove it
                localStorage.removeItem('token');
                setToken(null);
            }
        }
        catch (error) {
            console.error('Failed to fetch profile:', error);
            localStorage.removeItem('token');
            setToken(null);
        }
        finally {
            setIsLoading(false);
        }
    };
    const login = async (email, password) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
        }
        catch (error) {
            console.error('AuthContext: login error', error);
            throw error;
        }
    };
    const signup = async (signupData) => {
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
        }
        catch (error) {
            console.error('AuthContext: signup error', error);
            throw error;
        }
    };
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };
    const updateProfile = async (updates) => {
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
                const error = await response.json();
                throw new Error(error.message || 'Failed to update profile');
            }
            const updatedUser = await response.json();
            setUser(updatedUser);
        }
        catch (error) {
            console.error('AuthContext: updateProfile error', error);
            throw error;
        }
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            token,
            login,
            signup,
            logout,
            updateProfile,
            isLoading,
        }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
