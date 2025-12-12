import { redirect } from 'next/navigation'
import { getUserCart } from '@/lib/handlers'
import { getSession } from '@/lib/auth'
import CheckOutForm from '@/components/CheckOutForm'

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
      
      <div className='bg-gray-50 p-6 rounded-lg mb-8'>
        <h2 className='text-lg font-medium text-gray-900 mb-4'>Resumen</h2>
        <ul className='divide-y divide-gray-200'>
          {cartData.cartItems.map((item) => (
            <li key={item.product._id.toString()} className='flex justify-between py-2'>
              <span className='text-gray-700'>{item.product.name} (x{item.qty})</span>
              <span>{(item.product.price * item.qty).toFixed(2)} €</span>
            </li>
          ))}
        </ul>
        <div className='flex justify-between pt-4 border-t border-gray-200 mt-4 font-bold'>
          <span>Total</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </div>

      <CheckOutForm userId={session.userId} total={total} />
    </div>
  )
}