"use client"

import Link from 'next/link'
import React, { useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'

function HeroSection() {

    const imageRef = useRef()

    useEffect(() => {
        const imageElement = imageRef.current;

        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const scrollThreshold = 100;

            if (scrollPosition > scrollThreshold) {
                imageElement.classList.add('scrolled')
            } else {
                imageElement.classList.remove('scrolled')
            }
        }

        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <div className='pb-20 px-4 text-center'>
            <div className='container mx-auto'>
                <h1 className='text-5xl md:text-8xl lg:text-[105px] pb-6 title tracking-tighter font-extrabold'>
                    Manage Your Finances <br /> with Intelligence
                </h1>
            </div>
            <p className='text-xl tracking-tight font-semibold text-gray-600 mb-8 max-w-2xl mx-auto'>
                An AI-powered financial management platform that helps you track, analyze and optimize your finances with real-time insights.
            </p>
            <div className='mb-10'>
                <Link href={'/dashboard'}>
                    <Button size="lg" className='px-8 bg-[var(--primaryColor)] cursor-pointer'>Get Started</Button>
                </Link>
            </div>
            <div className='hero-image-wrapper'>
                <div ref={imageRef} className='hero-image'>
                    <Image
                        src='/images/banner.jpg'
                        width={1280}
                        height={720}
                        alt='Banner Image'
                        className='rounded-lg shadow-2xl border mx-auto'
                        priority
                    />
                </div>
            </div>
        </div>
    )
}

export default HeroSection