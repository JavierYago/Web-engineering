'use client'

import { useState, useEffect } from 'react'
import { EyeIcon } from '@heroicons/react/24/outline'

export default function ThemeSwitcher() {
  const [isAccessible, setIsAccessible] = useState(false)

  useEffect(() => {
    // Al montar, comprobar si ya estaba activo
    const savedMode = localStorage.getItem('daltonism-mode') === 'true'
    setIsAccessible(savedMode)
    if (savedMode) {
      document.body.classList.add('daltonism-mode')
    }
  }, [])

  const toggleTheme = () => {
    const newState = !isAccessible
    setIsAccessible(newState)
    localStorage.setItem('daltonism-mode', String(newState))
    
    if (newState) {
      document.body.classList.add('daltonism-mode')
    } else {
      document.body.classList.remove('daltonism-mode')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors
        ${isAccessible 
          ? 'bg-yellow-400 text-black ring-2 ring-black' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      title="Cambiar modo de color para accesibilidad"
    >
      <EyeIcon className="h-5 w-5" />
      {isAccessible ? 'Modo Accesible: ON' : 'Accesibilidad'}
    </button>
  )
}