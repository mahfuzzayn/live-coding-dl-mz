export interface User {
  _id: string;
  name: string;
  email: string;
  token?: string;
}

export interface Expense {
  _id: string;
  title: string;
  category: string;
  amount: number;
  date: Date | string;
  userId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Entertainment"
  | "Healthcare"
  | "Education"
  | "Travel"
  | "Other";

