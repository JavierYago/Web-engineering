'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CartItemCounterProps {
  userId: string
  productId: string
  value: number
}

export default function CartItemCounter({ userId, productId, value }: CartItemCounterProps) {
  const router = useRouter()
  const [optimisticValue, setOptimisticValue] = useState(value)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setOptimisticValue(value)
  }, [value])

  const updateQty = async (newQty: number) => {
    if (newQty < 1) return
    
    setOptimisticValue(newQty)
    setIsUpdating(true)
    
    try {
      await fetch(`/api/users/${userId}/cart/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ qty: newQty }),
      })
      router.refresh()
    } catch (error) {
      console.error(error)
      setOptimisticValue(value) 
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className='flex items-center border border-gray-300 rounded'>
      <button
        type="button"
        onClick={() => updateQty(optimisticValue - 1)}
        disabled={isUpdating || optimisticValue <= 1}
        className='px-3 py-1 hover:bg-gray-100 disabled:opacity-50 text-gray-600'
      >
        -
      </button>
      <span className='px-2 w-8 text-center text-gray-900 font-medium'>
        {optimisticValue}
      </span>
      <button
        type="button"
        onClick={() => updateQty(optimisticValue + 1)}
        disabled={isUpdating}
        className='px-3 py-1 hover:bg-gray-100 disabled:opacity-50 text-gray-600'
      >
        +
      </button>
    </div>
  )
}