import { redirect } from 'next/navigation'
import { getUser, getUserOrders } from '@/lib/handlers'
import { getSession } from '@/lib/auth'
import Link from 'next/link'

export default async function Profile() {
  const session = await getSession()
  if (!session) redirect('/auth/signin')

  const user = await getUser(session.userId)
  const ordersData = await getUserOrders(session.userId)

  if (!user) return <div>Error loading user data</div>

  return (
    <div className='mx-auto max-w-4xl'>
      <h1 className='text-3xl font-bold text-gray-900 mb-6'>User Profile</h1>

      <div className='bg-white shadow overflow-hidden sm:rounded-lg mb-8'>
        <div className='px-4 py-5 sm:px-6'>
          <h3 className='text-lg leading-6 font-medium text-gray-900'>Personal Information</h3>
        </div>
        <div className='border-t border-gray-200'>
          <dl>
            <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Full name</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>{user.name} {user.surname}</dd>
            </div>
            <div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Email address</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>{user.email}</dd>
            </div>
            <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Address</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>{user.address}</dd>
            </div>
             <div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
              <dt className='text-sm font-medium text-gray-500'>Birthdate</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                {new Date(user.birthdate).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <h2 className='text-2xl font-bold text-gray-900 mb-4'>My Orders</h2>
      {!ordersData || ordersData.orders.length === 0 ? (
        <p className='text-gray-500'>You have no orders yet.</p>
      ) : (
        <div className='bg-white shadow overflow-hidden sm:rounded-md'>
          <ul className='divide-y divide-gray-200'>
            {ordersData.orders.map((order) => (
              <li key={order._id.toString()}>
                <Link href={`/orders/${order._id.toString()}`} className='block hover:bg-gray-50'>
                  <div className='px-4 py-4 sm:px-6'>
                    <div className='flex items-center justify-between'>
                      <p className='text-sm font-medium text-indigo-600 truncate'>
                        Order ID: {order._id.toString()}
                      </p>
                      <div className='ml-2 flex-shrink-0 flex'>
                        <p className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                          Completed
                        </p>
                      </div>
                    </div>
                    <div className='mt-2 sm:flex sm:justify-between'>
                      <div className='sm:flex'>
                        <p className='flex items-center text-sm text-gray-500'>
                          Placed on {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}