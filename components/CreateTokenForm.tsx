'use client'

import { useState } from 'react'
import { useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { uploadMetadata } from '@/app/actions/upload'
import { FACTORY_ADDRESS, FACTORY_ABI } from '@/config/contract'

export default function CreateTokenForm() {
  const { isConnected } = useAccount()
  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const [status, setStatus] = useState("")
  const [formData, setFormData] = useState({ 
    name: '', 
    ticker: '', 
    description: '',
    twitter: '',
    telegram: '',
    website: ''
  })
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) return alert("Please connect your wallet first!")
    if (!file) return alert("Please upload a meme image!")

    setStatus("Uploading to IPFS...")
    
    const data = new FormData()
    data.append("file", file)
    data.append("name", formData.name)
    data.append("ticker", formData.ticker)
    data.append("description", formData.description)
    // Adding the new social fields
    data.append("twitter", formData.twitter)
    data.append("telegram", formData.telegram)
    data.append("website", formData.website)

    const result = await uploadMetadata(data)

    if (result.success && result.ipfsCID) {
      setStatus("Confirm transaction in wallet...")
      writeContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'createToken',
        args: [formData.name, formData.ticker, result.ipfsCID],
      })
    } else {
      setStatus("Failed to upload to IPFS.")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-xl w-full bg-zinc-900/50 p-8 border border-zinc-800 rounded-2xl">
      <h2 className="text-2xl font-black text-yellow-400 mb-6">[ LAUNCH A NEW COIN ]</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Token Name" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-white outline-none focus:border-yellow-400" onChange={handleChange} required />
        <input type="text" name="ticker" placeholder="Ticker" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-white outline-none focus:border-yellow-400" onChange={handleChange} required />
        <textarea name="description" placeholder="Description / Lore" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-white outline-none focus:border-yellow-400 h-24" onChange={handleChange} required />
        
        <div className="grid grid-cols-1 gap-4">
            <input type="text" name="twitter" placeholder="Twitter/X Link (Optional)" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-white text-sm outline-none focus:border-blue-400" onChange={handleChange} />
            <input type="text" name="telegram" placeholder="Telegram Link (Optional)" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-white text-sm outline-none focus:border-sky-400" onChange={handleChange} />
            <input type="text" name="website" placeholder="Website Link (Optional)" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-white text-sm outline-none focus:border-green-400" onChange={handleChange} />
        </div>

        <input type="file" accept="image/*" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-black file:bg-yellow-400 file:text-black cursor-pointer" onChange={(e) => setFile(e.target.files?.[0] || null)} required />

        <button disabled={isPending || isConfirming || status === "Uploading to IPFS..."} type="submit" className="w-full bg-yellow-400 text-black py-4 rounded font-black text-lg disabled:bg-zinc-700 transition-all hover:bg-yellow-500">
          {isPending ? "APPROVE IN WALLET..." : isConfirming ? "MINING..." : "CREATE TOKEN"}
        </button>

        <div className="text-center mt-4 font-mono text-sm h-8">
          {status && !isPending && !isConfirming && !isConfirmed && <p className="text-zinc-500 animate-pulse">{status}</p>}
          {isConfirming && <p className="text-yellow-400 animate-pulse">Transaction pending on Arc... ⚡</p>}
          {isConfirmed && <p className="text-green-400 font-bold border border-green-400/30 bg-green-400/10 py-2 rounded">Success! Your token is live! 🚀</p>}
        </div>
      </form>
    </div>
  )
}