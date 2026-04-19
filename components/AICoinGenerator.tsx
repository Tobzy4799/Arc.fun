'use client'

import { useState, useEffect } from 'react'
import { Sparkles, RefreshCcw, Rocket, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { FACTORY_ADDRESS, FACTORY_ABI } from '@/config/contract'

export default function AICoinGenerator() {
  const router = useRouter()
  const { isConnected } = useAccount()
  
  // Blockchain Hooks
  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // State
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState("")
  const [draft, setDraft] = useState<any>(null)

  // 1. Generate Metadata & Image using AI
  const handleGenerate = async () => {
    if (!prompt) return
    setIsGenerating(true)
    setStatus("AI is dreaming up your token...")
    
    try {
      const response = await fetch('/api/generate-coin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      
      const data = await response.json()
      
      // DEBUG: Check your browser console if fields are blank!
      console.log("AI API Result:", data)
      
      setDraft(data)
    } catch (error) {
      console.error("AI Generation failed:", error)
      alert("AI failed to manifest. Try a different prompt.")
    } finally {
      setIsGenerating(false)
      setStatus("")
    }
  }

  // 2. Upload AI Image to IPFS and Launch to Chain
  const handleLaunch = async () => {
    if (!draft || !isConnected) return alert("Connect wallet first!")
    setStatus("Pinning AI art to IPFS...")
    
    try {
      const uploadRes = await fetch('/api/upload-ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrl: draft.image,
          name: draft.name,
          ticker: draft.symbol,
          description: draft.description 
        }),
      })
      
      const result = await uploadRes.json()
      
      if (result.ipfsHash) {
        setStatus("Confirm in wallet...")
        
        writeContract({
          address: FACTORY_ADDRESS,
          abi: FACTORY_ABI,
          functionName: 'createToken',
          args: [draft.name, draft.symbol, result.ipfsHash],
        })
      }
    } catch (error) {
      console.error("Launch failed:", error)
      setStatus("Error during launch.")
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => router.push('/'), 2000)
    }
  }, [isConfirmed, router])

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        <h2 className='text-yellow-400'>When using AI to deploy, you cannot add your socials</h2>
      {/* Prompt Area */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-black border border-zinc-800 rounded-[1.5rem] p-6 shadow-2xl">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating || isPending || isConfirming}
            placeholder="Describe your vision (e.g. 'A cybernetic owl that lives in the ARC cloud')"
            className="w-full bg-transparent border-none outline-none resize-none h-28 text-sm font-medium text-zinc-200 placeholder:text-zinc-800"
          />
          <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">ARC AI Agent v1</span>
            <button 
              onClick={handleGenerate}
              disabled={!prompt || isGenerating || isPending || isConfirming}
              className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-black uppercase text-[10px] hover:bg-yellow-400 transition-all disabled:opacity-30 disabled:bg-zinc-900 disabled:text-zinc-700"
            >
              {isGenerating ? <RefreshCcw className="animate-spin w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
              {isGenerating ? 'Dreaming...' : 'Manifest with AI'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview & Launch UI */}
      {draft && (
        <div className="bg-zinc-900 border border-yellow-400/20 rounded-[2rem] p-8 animate-in zoom-in-95 duration-500">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-32 h-32 rounded-3xl border border-zinc-800 bg-black flex-shrink-0 overflow-hidden relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={draft.image} 
                alt="AI Preview" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" 
              />
              {(isPending || isConfirming) && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                  {draft.name} <span className="text-yellow-400/40">${draft.symbol}</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-1 italic leading-relaxed">
                 {draft.description}
                </p>
              </div>

              <button 
                onClick={handleLaunch}
                disabled={isPending || isConfirming || isConfirmed}
                className="w-full py-4 bg-white text-black font-black uppercase rounded-2xl text-xs flex items-center justify-center gap-3 hover:bg-yellow-400 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isConfirming ? "Mining on ARC..." : "Confirm in Wallet..."}
                  </>
                ) : isConfirmed ? (
                    "Success! Redirecting..."
                ) : (
                  <>
                    <Rocket className="w-4 h-4" /> 
                    Deploy to ARC Network
                  </>
                )}
              </button>
              
              {status && !isPending && !isConfirming && (
                <p className="text-[10px] text-zinc-600 font-bold uppercase text-center animate-pulse tracking-widest">
                  {status}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}