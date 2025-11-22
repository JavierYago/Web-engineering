export default function Header() {
  return (
    <header className='w-full bg-secondary px-6 pb-10 pt-24 text-center sm:pb-12 sm:pt-28 lg:px-8'>
      <div className='mx-auto max-w-2xl'>
        <h1 className='text-4xl font-extrabold tracking-tight text-primary sm:text-6xl'>
          Frescura Diaria
        </h1>
        <p className='mt-4 text-lg leading-8 text-gray-600'>
          Los mejores productos del campo a tu mesa en 24 horas.
        </p>
      </div>
    </header>
  )
}