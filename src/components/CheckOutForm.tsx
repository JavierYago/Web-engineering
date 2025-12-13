'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface CheckOutFormProps {
  userId: string
  total: number
}

export default function CheckOutForm({ userId, total }: CheckOutFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
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
        
        startTransition(() => {
          router.refresh()
          router.push(`/orders/${data._id}`)
        })
      } else {
        setError('Error al procesar el pedido.')
        setIsProcessing(false)
      }
    } catch (e) {
      setError('Error de conexión.')
      setIsProcessing(false)
    }
  }

  const isLoading = isProcessing || isPending

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
          pattern="[0-9]{16}" title="16 dígitos requeridos"
          value={formValues.cardNumber} onChange={handleChange}
          className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type='submit'
        disabled={isLoading}
        className='w-full rounded-md bg-gray-800 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-900 disabled:opacity-50 flex justify-center'
      >
        {isLoading ? (
           <span className="flex items-center gap-2">
             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             Procesando...
           </span>
        ) : (
           `Pagar ${total.toFixed(2)} €`
        )}
      </button>
    </form>
  )
}