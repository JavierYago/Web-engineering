import SignUpForm from '@/components/SignUpForm'
import Link from 'next/link'

export default function SignUp() {
  // ¡IMPORTANTE! No añadas getSession() ni redirect() aquí.
  // Esta página debe ser accesible para usuarios no autenticados.

  return (
    <div className='flex w-full flex-col px-6 py-12'>
      <div className='mx-auto w-full max-w-sm'>
        <div className='mx-auto h-10 w-auto text-center text-4xl'>🛒</div>
        <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
          Create a new account
        </h2>
      </div>

      <div className='mx-auto mt-10 w-full max-w-sm'>
        <SignUpForm />
        <p className='mt-10 text-center text-sm text-gray-500'>
          Already a member?{' '}
          <Link
            href='/auth/signin'
            className='font-semibold leading-6 text-indigo-600 hover:text-indigo-500'
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}