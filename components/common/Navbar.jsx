import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { LayoutDashboard, PenBox } from 'lucide-react'

function Navbar() {
    return (
        <header className='fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md'>
            <nav className='container mx-auto p-4 flex items-center justify-between'>
                <Link href={'/'}>
                    {/* <Image height={60} width={200} className='h-12 w-auto object-contain'/> */}
                    <div className='!text-4xl'>Finaura</div>
                </Link>
                <div className='flex items-center space-x-4'>
                    <SignedIn>
                        <Link href={'/dashboard'} className='text-gray-600 hover:text-blue-600 flex items-center gap-2'>
                            <Button variant='outline'>
                                <LayoutDashboard size={18} />
                                <span className='hidden md:inline'>Dashboard</span></Button>
                        </Link>
                        <Link href={'/transaction/create'}>
                            <Button className='flex items-center gap-2'>
                                <PenBox size={18} />
                                <span className='hidden md:inline'>Add Transaction</span></Button>
                        </Link>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton>
                            <Button variant='outline'>Log In</Button>
                        </SignInButton>
                        <SignUpButton>
                            <Button>Sign Up</Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton appearance={{
                            elements: {
                                avatarBox: {
                                    width: 40,
                                    height: 40,
                                }
                            }
                        }} />
                    </SignedIn>
                </div>
            </nav>
        </header>
    )
}

export default Navbar