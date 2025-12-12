'use client'

import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { navbarButtonClasses } from '@/components/NavbarButton'

export default function NavbarSignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/auth/signout', {
        method: 'POST',
      })
      if (res.ok) {
        router.refresh()
        // Opcional: router.push('/') si quieres redirigir a home
      }
    } catch (error) {
      console.error('Error signing out', error)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className={navbarButtonClasses}
      title="Sign out"
    >
      <span className='sr-only'>Sign out</span>
      <ArrowRightStartOnRectangleIcon className='h-6 w-6' aria-hidden='true' />
    </button>
  )
}