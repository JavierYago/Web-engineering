import { ReactNode } from 'react'
import Link from 'next/link'

export const navbarButtonClasses =
  'rounded-full p-2 text-green-100 hover:text-white hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-white';

interface NavbarButtonProps {
  href: string;
  children: ReactNode;
}

export default function NavbarButton({ href, children }: NavbarButtonProps) {
  return (
    <Link href={href} className={navbarButtonClasses}>
      {children}
    </Link>
  )
}