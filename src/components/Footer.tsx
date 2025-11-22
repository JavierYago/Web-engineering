export default function Footer() {
  return (
    <footer className='mx-auto mt-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-gray-500'>
      <hr className='border-gray-200 mb-6' />
      <div className='flex flex-col md:flex-row justify-between items-center'>
        <span className='text-sm'>
          &copy; {new Date().getFullYear()} SuperMarket. Todos los derechos reservados.
        </span>
        <span className='text-xs mt-2 md:mt-0'>
          Web Engineering and Services
        </span>
      </div>
    </footer>
  )
}