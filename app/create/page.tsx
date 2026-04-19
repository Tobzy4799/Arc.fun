'use client'

import { useState } from 'react'
import Navbar from "@/components/Navbar"
import CreateTokenForm from "@/components/CreateTokenForm"
import AICoinGenerator from "@/components/AICoinGenerator"
import Link from "next/link"

export default function CreatePage() {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual')

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto py-12 px-6">
        <Link href="/" className="text-zinc-500 text-xs hover:text-yellow-400 mb-8 inline-block italic transition-colors">
          {"<- go back to dashboard"}
        </Link>
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-yellow-400 uppercase tracking-tighter">Launch your token</h1>

          </div>

          {/* New Toggle Switch */}
          <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
            <button 
              onClick={() => setMode('manual')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'manual' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
            >
              Manual
            </button>
            <button 
              onClick={() => setMode('ai')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'ai' ? 'bg-yellow-400 text-black' : 'text-zinc-500'}`}
            >
              AI Agent
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl shadow-2xl transition-all">
          {mode === 'manual' ? (
            <CreateTokenForm />
          ) : (
            <AICoinGenerator />
          )}
        </div>
      </div>
    </main>
  )
}