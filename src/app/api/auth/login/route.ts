import { NextResponse } from 'next/server';
import connectDB from '@/lib/monogdb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        {
          message: 'Validation error',
          error: 'Email is required',
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        {
          message: 'Validation error',
          error: 'Password is required',
        },
        { status: 400 }
      );
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return NextResponse.json(
        {
          message: 'Authentication failed',
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          message: 'Authentication failed',
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

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
        message: 'Login successful',
        data: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during login:', error);

    return NextResponse.json(
      {
        message: 'Error during login',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

