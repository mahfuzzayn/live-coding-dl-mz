"use client";

import { useAuth } from "@/contexts/AuthContext";
import ManageExpenses from "@/components/modules/expense/ManageExpenses";
import AuthForm from "@/components/auth/AuthForm";
import Navbar from "@/components/layout/Navbar";

const HomePage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background container mx-auto">
      <Navbar />
      <main className="container py-8">
        <div className="mt-8">
          <ManageExpenses />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
