import { redirect } from 'next/navigation'
import { getUserCart } from '@/lib/handlers'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import CartItemCounter from '@/components/CartItemCounter'
import RemoveCartItemButton from '@/components/RemoveCartItemButton'

export default async function Cart() {
  const session = await getSession()
  if (!session) redirect('/auth/signin')

  const cartData = await getUserCart(session.userId)
  if (!cartData) redirect('/auth/signin')

  const total = cartData.cartItems.reduce(
    (acc, item) => acc + item.product.price * item.qty,
    0
  )

  return (
    <div className='mx-auto max-w-4xl'>
      <h1 className='text-3xl font-bold tracking-tight text-gray-900'>My Shopping Cart</h1>
      <div className='mt-12'>
        {cartData.cartItems.length === 0 ? (
          <p className='text-gray-500'>Your cart is empty.</p>
        ) : (
          <ul className='divide-y divide-gray-200'>
            {cartData.cartItems.map((item) => (
              <li key={item.product._id.toString()} className='flex py-6'>
                <div className='h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200'>
                  <img src={item.product.img} alt={item.product.name} className='h-full w-full object-cover' />
                </div>
                <div className='ml-4 flex flex-1 flex-col'>
                  <div className='flex justify-between text-base font-medium text-gray-900'>
                    <h3><Link href={`/products/${item.product._id}`}>{item.product.name}</Link></h3>
                    <p>{(item.product.price * item.qty).toFixed(2)} €</p>
                  </div>
                  <div className='flex flex-1 items-end justify-between text-sm'>
                    <div className='flex items-center gap-2'>
                        <p className='text-gray-500'>Qty</p>
                        <CartItemCounter 
                            userId={session.userId} 
                            productId={item.product._id.toString()} 
                            value={item.qty} 
                        />
                    </div>
                    <RemoveCartItemButton 
                        userId={session.userId} 
                        productId={item.product._id.toString()} 
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {cartData.cartItems.length > 0 && (
        <div className='mt-10 border-t border-gray-200 pt-6'>
          <div className='flex justify-between text-base font-medium text-gray-900'>
            <p>Total</p>
            <p>{total.toFixed(2)} €</p>
          </div>
          <div className='mt-6'>
            <Link href='/checkout' className='flex items-center justify-center rounded-md bg-gray-800 px-6 py-3 text-white hover:bg-gray-900'>Checkout</Link>
          </div>
        </div>
      )}
    </div>
  )
}