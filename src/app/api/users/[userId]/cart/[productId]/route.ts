import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { ErrorResponse, updateCartItem, deleteCartItem, CartResponse } from '@/lib/handlers';
import {getSession} from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string; productId: string } }
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

  const { userId, productId } = params;

  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Invalid user ID or product ID.' },
      { status: 400 }
    );
  }

  let body: { qty?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Body must be JSON with qty.' },
      { status: 400 }
    );
  }

  const qty = body?.qty;
  if (typeof qty !== 'number' || !Number.isFinite(qty) || qty < 1) {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Number of items must be greater than 0.' },
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

  const result = await updateCartItem(userId, productId, qty);

  if (!result) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'User not found or product not found.' },
      { status: 404 }
    );
  }

  const headers = new Headers();
  if (result.created) {
    headers.set('Location', `/api/users/${userId}/cart/${productId}`);
  }

  return NextResponse.json(
    { cartItems: result.cartItems },
    { status: result.created ? 201 : 200, headers }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string; productId: string } }
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
  const { userId, productId } = params;

  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Invalid user ID or product ID.' },
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

  const result = await deleteCartItem(userId, productId);
  if (!result) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'User not found or product not found.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ cartItems: result.cartItems }, { status: 200 });
}
