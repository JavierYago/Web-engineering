import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { ErrorResponse, updateCartItem, deleteCartItem, CartResponse } from '@/lib/handlers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string; productId: string } }
): Promise<NextResponse<CartResponse> | NextResponse<ErrorResponse>> {
  const { userId, productId } = params;

  // Validate path params
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Invalid user ID or product ID.' },
      { status: 400 }
    );
  }

  // Validate body
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

  const result = await updateCartItem(userId, productId, qty);

  if (!result) {
    // Could be user not found or product not found
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
  const { userId, productId } = params;

  // Validación de params
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Invalid user ID or product ID.' },
      { status: 400 }
    );
  }

  const result = await deleteCartItem(userId, productId);
  if (!result) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'User not found or product not found.' },
      { status: 404 }
    );
  }

  // Siempre 200, aunque el producto no estuviera en el carrito
  return NextResponse.json({ cartItems: result.cartItems }, { status: 200 });
}
