'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CartItemCounterProps {
  userId: string
  productId: string
  value: number
}

export default function CartItemCounter({ userId, productId, value }: CartItemCounterProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const updateQty = async (newQty: number) => {
    if (newQty < 1) return // No permitimos bajar de 1 aquí, para eso está el botón eliminar
    setIsUpdating(true)
    
    await fetch(`/api/users/${userId}/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ qty: newQty }),
    })
    
    router.refresh()
    setIsUpdating(false)
  }

  return (
    <div className='flex items-center border border-gray-300 rounded'>
      <button
        onClick={() => updateQty(value - 1)}
        disabled={isUpdating || value <= 1}
        className='px-2 py-1 hover:bg-gray-100 disabled:opacity-50'
      >
        -
      </button>
      <span className='px-2 w-8 text-center'>{value}</span>
      <button
        onClick={() => updateQty(value + 1)}
        disabled={isUpdating}
        className='px-2 py-1 hover:bg-gray-100 disabled:opacity-50'
      >
        +
      </button>
    </div>
  )
}