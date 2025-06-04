// Authentication utility functions
export const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('userData');
    console.log('localStorage user data:', storedUser);
    
    if (!storedUser) {
      console.log('No user data found in localStorage');
      return null;
    }
    
    const user = JSON.parse(storedUser);
    console.log('Parsed user object:', user);
    
    if (!user.userId) {
      console.log('User object missing userId:', user);
      return null;
    }
    
    console.log('Valid user found with userId:', user.userId);
    return user;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

export const getCurrentUserId = () => {
  const user = getCurrentUser();
  const userId = user ? user.userId : null;
  console.log('getCurrentUserId returning:', userId);
  return userId;
};

export const getSessionToken = () => {
  return localStorage.getItem('sessionToken');
};

export const isAuthenticated = () => {
  const user = getCurrentUser();
  const token = getSessionToken();
  return !!(user && token);
};