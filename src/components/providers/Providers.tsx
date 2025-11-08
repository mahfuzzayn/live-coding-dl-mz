"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ExpenseProvider } from "@/contexts/ExpenseContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ExpenseProvider>
        {children}
      </ExpenseProvider>
    </AuthProvider>
  );
}

