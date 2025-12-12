'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrashIcon } from '@heroicons/react/24/outline'

export default function RemoveCartItemButton({ userId, productId }: { userId: string, productId: string }) {
  const router = useRouter()
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
        await fetch(`/api/users/${userId}/cart/${productId}`, { method: 'DELETE' })
        router.refresh()
    } finally {
        setIsRemoving(false)
    }
  }

  return (
    <button 
      type="button"
      onClick={handleRemove} 
      disabled={isRemoving} 
      className='flex items-center gap-1 text-red-600 hover:text-red-800 disabled:opacity-50 font-medium text-sm'
    >
      <TrashIcon className="h-4 w-4" />
      {isRemoving ? 'Removing...' : 'Remove'}
    </button>
  )
}