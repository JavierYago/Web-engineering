import { Types } from 'mongoose'
import { notFound } from 'next/navigation'
import { getProduct, getUserCart } from '@/lib/handlers' // Importamos getUserCart
import { getSession } from '@/lib/auth'
import CartItemCounter from '@/components/CartItemCounter'

export default async function Product({
  params,
}: {
  params: { productId: string }
}) {
  if (!Types.ObjectId.isValid(params.productId)) {
    notFound()
  }

  const session = await getSession()
  const product = await getProduct(params.productId)
  
  if (product === null) {
    notFound()
  }

  // Lógica para obtener la cantidad actual en el carrito
  let initialQty = 0
  if (session) {
    const cart = await getUserCart(session.userId)
    const cartItem = cart?.cartItems.find(
      (item) => item.product._id.toString() === params.productId
    )
    if (cartItem) {
      initialQty = cartItem.qty
    }
  }

  return (
    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
      <div className='aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200'>
        <img
          src={product.img}
          alt={product.name}
          className='h-full w-full object-cover object-center'
        />
      </div>

      <div className='flex flex-col'>
        <h1 className='text-3xl font-bold text-gray-900'>{product.name}</h1>
        <div className='mt-4'>
          <p className='text-3xl tracking-tight text-gray-900'>
            {product.price.toFixed(2)} €
          </p>
        </div>
        <div className='mt-6'>
          <p className='space-y-6 text-base text-gray-700'>
            {product.description}
          </p>
        </div>

        <div className='mt-8'>
            {session ? (
                 <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">
                      {initialQty > 0 ? 'In cart:' : 'Add to cart:'}
                    </p>
                    <CartItemCounter 
                        userId={session.userId} 
                        productId={product._id.toString()} 
                        value={initialQty} 
                    />
                 </div>
            ) : (
                <p className='text-sm text-red-500'>Please sign in to add items.</p>
            )}
        </div>
      </div>
    </div>
  )
}