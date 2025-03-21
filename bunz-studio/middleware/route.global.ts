const publicPaths = ['/login', '/register', '/', '/about', '/products', '/complete-profile', '/faqs'];

export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware on server-side
  if (process.server) return;

  const token = localStorage.getItem("token");
  const tokenExpiration = localStorage.getItem("tokenExpiration");

  // Check if the path is public or matches dynamic product route
  const isPublicPath = publicPaths.includes(to.path) || to.path.match(/^\/product\/[^/]+$/);

  // If route is public, allow access
  if (isPublicPath) {
    return;
  }

  // If no token, redirect to login
  if (!token) {
    return navigateTo("/login");
  }

  // Check token expiration
  if (tokenExpiration) {
    const expirationDate = new Date(tokenExpiration);
    const currentDate = new Date();

    // If token is expired, clear storage and redirect to login
    if (currentDate > expirationDate) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");
      return navigateTo("/login");
    }
  }
});
