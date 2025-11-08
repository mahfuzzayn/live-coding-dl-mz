import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/monogdb';
import Expense from '@/models/Expense';
import { verifyAuth } from '@/lib/auth';

// GET route - Fetch all expenses for the authenticated user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const user = verifyAuth(request);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query: any = { userId: user.userId };

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        message: 'Expenses fetched successfully',
        data: expenses,
        count: expenses.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching expenses:', error);

    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        {
          message: 'Authentication error',
          error: error.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: 'Error fetching expenses',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST route - Create a new expense
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const user = verifyAuth(request);

    const body = await request.json();
    const { title, category, amount, date } = body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        {
          message: 'Validation error',
          error: 'Title is required and must be a non-empty string',
        },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json(
        {
          message: 'Validation error',
          error: 'Category is required',
        },
        { status: 400 }
      );
    }

    if (
      typeof amount !== 'number' ||
      isNaN(amount) ||
      amount < 0
    ) {
      return NextResponse.json(
        {
          message: 'Validation error',
          error: 'Amount must be a positive number',
        },
        { status: 400 }
      );
    }

    if (!date || isNaN(Date.parse(date))) {
      return NextResponse.json(
        {
          message: 'Validation error',
          error: 'Valid date is required',
        },
        { status: 400 }
      );
    }

    // Create new expense
    const expense = await Expense.create({
      title: title.trim(),
      category,
      amount,
      date: new Date(date),
      userId: user.userId,
    });

    return NextResponse.json(
      {
        message: 'Expense created successfully',
        data: expense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating expense:', error);

    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        {
          message: 'Authentication error',
          error: error.message,
        },
        { status: 401 }
      );
    }

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          message: 'Validation error',
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: 'Error creating expense',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

