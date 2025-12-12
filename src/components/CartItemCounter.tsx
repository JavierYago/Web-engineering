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
  // Estado local para actualización instantánea (Optimistic UI)
  const [optimisticValue, setOptimisticValue] = useState(value)
  const [isUpdating, setIsUpdating] = useState(false)

  // Sincronizar si el servidor manda un valor nuevo (ej. al refrescar)
  useEffect(() => {
    setOptimisticValue(value)
  }, [value])

  const updateQty = async (newQty: number) => {
    if (newQty < 1) return // Bloqueamos bajar de 1 aquí. Usar botón eliminar.
    
    // 1. Actualizar visualmente YA (sin esperar al servidor)
    setOptimisticValue(newQty)
    setIsUpdating(true)
    
    try {
      // 2. Hacer la petición
      await fetch(`/api/users/${userId}/cart/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ qty: newQty }),
      })
      // 3. Refrescar datos reales del servidor
      router.refresh()
    } catch (error) {
      // Si falla, revertimos al valor anterior (opcional)
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