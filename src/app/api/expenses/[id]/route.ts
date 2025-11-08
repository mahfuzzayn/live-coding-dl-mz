import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/monogdb';
import Expense from '@/models/Expense';
import { verifyAuth } from '@/lib/auth';

// GET route - Fetch a single expense
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verify authentication
    const user = verifyAuth(request);

    const expense = await Expense.findOne({
      _id: params.id,
      userId: user.userId,
    });

    if (!expense) {
      return NextResponse.json(
        {
          message: 'Expense not found',
          error: 'Expense not found or you do not have permission to access it',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Expense fetched successfully',
        data: expense,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching expense:', error);

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
        message: 'Error fetching expense',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT route - Update an expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verify authentication
    const user = verifyAuth(request);

    const body = await request.json();
    const { title, category, amount, date } = body;

    // Find expense and verify ownership
    const expense = await Expense.findOne({
      _id: params.id,
      userId: user.userId,
    });

    if (!expense) {
      return NextResponse.json(
        {
          message: 'Expense not found',
          error: 'Expense not found or you do not have permission to update it',
        },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json(
          {
            message: 'Validation error',
            error: 'Title must be a non-empty string',
          },
          { status: 400 }
        );
      }
      expense.title = title.trim();
    }

    if (category !== undefined) {
      if (typeof category !== 'string') {
        return NextResponse.json(
          {
            message: 'Validation error',
            error: 'Category must be a string',
          },
          { status: 400 }
        );
      }
      expense.category = category;
    }

    if (amount !== undefined) {
      if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
        return NextResponse.json(
          {
            message: 'Validation error',
            error: 'Amount must be a positive number',
          },
          { status: 400 }
        );
      }
      expense.amount = amount;
    }

    if (date !== undefined) {
      if (!date || isNaN(Date.parse(date))) {
        return NextResponse.json(
          {
            message: 'Validation error',
            error: 'Valid date is required',
          },
          { status: 400 }
        );
      }
      expense.date = new Date(date);
    }

    await expense.save();

    return NextResponse.json(
      {
        message: 'Expense updated successfully',
        data: expense,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating expense:', error);

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
        message: 'Error updating expense',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE route - Delete an expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Verify authentication
    const user = verifyAuth(request);

    const expense = await Expense.findOneAndDelete({
      _id: params.id,
      userId: user.userId,
    });

    if (!expense) {
      return NextResponse.json(
        {
          message: 'Expense not found',
          error: 'Expense not found or you do not have permission to delete it',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Expense deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting expense:', error);

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
        message: 'Error deleting expense',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

