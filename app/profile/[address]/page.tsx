'use client'

import { useParams } from 'next/navigation'
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { formatEther } from 'viem'
import Navbar from "@/components/Navbar"
import { useMemo, useState } from 'react'
import Link from 'next/link'

// --- Interfaces ---
interface PortfolioTrade {
    tokenAddress: string;
    tokenAmount: string;
    usdcAmount: string;
    isBuy: boolean;
    timestamp: string;
}

interface PortfolioToken {
    id: string;
    name: string;
    symbol: string;
}

interface UserPortfolioResponse {
    Factory_Trade: PortfolioTrade[];
    Token: PortfolioToken[];
}

const GET_USER_PORTFOLIO = gql`
  query GetUserPortfolio($user: String!) {
    Factory_Trade(where: { user: { _ilike: $user } }, order_by: { timestamp: desc }) {
      tokenAddress
      tokenAmount
      usdcAmount
      isBuy
      timestamp
    }
    Token {
      id
      name
      symbol
    }
  }
`;

export default function ProfilePage() {
    const params = useParams()
    const address = (params.address as string || "").toLowerCase()
    const [activeTab, setActiveTab] = useState<'holdings' | 'activity'>('holdings')
    const [copied, setCopied] = useState(false)

    const { data, loading, error } = useQuery<UserPortfolioResponse>(GET_USER_PORTFOLIO, {
        variables: { user: address },
        fetchPolicy: 'cache-and-network'
    })

    // Copy to Clipboard Logic
    const copyToClipboard = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Process Holdings & Total Stats
    const { holdings, totalTrades } = useMemo(() => {
        if (!data?.Factory_Trade || !data?.Token) return { holdings: [], totalTrades: 0 }
        
        const balanceMap = new Map<string, { name: string, symbol: string, balance: bigint }>()

        data.Factory_Trade.forEach((trade) => {
            const tokenInfo = data.Token.find(t => t.id.toLowerCase() === trade.tokenAddress.toLowerCase())
            if (!tokenInfo) return
            
            const current = balanceMap.get(trade.tokenAddress) || { 
                name: tokenInfo.name, 
                symbol: tokenInfo.symbol, 
                balance: 0n 
            }

            if (trade.isBuy) {
                current.balance += BigInt(trade.tokenAmount)
            } else {
                current.balance -= BigInt(trade.tokenAmount)
            }
            balanceMap.set(trade.tokenAddress, current)
        })

        const filteredHoldings = Array.from(balanceMap.entries())
            .map(([addr, info]) => ({ address: addr, ...info }))
            .filter(t => t.balance > 1000000000000000n)

        return { 
            holdings: filteredHoldings, 
            totalTrades: data.Factory_Trade.length 
        }
    }, [data])

    if (loading) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono animate-pulse">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <p className="tracking-widest uppercase font-black text-xs text-yellow-400">Syncing Terminal...</p>
            </div>
        </div>
    )

    return (
        <main className="min-h-screen bg-black text-white font-mono pb-20">
            
            <div className="max-w-5xl mx-auto p-6">
                {/* Header / Identity Section */}
                <div className="flex flex-col md:flex-row gap-8 items-center mb-10 p-8 bg-zinc-900/10 rounded-[2.5rem] border border-zinc-800/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[100px] -z-10" />
                    
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 shrink-0 shadow-2xl shadow-yellow-400/20 border-4 border-black" />
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-block px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full mb-3">
                            <span className="text-[10px] text-yellow-400 font-black uppercase tracking-[0.2em]">Verified Trader</span>
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">My Profile</h1>
                        
                        {/* Copy Address Button */}
                        <button 
                            onClick={copyToClipboard}
                            className="group flex items-center gap-2 mx-auto md:mx-0 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 transition-all active:scale-95"
                        >
                            <p className="text-zinc-500 text-[10px] break-all font-bold uppercase tracking-widest group-hover:text-zinc-300">
                                {copied ? "COPIED TO CLIPBOARD" : `ID: ${address}`}
                            </p>
                            {!copied && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-zinc-600 group-hover:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex-1 md:flex-none bg-black border border-zinc-800 p-5 rounded-3xl text-center min-w-[140px]">
                            <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Total Assets</p>
                            <p className="text-2xl font-black text-white">{holdings.length}</p>
                        </div>
                        <div className="flex-1 md:flex-none bg-black border border-zinc-800 p-5 rounded-3xl text-center min-w-[140px]">
                            <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Total Trades</p>
                            <p className="text-2xl font-black text-blue-400">{totalTrades}</p>
                        </div>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-8 bg-zinc-900/30 p-2 rounded-2xl w-fit border border-zinc-800/50">
                    <button 
                        onClick={() => setActiveTab('holdings')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all duration-300 ${activeTab === 'holdings' ? 'bg-white text-black scale-105 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Portfolio
                    </button>
                    <button 
                        onClick={() => setActiveTab('activity')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase transition-all duration-300 ${activeTab === 'activity' ? 'bg-white text-black scale-105 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                        History
                    </button>
                </div>

                {/* Content Area */}
                <div className="grid gap-4">
                    {activeTab === 'holdings' ? (
                        holdings.length === 0 ? (
                            <div className="p-24 text-center bg-zinc-900/10 rounded-[3rem] border-2 border-dashed border-zinc-800/50">
                                <div className="text-4xl mb-4 text-zinc-800 font-black italic uppercase">Empty Bag</div>
                                <p className="text-zinc-600 font-bold uppercase text-xs tracking-[0.3em]">Market is waiting for you</p>
                            </div>
                        ) : (
                            holdings.map((token) => (
                                <div key={token.address} className="group bg-zinc-900/20 border border-zinc-800 p-6 rounded-[2rem] flex justify-between items-center hover:bg-zinc-900/40 hover:border-yellow-400/50 transition-all duration-500">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center font-black text-yellow-400 text-2xl border border-zinc-800 group-hover:border-yellow-400/50 transition-colors">
                                            {token.symbol[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl uppercase tracking-tighter text-white">{token.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-yellow-400 font-bold text-[10px] uppercase tracking-widest">${token.symbol}</span>
                                                <span className="text-zinc-700 text-[10px] font-black uppercase">|</span>
                                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-tighter">{token.address.slice(0, 6)}...{token.address.slice(-4)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-white tracking-tighter">
                                            {Number(formatEther(token.balance)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </p>
                                        <Link href={`/token/${token.address}`}>
                                            <button className="mt-3 text-[10px] bg-white text-black px-6 py-2 rounded-full font-black uppercase hover:bg-yellow-400 transition-all transform hover:scale-110 active:scale-95">
                                                Trade
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        /* Activity Feed */
                        <div className="bg-zinc-900/10 rounded-[2rem] border border-zinc-800/50 overflow-hidden">
                            {data?.Factory_Trade?.map((trade, i) => {
                                const token = data.Token.find(t => t.id.toLowerCase() === trade.tokenAddress.toLowerCase());
                                return (
                                    <div key={i} className="flex items-center justify-between p-6 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-10 rounded-full ${trade.isBuy ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'}`} />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${trade.isBuy ? 'text-green-500' : 'text-red-500'}`}>
                                                        {trade.isBuy ? 'Bought' : 'Sold'} {token?.symbol || 'Token'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-500 font-bold uppercase mt-1 tracking-tight">
                                                    {new Date(Number(trade.timestamp) * 1000).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className="text-lg font-black text-white tracking-tighter">
                                                {Number(formatEther(BigInt(trade.tokenAmount))).toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-zinc-600 font-black uppercase">Tokens</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}