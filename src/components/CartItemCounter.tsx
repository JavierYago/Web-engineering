'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// Puedes usar iconos de Heroicons si los tienes instalados
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline' 

interface CartItemCounterProps {
  userId: string
  productId: string
  value: number
}

export default function CartItemCounter({
  userId,
  productId,
  value,
}: CartItemCounterProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const updateQty = async (newQty: number) => {
    setIsUpdating(true)
    try {
      // Si la cantidad es 0, podríamos querer llamar a DELETE, 
      // pero para este ejemplo usaremos PUT con la nueva cantidad.
      if (newQty < 1) return 

      await fetch(`/api/users/${userId}/cart/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({
          qty: newQty,
        }),
      })
      router.refresh()
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className='flex items-center'>
      <div className='flex items-center border border-gray-300 rounded'>
        <button
          type='button'
          onClick={() => updateQty(value - 1)}
          disabled={isUpdating || value <= 1}
          className='relative inline-flex items-center px-2 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50'
        >
          <span className='sr-only'>Decrease</span>
          <MinusIcon className='h-4 w-4' />
        </button>
        <span className='px-4 py-1 text-gray-900 min-w-[3rem] text-center'>
            {value}
        </span>
        <button
          type='button'
          onClick={() => updateQty(value + 1)}
          disabled={isUpdating}
          className='relative inline-flex items-center px-2 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50'
        >
          <span className='sr-only'>Increase</span>
          <PlusIcon className='h-4 w-4' />
        </button>
      </div>
    </div>
  )
}