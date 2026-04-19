'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import Link from 'next/link'
import Image from 'next/image' // Added Image import
import { HelpCircle, BookOpen } from 'lucide-react'

export default function Navbar() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, [])

  if (!mounted) return null

  return (
    <nav className="flex justify-between items-center px-6 py-3 border-b border-zinc-800 bg-black sticky top-0 z-50">
      {/* LEFT: Branding & Main Nav */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3 text-2xl font-black text-yellow-400 tracking-tighter hover:opacity-80 transition-opacity">
          {/* LOGO IMPLEMENTATION */}
          <Image 
            src="/arcfun.png" 
            alt="ARC.FUN Logo" 
            width={32} 
            height={32} 
            className="rounded-sm"
          />
          ARC.FUN
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link 
            href="/guidelines" 
            className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            <BookOpen size={14} className="text-yellow-400" />
            Guidelines
          </Link>
          <Link 
            href="/support" 
            className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            <HelpCircle size={14} />
            Support
          </Link>
        </div>
      </div>

      {/* RIGHT: User Actions */}
      <div className="flex items-center gap-6">
        {isConnected ? (
          <div className="flex items-center gap-6">
            <Link 
              href={`/profile/${address}`} 
              className="text-[10px] font-bold text-zinc-400 hover:text-yellow-400 uppercase tracking-widest transition-colors"
            >
              My Profile
            </Link>

            <div className="flex items-center gap-3 bg-zinc-900/50 p-1 pr-3 rounded-lg border border-zinc-800 group hover:border-zinc-700 transition-all">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-md shrink-0" />
              <span className="text-[10px] font-mono text-zinc-300">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button 
                onClick={() => disconnect()} 
                className="text-[10px] text-zinc-600 hover:text-red-500 font-bold uppercase transition-colors ml-2"
              >
                Exit
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => connect({ connector: connectors[0] })} 
            className="bg-yellow-400 text-black px-5 py-2 font-black text-[10px] uppercase hover:bg-yellow-300 transition-all shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  )
}