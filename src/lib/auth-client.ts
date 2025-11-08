"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface User {
  _id: string;
  name: string;
  email: string;
  token?: string;
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  
  try {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!userStr || !token) return null;
    
    const user = JSON.parse(userStr);
    return { ...user, token };
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const logout = () => {
    clearAuth();
    setUser(null);
    router.refresh();
  };

  return { user, isLoading, logout };
}

