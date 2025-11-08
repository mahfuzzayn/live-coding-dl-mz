import { NextResponse } from 'next/server';
import connectDB from '@/lib/monogdb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        {
          message: 'Validation error',
          error: 'Name is required and must be a non-empty string',
        },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        {
          message: 'Validation error',
          error: 'Valid email is required',
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        {
          message: 'Validation error',
          error: 'Password must be at least 6 characters long',
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        {
          message: 'User already exists',
          error: 'An account with this email already exists',
        },
        { status: 409 }
      );
    }

    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Return user data (without password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    };

    return NextResponse.json(
      {
        message: 'User created successfully',
        data: userData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);

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

    // Handle duplicate key error
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        {
          message: 'User already exists',
          error: 'An account with this email already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: 'Error creating user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

