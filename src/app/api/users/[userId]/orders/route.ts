import { Types } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { ErrorResponse } from '@/lib/handlers';
import { getUserOrders, GetOrdersResponse } from '@/lib/handlers';
import { createOrderFromCart } from '@/lib/handlers';
import {getSession} from '@/lib/auth';

export async function GET(
	request: NextRequest,
	{ params }: { params: { userId: string } }
): Promise<NextResponse<GetOrdersResponse> | NextResponse<ErrorResponse>> {
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
	const { userId } = params;

	if (!Types.ObjectId.isValid(userId)) {
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

	const result = await getUserOrders(userId);
	if (!result) {
		return NextResponse.json(
			{ error: 'NOT_FOUND', message: 'User not found.' },
			{ status: 404 }
		);
	}

	return NextResponse.json(result, { status: 200 });
}

	export async function POST(
		request: NextRequest,
		{ params }: { params: { userId: string } }
	): Promise<NextResponse<{ _id: string }> | NextResponse<ErrorResponse>> {
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
		const { userId } = params;

		if (!Types.ObjectId.isValid(userId)) {
			return NextResponse.json(
				{ error: 'WRONG_PARAMS', message: 'Invalid user ID.' },
				{ status: 400 }
			);
		}

		let body: { address?: string; cardHolder?: string; cardNumber?: string };
		try {
			body = await request.json();
		} catch {
			return NextResponse.json(
				{ error: 'WRONG_BODY', message: 'Invalid or missing JSON body.' },
				{ status: 400 }
			);
		}

		const result = await createOrderFromCart(userId, {
			address: body.address || '',
			cardHolder: body.cardHolder || '',
			cardNumber: body.cardNumber || '',
		});

		if (session.userId.toString() !== params.userId) {
			return NextResponse.json(
				{
					error: 'NOT_AUTHORIZED',
					message: 'Unauthorized access.',
				},
				{ status: 403 }
			);
		}

		if (!result.ok) {
			if (result.reason === 'not-found') {
				return NextResponse.json(
					{ error: 'NOT_FOUND', message: 'User not found.' },
					{ status: 404 }
				);
			}
			const message =
				result.reason === 'empty-cart'
					? 'Cart is empty.'
					: 'Invalid request body.';
			return NextResponse.json(
				{ error: 'WRONG_BODY', message },
				{ status: 400 }
			);
		}

		const orderId = result.orderId.toString();
		const location = `/api/users/${userId}/orders/${orderId}`;
		return NextResponse.json(
			{ _id: orderId },
			{ status: 201, headers: { Location: location } }
		);
	}

