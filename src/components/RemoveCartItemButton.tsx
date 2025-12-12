'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrashIcon } from '@heroicons/react/24/outline'

export default function RemoveCartItemButton({ userId, productId }: { userId: string, productId: string }) {
  const router = useRouter()
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)
    await fetch(`/api/users/${userId}/cart/${productId}`, { method: 'DELETE' })
    router.refresh()
    setIsRemoving(false)
  }

  return (
    <button onClick={handleRemove} disabled={isRemoving} className='text-red-600 hover:text-red-800 disabled:opacity-50'>
      <TrashIcon className="h-5 w-5" />
    </button>
  )
}