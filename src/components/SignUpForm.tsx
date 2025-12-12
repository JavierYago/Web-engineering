'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormValues {
  email: string
  password: string
  name: string
  surname: string
  address: string
  birthdate: string
}

export default function SignUpForm() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [formValues, setFormValues] = useState<FormValues>({
    email: '',
    password: '',
    name: '',
    surname: '',
    address: '',
    birthdate: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!event.currentTarget.checkValidity()) {
      return false
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(formValues),
      })

      if (res.ok) {
        setError('')
        // Redirigir al login tras registro exitoso
        router.push('/auth/signin')
      } else {
        const data = await res.json()
        if (data.error === 'SIGNUP_FAIL') {
          setError('Email address already exists.')
        } else {
          setError('Error registering user. Please check your data.')
        }
      }
    } catch (e) {
      setError('Connection error.')
    }
  }

  const inputClass = 'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <div>
          <label htmlFor='name' className='block text-sm font-medium leading-6 text-gray-900'>Name</label>
          <input id='name' name='name' type='text' required className={inputClass} value={formValues.name} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor='surname' className='block text-sm font-medium leading-6 text-gray-900'>Surname</label>
          <input id='surname' name='surname' type='text' required className={inputClass} value={formValues.surname} onChange={handleChange} />
        </div>
      </div>

      <div>
        <label htmlFor='address' className='block text-sm font-medium leading-6 text-gray-900'>Address</label>
        <input id='address' name='address' type='text' required className={inputClass} value={formValues.address} onChange={handleChange} />
      </div>

      <div>
        <label htmlFor='birthdate' className='block text-sm font-medium leading-6 text-gray-900'>Birthdate</label>
        <input id='birthdate' name='birthdate' type='date' required className={inputClass} value={formValues.birthdate} onChange={handleChange} />
      </div>

      <div>
        <label htmlFor='email' className='block text-sm font-medium leading-6 text-gray-900'>Email address</label>
        <input id='email' name='email' type='email' autoComplete='email' required className={inputClass} value={formValues.email} onChange={handleChange} />
      </div>

      <div>
        <label htmlFor='password' className='block text-sm font-medium leading-6 text-gray-900'>Password</label>
        <input id='password' name='password' type='password' required className={inputClass} value={formValues.password} onChange={handleChange} />
      </div>

      {error && (
        <div className='rounded-md bg-red-50 p-4'>
          <div className='flex'>
            <div className='text-sm text-red-700'>{error}</div>
          </div>
        </div>
      )}

      <button type='submit' className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
        Sign up
      </button>
    </form>
  )
}