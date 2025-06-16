// Authentication utility functions
export const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('userData');
    
    if (!storedUser) {
      return null;
    }
    
    const user = JSON.parse(storedUser);
    
    if (!user.userId) {
      return null;
    }
    
    return user;
  } catch (error) {
    return null;
  }
};

export const getCurrentUserId = () => {
  const user = getCurrentUser();
  const userId = user ? user.userId : null;
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

export const refreshSharedDashboards = async () => {
  // Placeholder function for shared dashboard refresh
  // This can be expanded later if needed
  return Promise.resolve();
};