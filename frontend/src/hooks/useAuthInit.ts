import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../lib/api';

/**
 * Hook to initialize and validate authentication on app load
 * Handles token refresh and session validation
 */
export function useAuthInit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    token, 
    refreshToken, 
    isAuthenticated,
    isValidating,
    lastValidation,
    login, 
    logout,
    setToken,
    setUser,
    setValidating,
    updateLastValidation
  } = useAuthStore();
  
  const hasInitialized = useRef(false);
  const isValidatingRef = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasInitialized.current || isValidatingRef.current) {
      return;
    }

    const initAuth = async () => {
      console.log('[Auth] Initializing authentication...');
      
      // Skip validation on public routes
      const publicRoutes = ['/login', '/register'];
      if (publicRoutes.includes(location.pathname)) {
        console.log('[Auth] On public route, skipping validation');
        return;
      }

      // If no token, redirect to login
      if (!token) {
        console.log('[Auth] No token found, redirecting to login');
        logout();
        navigate('/login', { replace: true });
        return;
      }

      isValidatingRef.current = true;
      setValidating(true);

      try {
        // Check if we need to validate (every 5 minutes)
        const VALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes
        const needsValidation = !lastValidation || 
          (Date.now() - lastValidation) > VALIDATION_INTERVAL;

        if (!needsValidation && isAuthenticated) {
          console.log('[Auth] Session still valid, skipping validation');
          setValidating(false);
          isValidatingRef.current = false;
          return;
        }

        console.log('[Auth] Validating session...');
        
        // Try to validate current token
        const validation = await authAPI.validateSession();

        if (validation.valid) {
          console.log('[Auth] ✓ Session valid');
          setUser(validation.user);
          updateLastValidation();
          setValidating(false);
          isValidatingRef.current = false;
          return;
        }

        // Token expired or invalid, try to refresh
        console.log('[Auth] Token invalid, attempting refresh...');
        
        if (!refreshToken) {
          console.log('[Auth] No refresh token, logging out');
          logout();
          navigate('/login', { replace: true, state: { from: location } });
          setValidating(false);
          isValidatingRef.current = false;
          return;
        }

        // Attempt token refresh
        try {
          const refreshResponse = await authAPI.refresh(refreshToken);
          const { token: newToken, user } = refreshResponse.data;

          console.log('[Auth] ✓ Token refreshed successfully');
          setToken(newToken);
          setUser(user);
          updateLastValidation();
          
          // Stay on current page
          console.log('[Auth] Continuing on current page:', location.pathname);
        } catch (refreshError) {
          console.error('[Auth] Token refresh failed:', refreshError);
          logout();
          navigate('/login', { replace: true, state: { 
            from: location,
            message: 'Your session has expired. Please log in again.'
          }});
        }
      } catch (error) {
        console.error('[Auth] Validation error:', error);
        logout();
        navigate('/login', { replace: true });
      } finally {
        setValidating(false);
        isValidatingRef.current = false;
      }
    };

    hasInitialized.current = true;
    initAuth();
  }, []);

  // Also validate when user navigates to a new protected route
  useEffect(() => {
    const publicRoutes = ['/login', '/register'];
    
    if (!publicRoutes.includes(location.pathname) && !token) {
      console.log('[Auth] Protected route accessed without token, redirecting');
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [location.pathname, token, navigate]);

  return { isValidating };
}
