import {
  ShoppingCartIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import NavbarButton from '@/components/NavbarButton'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import NavbarCartButton from '@/components/NavbarCartButton' 
import NavbarSignOutButton from '@/components/NavbarSignOutButton' 

export default async function Navbar() {
  const session = await getSession()

  return (
    <nav className='fixed top-0 z-50 w-full bg-primary shadow-md transition-colors duration-300'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='relative flex h-16 items-center justify-between'>
          {/* Logo y Nombre */}
          <div className='flex flex-1 items-center justify-start'>
            <Link
              className='flex flex-shrink-0 items-center space-x-2 text-inverted hover:opacity-90'
              href='/'
            >
              {/* Icono de supermercado */}
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-8 w-8'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z'
                />
              </svg>
              <div className='inline-block w-auto text-xl font-semibold'>
                SuperMarket
              </div>
            </Link>
          </div>

          {/* Botones y Acciones */}
          <div className='absolute inset-y-0 right-0 flex items-center space-x-4'>
            {/* Botón de accesibilidad */}
            <div className='hidden sm:block'>
              <ThemeSwitcher />
            </div>

            {session ? (
              <>
                {/* Botón del carrito con Badge */}
                <NavbarCartButton>
                  <span className='sr-only'>Cart</span>
                  <ShoppingCartIcon className='h-6 w-6' aria-hidden='true' />
                </NavbarCartButton>

                {/* Perfil de usuario */}
                <NavbarButton href='/profile'>
                  <span className='sr-only'>User profile</span>
                  <UserIcon className='h-6 w-6' aria-hidden='true' />
                </NavbarButton>

                {/* Botón de Sign Out funcional */}
                <NavbarSignOutButton />
              </>
            ) : (
              <>
                <Link
                  href='/auth/signup'
                  className='rounded-md px-3 py-2 text-sm font-medium text-inverted hover:bg-black/10 hover:text-white'
                >
                  Sign up
                </Link>
                <Link
                  href='/auth/signin'
                  className='rounded-md px-3 py-2 text-sm font-medium text-inverted hover:bg-black/10 hover:text-white'
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
        {/* Botón de accesibilidad móvil */}
        <div className='flex justify-center pb-2 sm:hidden'>
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  )
}