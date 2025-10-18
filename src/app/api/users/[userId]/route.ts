import { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { updateCartItem, CartResponse, ErrorResponse } from '@/lib/handlers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string; productId: string } }
): Promise<
  NextResponse<{ cartItems: CartResponse['cartItems'] }> | NextResponse<ErrorResponse>
> {
  // Validación de params
  if (!Types.ObjectId.isValid(params.userId) || !Types.ObjectId.isValid(params.productId)) {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Invalid user ID or product ID.' },
      { status: 400 }
    );
  }

  // Validación del body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'WRONG_PARAMS', message: 'Invalid JSON body.' },
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

  // Lógica
  const result = await updateCartItem(params.userId, params.productId, qty);
  if (!result) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'User or product not found.' },
      { status: 404 }
    );
  }

  // Respuesta 201 si se creó, 200 si se actualizó
  if (result.created) {
    const headers = new Headers();
    headers.append('Location', `/api/users/${params.userId}/cart/${params.productId}`);
    return NextResponse.json({ cartItems: result.cartItems }, { status: 201, headers });
  }

  return NextResponse.json({ cartItems: result.cartItems }, { status: 200 });
}