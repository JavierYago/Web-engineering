import { ReactNode } from 'react'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { getUserCart } from '@/lib/handlers'
import { navbarButtonClasses } from '@/components/NavbarButton'

interface NavbarCartButtonProps {
  children: ReactNode
}

export default async function NavbarCartButton({
  children,
}: NavbarCartButtonProps) {
  const session = await getSession()
  let totalQty = 0

  // Solo calculamos si hay sesión. Si no, no hacemos nada (ni redirigimos)
  if (session) {
    const cartData = await getUserCart(session.userId)
    if (cartData) {
      totalQty = cartData.cartItems.reduce(
        (acc, item) => acc + item.qty,
        0
      )
    }
  }

  // NOTA: No poner redirect('/auth/signin') aquí, 
  // porque este componente se carga en el layout global.

  return (
    <Link href='/cart' className={`relative ${navbarButtonClasses}`}>
      {children}
      {totalQty > 0 && (
        <div className='absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white'>
          {totalQty}
        </div>
      )}
    </Link>
  )
}