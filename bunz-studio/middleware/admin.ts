export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server-side
  if (process.server) return;

  const token = localStorage.getItem("token");
  
  // If no token, redirect to login
  if (!token) {
    return navigateTo("/login");
  }

  try {
    // Get user data to check admin status
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
    
    // Check if user is admin
    if (!response.isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. Admin privileges required.'
      });
    }
  } catch (error) {
    console.error('Admin middleware error:', error);
    // If error getting user data or user is not admin, redirect to home
    return navigateTo("/");
  }
});