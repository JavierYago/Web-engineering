import { Types } from 'mongoose'
import { notFound } from 'next/navigation'
import { getProduct } from '@/lib/handlers'

export default async function Product({
  params,
}: {
  params: { productId: string }
}) {
  if (!Types.ObjectId.isValid(params.productId)) {
    notFound()
  }

  const product = await getProduct(params.productId)
  if (product === null) {
    notFound()
  }

  return (
    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
      {/* Imagen del producto */}
      <div className='aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200'>
        <img
          src={product.img}
          alt={product.name}
          className='h-full w-full object-cover object-center'
        />
      </div>

      {/* Detalles del producto */}
      <div className='flex flex-col'>
        <h1 className='text-3xl font-bold text-gray-900'>{product.name}</h1>
        <div className='mt-4'>
          <h2 className='sr-only'>Product information</h2>
          <p className='text-3xl tracking-tight text-gray-900'>
            {product.price.toFixed(2)} €
          </p>
        </div>

        <div className='mt-6'>
          <h3 className='sr-only'>Description</h3>
          <p className='space-y-6 text-base text-gray-700'>
            {product.description}
          </p>
        </div>

        {/* Controles de cantidad (Visuales) */}
        <div className='mt-8 flex items-center gap-4'>
          <div className='flex items-center border border-gray-300 rounded'>
            <button className='px-3 py-1 text-gray-600 hover:bg-gray-100' disabled>-</button>
            <span className='px-3 py-1 text-gray-900'>1</span>
            <button className='px-3 py-1 text-gray-600 hover:bg-gray-100' disabled>+</button>
          </div>
          <button
            type='button'
            className='flex items-center justify-center rounded-md border border-transparent bg-gray-800 px-8 py-3 text-base font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
            disabled // Desactivado porque no hay lógica JS todavía
          >
            Add to cart
          </button>
        </div>
        <p className='mt-2 text-sm text-gray-500 italic'>
          (Interactivity not available in SSR mode)
        </p>
      </div>
    </div>
  )
}