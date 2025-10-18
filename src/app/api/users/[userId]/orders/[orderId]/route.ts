import { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { ErrorResponse } from '@/lib/handlers';
import { getUserOrder, GetOrderResponse } from '@/lib/handlers';

export async function GET(
	request: NextRequest,
	{ params }: { params: { userId: string; orderId: string } }
): Promise<NextResponse<GetOrderResponse> | NextResponse<ErrorResponse>> {
	const { userId, orderId } = params;

	if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(orderId)) {
		return NextResponse.json(
			{ error: 'WRONG_PARAMS', message: 'Invalid user ID or order ID.' },
			{ status: 400 }
		);
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

