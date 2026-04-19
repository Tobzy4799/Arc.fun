'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase'

interface Comment {
  id: string
  user_address: string
  content: string
  created_at: string
}

export default function TokenComments({ tokenAddress }: { tokenAddress: string }) {
  const { address } = useAccount()
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])

  // 1. Fetch & Realtime Subscription
  useEffect(() => {
    if (!tokenAddress) return

    // Initial Fetch
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('token_address', tokenAddress)
        .order('created_at', { ascending: false })
      
      if (data) setComments(data)
      if (error) console.error("Fetch error:", error)
    }

    fetchComments()

    // Realtime Listener
    const channel = supabase
      .channel(`comments-${tokenAddress}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `token_address=eq.${tokenAddress}`,
        },
        (payload) => {
          setComments((prev) => [payload.new as Comment, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tokenAddress])

  // 2. Handle Posting
  const handlePostComment = async () => {
    if (!comment.trim() || !address) return
    setIsSubmitting(true)

    const { error } = await supabase
      .from('comments')
      .insert([
        { 
          token_address: tokenAddress, 
          user_address: address, 
          content: comment 
        }
      ])

    if (error) {
      alert("Error posting comment: " + error.message)
    } else {
      setComment("")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="mt-12 bg-zinc-900/10 rounded-[2.5rem] border border-zinc-800/40 p-8 backdrop-blur-sm shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
          Thread 
          <span className="bg-zinc-800 text-zinc-500 text-[10px] py-1 px-3 rounded-full font-bold">
            {comments.length}
          </span>
        </h3>
      </div>

      {/* Input Area */}
      <div className="group relative mb-12">
        <textarea 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={!address || isSubmitting}
          placeholder={address ? "Post a comment..." : "Connect wallet to comment"}
          className="w-full bg-black/40 border border-zinc-800 rounded-3xl p-6 text-sm focus:border-yellow-400/50 outline-none resize-none h-32 transition-all"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-4">
          <button 
            onClick={handlePostComment}
            disabled={!address || !comment.trim() || isSubmitting}
            className="bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black text-[10px] font-black px-6 py-2.5 rounded-xl uppercase transition-all hover:scale-105 active:scale-95"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-4 group animate-in fade-in slide-in-from-top-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-zinc-400">
                   {c.user_address.slice(0, 6)}...{c.user_address.slice(-4)}
                </span>
                <span className="text-[8px] text-zinc-700 font-bold uppercase">
                  {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-zinc-300">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}