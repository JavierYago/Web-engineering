import { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { ErrorResponse, getUserCart, CartResponse } from '@/lib/handlers';
import {getSession} from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse<CartResponse> | NextResponse<ErrorResponse>> {
  const session = await getSession();
  if (!session?.userId) {
  return NextResponse.json(
    {
      error: 'NOT_AUTHENTICATED',
      message: 'Authentication required.',
    },
    { status: 401 }
  )
}
  if (!Types.ObjectId.isValid(params.userId)) {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Invalid user ID.' },
      { status: 400 }
    );
  }
  
  if (session.userId.toString() !== params.userId) {
  return NextResponse.json(
    {
      error: 'NOT_AUTHORIZED',
      message: 'Unauthorized access.',
    },
    { status: 403 }
  )
}

  const cart = await getUserCart(params.userId);
  if (!cart) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'User not found.' },
      { status: 404 }
    );
  }
  return NextResponse.json(cart);
}