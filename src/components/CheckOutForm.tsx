'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CheckOutFormProps {
  userId: string
  total: number
}

export default function CheckOutForm({ userId, total }: CheckOutFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [formValues, setFormValues] = useState({
    address: '',
    cardHolder: '',
    cardNumber: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!event.currentTarget.checkValidity()) return false

    setIsProcessing(true)
    setError('')

    try {
      const res = await fetch(`/api/users/${userId}/orders`, {
        method: 'POST',
        body: JSON.stringify(formValues),
      })

      if (res.ok) {
        const data = await res.json()
        
        // 1. Actualizamos los datos del servidor (esto vacía el badge del carrito)
        router.refresh()
        
        // 2. Redirigimos a la orden
        router.push(`/orders/${data._id}`)
      } else {
        setError('Error al procesar el pedido.')
        setIsProcessing(false)
      }
    } catch (e) {
      setError('Error de conexión.')
      setIsProcessing(false)
    }
  }

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      <div>
        <label htmlFor='address' className='block text-sm font-medium text-gray-700'>Dirección de envío</label>
        <input
          type='text' id='address' name='address' required
          value={formValues.address} onChange={handleChange}
          className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
        />
      </div>
      <div>
        <label htmlFor='cardHolder' className='block text-sm font-medium text-gray-700'>Titular de la tarjeta</label>
        <input
          type='text' id='cardHolder' name='cardHolder' required
          value={formValues.cardHolder} onChange={handleChange}
          className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
        />
      </div>
      <div>
        <label htmlFor='cardNumber' className='block text-sm font-medium text-gray-700'>Número de tarjeta</label>
        <input
          type='text' id='cardNumber' name='cardNumber' required
          value={formValues.cardNumber} onChange={handleChange}
          className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type='submit'
        disabled={isProcessing}
        className='w-full rounded-md bg-gray-800 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-900 disabled:opacity-50'
      >
        {isProcessing ? 'Procesando...' : `Pagar ${total.toFixed(2)} €`}
      </button>
    </form>
  )
}