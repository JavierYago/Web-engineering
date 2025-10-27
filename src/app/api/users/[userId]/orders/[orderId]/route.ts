import { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { ErrorResponse } from '@/lib/handlers';
import { getUserOrder, GetOrderResponse } from '@/lib/handlers';
import {getSession} from '@/lib/auth';

export async function GET(
	request: NextRequest,
	{ params }: { params: { userId: string; orderId: string } }
): Promise<NextResponse<GetOrderResponse> | NextResponse<ErrorResponse>> {
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
	const { userId, orderId } = params;

	if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(orderId)) {
		return NextResponse.json(
			{ error: 'WRONG_PARAMS', message: 'Invalid user ID or order ID.' },
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

	const order = await getUserOrder(userId, orderId);
	if (!order) {
		return NextResponse.json(
			{ error: 'NOT_FOUND', message: 'User or order not found.' },
			{ status: 404 }
		);
	}

	return NextResponse.json(order, { status: 200 });
}

