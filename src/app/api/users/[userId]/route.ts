import { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { updateCartItem, CartResponse, ErrorResponse } from '@/lib/handlers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string; productId: string } }
): Promise<NextResponse<{ cartItems: CartResponse['cartItems'] }> | NextResponse<ErrorResponse>> {
  const { userId, productId } = params;

  // Validación de params
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(productId)) {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Invalid user ID or product ID.' },
      { status: 400 }
    );
  }

  // Leer body JSON
  let body: { qty?: unknown };
  try {
    body = (await request.json()) as { qty?: unknown };
  } catch {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Body must be JSON with qty.' },
      { status: 400 }
    );
  }

  const qty = Number(body?.qty);
  if (!Number.isFinite(qty) || qty < 1) {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'qty must be a number >= 1.' },
      { status: 400 }
    );
  }

  const result = await updateCartItem(userId, productId, qty);
  if (!result) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'User or product not found.' },
      { status: 404 }
    );
  }

  if (result.created) {
    const headers = new Headers();
    headers.append('Location', `/api/users/${userId}/cart/${productId}`);
    return NextResponse.json({ cartItems: result.cartItems }, { status: 201, headers });
  }

  return NextResponse.json({ cartItems: result.cartItems }, { status: 200 });
}