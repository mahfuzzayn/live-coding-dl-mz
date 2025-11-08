"use client";

import { useAuth } from "@/contexts/AuthContext";
import ManageExpenses from "@/components/modules/expense/ManageExpenses";
import AuthForm from "@/components/auth/AuthForm";
import Navbar from "@/components/layout/Navbar";

const Home = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-muted-foreground font-black text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-cyan-50">
      <Navbar />
      <main className="container py-12 mx-auto px-6">
        <ManageExpenses />
      </main>
    </div>
  );
};

export default Home;
