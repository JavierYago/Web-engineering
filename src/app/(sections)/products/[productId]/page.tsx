import { Types } from 'mongoose'
import { notFound } from 'next/navigation'
import { getProduct } from '@/lib/handlers'
import { getSession } from '@/lib/auth' // Importar getSession
import CartItemCounter from '@/components/CartItemCounter' // Importar componente

export default async function Product({
  params,
}: {
  params: { productId: string }
}) {
  if (!Types.ObjectId.isValid(params.productId)) {
    notFound()
  }

  const session = await getSession() // Obtener sesión para el userId
  const product = await getProduct(params.productId)
  
  if (product === null) {
    notFound()
  }

  return (
    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
      {/* Imagen ... (sin cambios) */}
      <div className='aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200'>
        <img
          src={product.img}
          alt={product.name}
          className='h-full w-full object-cover object-center'
        />
      </div>

      <div className='flex flex-col'>
        <h1 className='text-3xl font-bold text-gray-900'>{product.name}</h1>
        {/* Precio y Descripción ... (sin cambios) */}
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

        {/* INTEGRACIÓN DEL CONTADOR */}
        <div className='mt-8'>
            {session ? (
                 <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">Add to cart:</p>
                    {/* Nota: Para añadir desde 0, el CartItemCounter debería manejar la lógica de 
                        crear si no existe, o usar un botón "Add" separado inicialmente. 
                        Según el seminario, parece que reutilizan la lógica de PUT.
                        Asumiremos que si el producto no está en el carrito, value inicia en 0 o 1 visualmente
                        pero la lógica de añadir debe ser manejada. 
                        Para simplificar según el seminario, mostramos el contador si el usuario tiene sesión.
                        Idealmente recuperarías la cantidad actual del carrito aquí.
                    */}
                    <CartItemCounter 
                        userId={session.userId} 
                        productId={product._id.toString()} 
                        value={0} /* Deberías obtener la cantidad real del carrito si existe */
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