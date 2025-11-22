import { Types } from 'mongoose'
import { notFound, redirect } from 'next/navigation'
import { getUserOrder } from '@/lib/handlers'
import { getSession } from '@/lib/auth'
import Link from 'next/link'

export default async function OrderDetails({
  params,
}: {
  params: { orderId: string }
}) {
  const session = await getSession()
  if (!session) redirect('/auth/signin')

  if (!Types.ObjectId.isValid(params.orderId)) {
    notFound()
  }

  const order = await getUserOrder(session.userId, params.orderId)

  if (!order) {
    notFound()
  }

  const total = order.orderItems.reduce(
    (acc, item) => acc + item.product.price * item.qty,
    0
  )

  return (
    <div className='mx-auto max-w-4xl'>
      <div className='mb-6'>
        <Link href='/profile' className='text-sm text-indigo-600 hover:text-indigo-500'>
          &larr; Back to Profile
        </Link>
      </div>
      
      <h1 className='text-3xl font-bold text-gray-900 mb-2'>Order Details</h1>
      <p className='text-gray-500 mb-8'>Order ID: {order._id.toString()}</p>

      <div className='bg-gray-50 rounded-lg p-6 mb-8'>
         <dl className='grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2'>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Shipping Address</dt>
              <dd className='mt-1 text-sm text-gray-900'>{order.address}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Payment Method</dt>
              <dd className='mt-1 text-sm text-gray-900'>
                Card ending in {order.cardNumber.slice(-4)} (Holder: {order.cardHolder})
              </dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Date Placed</dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {new Date(order.date).toLocaleString()}
              </dd>
            </div>
         </dl>
      </div>

      <div className='mt-8'>
        <h2 className='text-lg font-medium text-gray-900 mb-4'>Items</h2>
        <div className='flow-root'>
          <ul className='-my-6 divide-y divide-gray-200'>
            {order.orderItems.map((item, index) => (
              <li key={index} className='flex py-6'>
                <div className='h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200'>
                   <img
                      src={item.product.img}
                      alt={item.product.name}
                      className='h-full w-full object-cover object-center'
                    />
                </div>
                <div className='ml-4 flex flex-1 flex-col'>
                   <div className='flex justify-between text-base font-medium text-gray-900'>
                      <h3>{item.product.name}</h3>
                      <p>{(item.product.price * item.qty).toFixed(2)} €</p>
                   </div>
                   <p className='mt-1 text-sm text-gray-500'>Qty {item.qty}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className='mt-8 flex justify-end border-t border-gray-200 pt-6'>
           <div className='text-base font-medium text-gray-900'>Total: {total.toFixed(2)} €</div>
        </div>
      </div>
    </div>
  )
}