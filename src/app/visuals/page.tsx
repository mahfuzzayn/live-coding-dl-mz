"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useExpense } from "@/contexts/ExpenseContext";
import { useMemo } from "react";
import { format } from "date-fns";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
];

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff8042",
  "#a4de6c",
];

export default function VisualsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    expenses,
    filteredExpenses,
    isLoading: expensesLoading,
    filterByCategory,
    filterByMonth,
    selectedCategory,
    selectedMonth,
  } = useExpense();

  // Calculate category distribution
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    filteredExpenses.forEach((expense) => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Calculate monthly spending
  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, number>();
    filteredExpenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthKey = format(date, "MMM yyyy");
      const current = monthMap.get(monthKey) || 0;
      monthMap.set(monthKey, current + expense.amount);
    });
    return Array.from(monthMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA.getTime() - dateB.getTime();
      });
  }, [filteredExpenses]);

  // Get available months
  const getAvailableMonths = () => {
    const months = new Set<string>();
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.add(month);
    });
    return Array.from(months).sort().reverse();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Transport: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Shopping: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      Bills: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Healthcare: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Education: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      Travel: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[category] || colors.Other;
  };

  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const chartConfig = {
    value: {
      label: "Amount",
    },
  };

  if (authLoading || expensesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background container mx-auto">
      <Navbar />
      <main className="container py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Expense Visualizations</h1>
          <p className="text-muted-foreground mt-2">
            Analyze your spending patterns and track your expenses
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Select
                value={selectedCategory || "all"}
                onValueChange={(value) =>
                  filterByCategory(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedMonth || "all"}
                onValueChange={(value) =>
                  filterByMonth(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {getAvailableMonths().map((month) => {
                    const [year, monthNum] = month.split("-");
                    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                    return (
                      <SelectItem key={month} value={month}>
                        {format(date, "MMMM yyyy")}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {(selectedCategory || selectedMonth) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    filterByCategory(null);
                    filterByMonth(null);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryData.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active categories
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredExpenses.length > 0
                  ? formatCurrency(totalAmount / filteredExpenses.length)
                  : formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per transaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart - Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-sm font-medium">
                                    {payload[0].name}
                                  </span>
                                  <span className="text-sm font-bold">
                                    {formatCurrency(payload[0].value as number)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart - Monthly Spending */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-sm font-medium">
                                    {payload[0].payload.name}
                                  </span>
                                  <span className="text-sm font-bold">
                                    {formatCurrency(payload[0].value as number)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredExpenses.length} expense
              {filteredExpenses.length !== 1 ? "s" : ""} shown
            </p>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-center">
                <div className="text-muted-foreground">
                  {selectedCategory || selectedMonth
                    ? "No expenses match your filters"
                    : "No expenses yet"}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense._id}>
                        <TableCell className="font-medium">
                          {expense.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getCategoryColor(expense.category)}
                          >
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(expense.date), "MMM dd, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

