export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server-side
  if (process.server) return;

  const token = localStorage.getItem("token");
  
  // If no token, redirect to login
  if (!token) {
    return navigateTo("/login");
  }

  try {
    // Make direct API call to check admin status
    const response = await $fetch<{
      username: string;
      email: string;
      isAdmin: boolean;
      isGoogle: boolean;
      [key: string]: any;
    }>('http://localhost:8080/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Admin middleware - User profile:', response);
    
    // Check if user is admin
    if (!response.isAdmin) {
      console.log('User is not admin, redirecting to home');
      return navigateTo("/");
    }
    
    console.log('Admin access granted');
  } catch (error) {
    console.error('Admin middleware error:', error);
    
    // If 401, redirect to login
    if (error.data?.statusCode === 401 || error.response?.status === 401) {
      return navigateTo("/login");
    }
    
    // For other errors, redirect to home
    return navigateTo("/");
  }
});