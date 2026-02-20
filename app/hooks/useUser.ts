import { useSession, signIn, signOut } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export const useUser = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [loginError, setLoginError] = useState<string | null>(null);

  const user = session?.user || null;

  // // Handle redirect after login
  // useEffect(() => {
  //   if (status === 'authenticated' && user) {
  //     const returnUrl = searchParams.get('returnUrl');
  //     if (returnUrl) {
  //       router.push(returnUrl);
  //     }
  //   }
  // }, [status, user, searchParams, router]);

  // Clear login error when component unmounts or pathname changes
  useEffect(() => {
    setLoginError(null);
  }, [pathname]);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    try {
      setLoginError(null);

      const result = await signIn('users', {
        email,
        password,
        rememberMe,
        redirect: false,
      });

      if (result?.error) {
        setLoginError(result.error);
        return { success: false, error: result.error };
      }

      // Update session to get latest user data
      await update();

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setLoginError(errorMessage);
      console.error('Login error:', error);
      return { success: false, error: errorMessage };
    }
  }, [update]);

  const logout = useCallback(async () => {
    try {
      await signOut({ callbackUrl: '/login' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  const refreshSession = useCallback(async () => {
    try {
      await update();
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  }, []); // Remove update from dependencies to prevent callback recreation loop

  const requireAuth = useCallback((redirectTo = '/login') => {
    if (status === 'unauthenticated') {
      // const returnUrl = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      router.push(redirectTo);
      return false;
    }
    return status === 'authenticated';
  }, [status, router]);

  return {
    user,
    login,
    logout,
    refreshSession,
    requireAuth,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
    loginError,
    session,
    status,
  };
};