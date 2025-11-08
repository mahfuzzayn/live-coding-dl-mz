import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export interface AuthRequest extends NextRequest {
  user?: JWTPayload;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function verifyAuth(request: NextRequest): JWTPayload {
  const token = getTokenFromRequest(request);

  if (!token) {
    throw new Error('No token provided');
  }

  return verifyToken(token);
}

