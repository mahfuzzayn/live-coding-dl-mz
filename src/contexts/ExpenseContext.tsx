"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import type { Expense } from "@/types";

interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  addExpense: (expense: Omit<Expense, "_id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  fetchExpenses: () => Promise<void>;
  filteredExpenses: Expense[];
  filterByCategory: (category: string | null) => void;
  filterByMonth: (month: string | null) => void;
  selectedCategory: string | null;
  selectedMonth: string | null;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Fetch expenses when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchExpenses();
    } else {
      setExpenses([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchExpenses = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/expenses", {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch expenses");
      }

      setExpenses(result.data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch expenses"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (
    expense: Omit<Expense, "_id" | "userId" | "createdAt" | "updatedAt">
  ) => {
    if (!isAuthenticated) {
      toast.error("Please login to add expenses");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...expense,
          date: typeof expense.date === "string" ? expense.date : expense.date.toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create expense");
      }

      await fetchExpenses();
      toast.success("Expense added successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpense = async (id: string, expense: Partial<Expense>) => {
    if (!isAuthenticated) {
      toast.error("Please login to update expenses");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...expense,
          date: expense.date
            ? typeof expense.date === "string"
              ? expense.date
              : expense.date.toISOString()
            : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update expense");
      }

      await fetchExpenses();
      toast.success("Expense updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to delete expenses");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete expense");
      }

      await fetchExpenses();
      toast.success("Expense deleted successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const filterByCategory = (category: string | null) => {
    setSelectedCategory(category);
  };

  const filterByMonth = (month: string | null) => {
    setSelectedMonth(month);
  };

  // Calculate filtered expenses
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, "0")}`;

    const categoryMatch = !selectedCategory || expense.category === selectedCategory;
    const monthMatch = !selectedMonth || expenseMonth === selectedMonth;

    return categoryMatch && monthMatch;
  });

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
        addExpense,
        updateExpense,
        deleteExpense,
        fetchExpenses,
        filteredExpenses,
        filterByCategory,
        filterByMonth,
        selectedCategory,
        selectedMonth,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
}

