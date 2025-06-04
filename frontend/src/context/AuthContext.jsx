import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const sessionToken = localStorage.getItem('sessionToken');
    const userDataString = localStorage.getItem('userData');
    
    console.log('AuthProvider useEffect - checking stored session:', {
      hasSessionToken: !!sessionToken,
      hasUserData: !!userDataString,
      sessionToken: sessionToken
    });
    
    if (sessionToken && userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        console.log('Raw user data from localStorage:', userDataString);
        console.log('Parsed user data from localStorage:', userData);
        console.log('SessionToken from localStorage:', sessionToken);
        
        if (userData && userData.userId) {
          // Add the session token from localStorage to user data if it's not already there
          if (!userData.sessionToken) {
            userData.sessionToken = sessionToken;
            console.log('Added sessionToken to user data:', userData);
          }
          
          setUser(userData);
          console.log('Session restored for user:', userData.email, 'with token:', sessionToken);
        } else {
          console.log('Invalid user data structure, missing userId. User data:', userData);
          localStorage.removeItem('sessionToken');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('user');
      }
    } else {
      console.log('No valid session found - sessionToken:', !!sessionToken, 'userData:', !!userDataString);
      if (!sessionToken) console.log('Missing sessionToken');
      if (!userDataString) console.log('Missing user data');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/public/login', { email, password });
      
      if (response.data.userId && response.data.sessionToken) {
        const userData = {
          userId: response.data.userId,
          email: response.data.email,
          userdata: response.data.userdata || {},
          sessionToken: response.data.sessionToken
        };
        console.log('Login successful - storing user data:', userData);
        console.log('Session token from backend:', response.data.sessionToken);
        
        // Clear any existing storage first
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('user');
        
        // Store the exact session token from MongoDB
        localStorage.setItem('sessionToken', response.data.sessionToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        console.log('Data stored in localStorage - sessionToken:', localStorage.getItem('sessionToken'));
        console.log('Data stored in localStorage - userData:', localStorage.getItem('userData'));
        
        setUser(userData);
        
        return { success: true, user: userData };
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/public/register', { 
        email: userData.email, 
        password: userData.password, 
        firstName: userData.firstName, 
        lastName: userData.lastName 
      });
      
      if (response.data.userId && response.data.sessionToken) {
        const newUserData = {
          userId: response.data.userId,
          email: response.data.email,
          userdata: { 
            firstName: userData.firstName, 
            lastName: userData.lastName, 
            displayName: `${userData.firstName} ${userData.lastName}` 
          },
          sessionToken: response.data.sessionToken
        };
        
        console.log('Registration successful - storing user data:', newUserData);
        console.log('Session token from backend:', response.data.sessionToken);
        
        // Store the exact session token from MongoDB
        localStorage.setItem('sessionToken', response.data.sessionToken);
        localStorage.setItem('userData', JSON.stringify(newUserData));
        setUser(newUserData);
        
        return { success: true, user: newUserData };
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    console.log('Logging out - clearing localStorage');
    setUser(null);
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
