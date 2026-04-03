'use client';

import { useState, useEffect, useCallback } from 'react';

export interface DemoUser {
  email: string;
  name: string;
  redirect: string;
  authenticatedAt: string;
}

const AUTH_KEY = 'nexusos-demo-auth';

export function useSimpleAuth() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DemoUser;
        setUser(parsed);
        setIsAuthenticated(true);
      }
    } catch (e) {
      // Invalid data, clear it
      localStorage.removeItem(AUTH_KEY);
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return { user, isLoading, isAuthenticated, logout };
}

export function getStoredAuth(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      return JSON.parse(stored) as DemoUser;
    }
  } catch (e) {
    // Ignore
  }
  return null;
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
}
