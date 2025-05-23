import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";

interface User {
  id: number;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  subscriptionStatus: 'trial' | 'active' | 'expired' | null;
  trialEndsAt: Date | null;
  profilePicture?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (user: any) => Promise<void>;
  logout: () => void;
  createAdminUser: () => Promise<User>;
  updateProfilePicture: (profilePicture: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  createAdminUser: async () => { throw new Error('Not implemented'); },
  updateProfilePicture: async () => { throw new Error('Not implemented'); },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Initialize from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Convert trialEndsAt string back to Date object if it exists
      if (parsedUser.trialEndsAt) {
        parsedUser.trialEndsAt = new Date(parsedUser.trialEndsAt);
      }
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Basic validation - both fields must have values
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      // Email validation
      if (!email.includes('@') || email.length < 5) {
        throw new Error("Please enter a valid email address");
      }
      
      // Password validation
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      
      // Demo credentials check - in production this would be a server request
      const validCredentials = [
        { email: "user@example.com", password: "password123" },
        { email: "demo@businessplatform.com", password: "demo123" },
        // Special bypass account with active subscription (no trial)
        { email: "premium@businessplatform.com", password: "premium2024" }
      ];
      
      const isValidUser = validCredentials.some(
        cred => cred.email === email && cred.password === password
      );
      
      if (!isValidUser) {
        throw new Error("Invalid email or password");
      }
      
      // Check if this is the premium bypass account
      const isPremiumUser = email === "premium@businessplatform.com";
      
      // Login successful - create user object
      await new Promise(resolve => setTimeout(resolve, 800)); // Small delay for UX
      
      let mockUser: User;
      
      if (isPremiumUser) {
        // Create premium user with active subscription (no trial)
        mockUser = {
          id: 2,
          name: "Premium User",
          email,
          subscriptionStatus: 'active', // Already paid
          trialEndsAt: null, // No trial period
        };
      } else {
        // Create regular user with trial subscription
        mockUser = {
          id: 1,
          name: email.split('@')[0],
          email,
          subscriptionStatus: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        };
      }
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      setLocation("/");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: any) => {
    setIsLoading(true);
    try {
      // Mock signup - would be a real API call in production
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a mock user with trial subscription
      const mockUser: User = {
        id: Date.now(),
        name: userData.fullName,
        email: userData.email,
        subscriptionStatus: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      setLocation("/");
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setLocation("/login");
  };
  
  const createAdminUser = async (): Promise<User> => {
    setIsLoading(true);
    try {
      // Create admin user with enhanced permissions
      const adminUser: User = {
        id: 999,
        name: "Admin",
        email: "d9174207593@gmail.com", // Specified admin email
        role: "admin",
        subscriptionStatus: "active", // Admins always have active subscription
        trialEndsAt: null, // No trial period for admin
      };
      
      setUser(adminUser);
      localStorage.setItem("user", JSON.stringify(adminUser));
      setLocation("/");
      return adminUser;
    } catch (error) {
      console.error("Admin creation error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateProfilePicture = async (profilePicture: string): Promise<void> => {
    if (!user) {
      throw new Error("No user logged in");
    }

    try {
      // In a real application, this would be an API call to the server
      // For now, we'll update the user locally and in localStorage
      const updatedUser: User = {
        ...user,
        profilePicture
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error updating profile picture:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        createAdminUser,
        updateProfilePicture
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};