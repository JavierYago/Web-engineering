import { redirect } from 'next/navigation'
import { getUserCart } from '@/lib/handlers'
import { getSession } from '@/lib/auth'
import Link from 'next/link'

export default async function Checkout() {
  const session = await getSession()
  if (!session) redirect('/auth/signin')

  const cartData = await getUserCart(session.userId)
  if (!cartData || cartData.cartItems.length === 0) {
    redirect('/cart')
  }

  const total = cartData.cartItems.reduce(
    (acc, item) => acc + item.product.price * item.qty,
    0
  )

  return (
    <div className='mx-auto max-w-3xl'>
      <h1 className='text-3xl font-bold text-gray-900 mb-8'>Checkout</h1>

      {/* Resumen del pedido */}
      <div className='bg-gray-50 p-6 rounded-lg mb-8'>
        <h2 className='text-lg font-medium text-gray-900 mb-4'>Order Summary</h2>
        <ul className='divide-y divide-gray-200'>
          {cartData.cartItems.map((item) => (
            <li key={item.product._id.toString()} className='flex justify-between py-2'>
              <span className='text-gray-700'>{item.product.name} (x{item.qty})</span>
              <span className='font-medium text-gray-900'>
                {(item.product.price * item.qty).toFixed(2)} €
              </span>
            </li>
          ))}
        </ul>
        <div className='flex justify-between pt-4 border-t border-gray-200 mt-4'>
          <span className='text-base font-bold text-gray-900'>Total</span>
          <span className='text-base font-bold text-gray-900'>{total.toFixed(2)} €</span>
        </div>
      </div>

      {/* Formulario de envío y pago */}
      <form className='space-y-6'>
        <div>
          <label htmlFor='address' className='block text-sm font-medium text-gray-700'>
            Shipping Address
          </label>
          <input
            type='text'
            id='address'
            name='address'
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
            placeholder='123 Main St, City, Country'
          />
        </div>

        <div>
          <label htmlFor='cardHolder' className='block text-sm font-medium text-gray-700'>
            Card Holder
          </label>
          <input
            type='text'
            id='cardHolder'
            name='cardHolder'
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
            placeholder='John Doe'
          />
        </div>

        <div>
          <label htmlFor='cardNumber' className='block text-sm font-medium text-gray-700'>
            Card Number
          </label>
          <input
            type='text'
            id='cardNumber'
            name='cardNumber'
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
            placeholder='0000 0000 0000 0000'
          />
        </div>

        <button
          type='button'
          className='w-full rounded-md bg-gray-800 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
        >
          Purchase (Simulation)
        </button>
      </form>
    </div>
  )
}