import { redirect } from 'next/navigation'
import { getUserCart } from '@/lib/handlers'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import CartItemCounter from '@/components/CartItemCounter'

export default async function Cart() {
  const session = await getSession()
  if (!session) {
    redirect('/auth/signin')
  }

  const cartData = await getUserCart(session.userId)
  if (!cartData) {
    redirect('/auth/signin')
  }

  const total = cartData.cartItems.reduce(
    (acc, item) => acc + item.product.price * item.qty,
    0
  )

  return (
    <div className='mx-auto max-w-4xl'>
      <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
        My Shopping Cart
      </h1>

      <div className='mt-12'>
        {cartData.cartItems.length === 0 ? (
          <p className='text-gray-500'>Your cart is empty.</p>
        ) : (
          <div className='flow-root'>
            <ul role='list' className='-my-6 divide-y divide-gray-200'>
              {cartData.cartItems.map((item) => (
                <li key={item.product._id.toString()} className='flex py-6'>
                  <div className='h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200'>
                    <img
                      src={item.product.img}
                      alt={item.product.name}
                      className='h-full w-full object-cover object-center'
                    />
                  </div>

                  <div className='ml-4 flex flex-1 flex-col'>
                    <div>
                      <div className='flex justify-between text-base font-medium text-gray-900'>
                        <h3>
                          <Link
                            href={`/products/${item.product._id.toString()}`}
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        <p className='ml-4'>
                          {(item.product.price * item.qty).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                    <div className='flex flex-1 items-end justify-between text-sm'>
                      <p className='text-gray-500'>Qty {item.qty}</p>
                      <div className='flex items-center'>
                        <p className='mr-2 text-gray-500'>Qty</p>
                        <CartItemCounter
                          userId={session.userId}
                          productId={item.product._id.toString()}
                          value={item.qty}
                        />
                      </div>

                      <div className='flex'>
                        <button
                          type='button'
                          className='font-medium text-indigo-600 hover:text-indigo-500'
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {cartData.cartItems.length > 0 && (
        <div className='mt-10 border-t border-gray-200 pt-6'>
          <div className='flex justify-between text-base font-medium text-gray-900'>
            <p>Total</p>
            <p>{total.toFixed(2)} €</p>
          </div>
          <p className='mt-0.5 text-sm text-gray-500'>
            Shipping and taxes calculated at checkout.
          </p>
          <div className='mt-6'>
            <Link
              href='/checkout'
              className='flex items-center justify-center rounded-md border border-transparent bg-gray-800 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-900'
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
