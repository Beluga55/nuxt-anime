import { useAxios } from './useAxios'

export function useAuth() {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const isAdmin = ref(false)
  const isLoading = ref(false)
  const lastTokenCheck = ref(null)
  
  const { createAxiosClient } = useAxios()
  const axiosClient = createAxiosClient()

  // Check if user is authenticated
  const checkAuth = () => {
    if (process.server) return false
    
    const token = localStorage.getItem('token')
    const tokenExpiration = localStorage.getItem('tokenExpiration')
    
    if (!token || !tokenExpiration) {
      clearAuth()
      return false
    }
    
    // Check if token is expired
    const expirationDate = new Date(tokenExpiration)
    const currentDate = new Date()
    
    if (currentDate > expirationDate) {
      clearAuth()
      return false
    }
    
    isAuthenticated.value = true
    return true
  }

  // Clear authentication state
  const clearAuth = () => {
    if (process.server) return
    
    localStorage.removeItem('token')
    localStorage.removeItem('tokenExpiration')
    localStorage.removeItem('userInfo')
    
    user.value = null
    isAuthenticated.value = false
    isAdmin.value = false
    lastTokenCheck.value = null
  }

  // Get current user profile
  const getCurrentUser = async (forceRefresh = false) => {
    if (process.server) return null
    
    // If we have cached user data and it's recent, return it
    if (!forceRefresh && user.value && lastTokenCheck.value) {
      const timeSinceLastCheck = Date.now() - lastTokenCheck.value
      // Use cached data if it's less than 5 minutes old
      if (timeSinceLastCheck < 5 * 60 * 1000) {
        return user.value
      }
    }
    
    if (!checkAuth()) {
      return null
    }
    
    try {
      isLoading.value = true
      const response = await axiosClient.get('/auth/profile')
      console.log(response);
      
      user.value = response.data
      isAdmin.value = response.data.isAdmin || false
      lastTokenCheck.value = Date.now()
      
      // Cache user info in localStorage
      localStorage.setItem('userInfo', JSON.stringify(response.data))
      
      return response.data
    } catch (error) {
      console.error('Failed to get current user:', error)
      
      // If 401, clear auth and redirect
      if (error.response?.status === 401) {
        clearAuth()
        await navigateTo('/login')
      }
      
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Check if user is admin (with caching)
  const checkAdminStatus = async (forceRefresh = false) => {
    if (process.server) return false
    
    // If we have recent admin check, return cached result
    if (!forceRefresh && lastTokenCheck.value) {
      const timeSinceLastCheck = Date.now() - lastTokenCheck.value
      if (timeSinceLastCheck < 5 * 60 * 1000) {
        return isAdmin.value
      }
    }
    
    const userData = await getCurrentUser(forceRefresh)
    return userData?.isAdmin || false
  }

  // Initialize auth state from localStorage
  const initializeAuth = () => {
    if (process.server) return
    
    // Check if authenticated
    if (checkAuth()) {
      // Try to get cached user info
      const cachedUserInfo = localStorage.getItem('userInfo')
      if (cachedUserInfo) {
        try {
          const userData = JSON.parse(cachedUserInfo)
          user.value = userData
          isAdmin.value = userData.isAdmin || false
          lastTokenCheck.value = Date.now()
        } catch (error) {
          console.error('Failed to parse cached user info:', error)
          localStorage.removeItem('userInfo')
        }
      }
    }
  }

  // Login function
  const login = async (credentials) => {
    try {
      isLoading.value = true
      const response = await axiosClient.post('/auth/login', credentials)
      
      if (response.data.token) {
        // Store token and expiration
        localStorage.setItem('token', response.data.token)
        
        // Set expiration (1 hour from now, or 30 days if remember me)
        const expirationDate = new Date()
        if (credentials.rememberMe) {
          expirationDate.setDate(expirationDate.getDate() + 30)
        } else {
          expirationDate.setTime(expirationDate.getTime() + (60 * 60 * 1000))
        }
        localStorage.setItem('tokenExpiration', expirationDate.toISOString())
        
        // Update auth state
        isAuthenticated.value = true
        
        // Get user profile
        await getCurrentUser(true)
        
        return response.data
      }
      
      throw new Error('No token received')
    } catch (error) {
      clearAuth()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint
      await axiosClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      clearAuth()
      await navigateTo('/login')
    }
  }

  // Initialize on composable creation
  if (process.client) {
    initializeAuth()
  }

  return {
    // State
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isAdmin: readonly(isAdmin),
    isLoading: readonly(isLoading),
    
    // Methods
    checkAuth,
    clearAuth,
    getCurrentUser,
    checkAdminStatus,
    login,
    logout,
    initializeAuth
  }
}