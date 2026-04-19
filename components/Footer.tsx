'use client'

import Link from 'next/link'
import { useAccount } from 'wagmi' // Or your specific wallet hook
import {  X, MessageSquare, ShieldCheck } from 'lucide-react'

export default function Footer() {
    const { address, isConnected } = useAccount()

    // We create a helper to determine where the link goes
    // If not connected, we send them to the general profile or home
    const profileHref = isConnected ? `/profile/${address}` : '/profile'
    return (
        <footer className=" border-t border-zinc-800 bg-black py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <h2 className="text-2xl font-black italic text-white tracking-tighter">
                            ARC<span className="text-yellow-400">.FUN</span>
                        </h2>
                        <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
                            The premier terminal for launching and trading bonding curve assets on the Arc Network. 
                            Deploy manually or with AI, trade with speed, and reach the King of the Hill.
                        </p>
                        <div className="flex gap-4">
                            {/* Modern X Icon */}
                            <Link href="https://x.com/tobzy47" className="text-zinc-500 hover:text-yellow-400 transition-colors">
                                <X size={18} />
                            </Link>
                            <Link href="https://t.me/+--99cyLnFFg5MzZk" className="text-zinc-500 hover:text-yellow-400 transition-colors">
                                <MessageSquare size={18} />
                            </Link>
                           
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Platform</h4>
                        <ul className="space-y-2 text-xs font-bold">
                            <li><Link href="/" className="text-zinc-600 hover:text-white transition-colors uppercase">Dashboard</Link></li>
                            <li><Link href="/create" className="text-zinc-600 hover:text-white transition-colors uppercase">Launch Token</Link></li>
                            <li><Link 
                    href={profileHref} 
                    className="text-zinc-600 hover:text-white transition-colors uppercase flex items-center gap-2"
                >
                     My Assets
                </Link></li>
                        </ul>
                    </div>

                    {/* Support/Legal */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Support</h4>
                        <ul className="space-y-2 text-xs font-bold">
                            <li><Link href="/guidelines" className="text-zinc-600 hover:text-white transition-colors uppercase">Guidelines</Link></li>
                            <li><Link href="/support" className="text-zinc-600 hover:text-white transition-colors uppercase">Support</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono">
                        <ShieldCheck size={12} className="text-green-500" />
                        ARC NETWORK TESTNET ENVIRONMENT // v1.0.4
                    </div>
                    <p className="text-[10px] text-zinc-700 font-mono">
                        &copy; {new Date().getFullYear()} ARC.FUN. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
        </footer>
    )
}