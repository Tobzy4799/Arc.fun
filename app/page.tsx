'use client'

import Navbar from "@/components/Navbar";
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react'
import Link from "next/link";
import { useState, useEffect, useMemo } from 'react';
import { useWatchContractEvent } from 'wagmi';
import TokenCard from "@/components/TokenCard"; 
import { FACTORY_ADDRESS, FACTORY_ABI } from '@/config/contract'
import { Search, ArrowUpDown } from 'lucide-react'; // Ensure lucide-react is installed

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    Token(order_by: { reserveUSDC: desc }) {
      id
      name
      symbol
      ipfsCID
      currentSupply
      reserveUSDC
      creator
    }
    Factory_Trade(order_by: { timestamp: desc }, limit: 20) {
      id
      user
      isBuy
      timestamp
      tokenAddress
    }
  }
`;

interface Token {
  id: string;
  name: string;
  symbol: string;
  ipfsCID: string;
  currentSupply: string | number;
  reserveUSDC: string | number;
  creator: string;
}

interface Trade {
  id: string;
  user: string;
  isBuy: boolean;
  timestamp: string | number;
  tokenAddress: string;
}

interface DashboardData {
  Token: Token[];
  Factory_Trade: Trade[];
}

const BANNED_TOKENS: string[] = ["0xF7E235ad44c08819819EAaeD1734b7344c4f4B0E"];

export default function DashboardPage() {
  const [liveTrades, setLiveTrades] = useState<Trade[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"marketcap" | "newest">("marketcap");
  
  const { data, loading, error, refetch } = useQuery<DashboardData>(GET_DASHBOARD_DATA, {
    pollInterval: 5000, 
    notifyOnNetworkStatusChange: false,
  });

  const displayTrades = useMemo(() => {
    const historicalTrades = data?.Factory_Trade || [];
    const combined = [...liveTrades, ...historicalTrades];
    const uniqueTrades = combined.reduce((acc: Trade[], current) => {
      const exists = acc.find(item => item.id === current.id);
      if (!exists) return acc.concat([current]);
      return acc;
    }, []);

    return uniqueTrades
      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
      .slice(0, 20);
  }, [data?.Factory_Trade, liveTrades]);

  // --- FILTERED AND SORTED TOKENS ---
  const filteredTokens = useMemo(() => {
    let list = (data?.Token?.filter(t => !BANNED_TOKENS.includes(t.id)) || []);
    
    if (searchQuery) {
      list = list.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === "newest") {
       // Since your indexer might not have timestamp on Token, we assume ID order or reserve as proxy 
       // If your schema has timestamp, use: return Number(b.timestamp) - Number(a.timestamp)
       return [...list].reverse(); 
    }
    
    return list; // Default reserveUSDC desc from GQL
  }, [data?.Token, searchQuery, sortBy]);

  const king = filteredTokens[0];
  const listTokens = filteredTokens.slice(1);

  useWatchContractEvent({
    address: FACTORY_ADDRESS as `0x${string}`,
    abi: FACTORY_ABI,
    eventName: 'Trade',
    onLogs(logs) {
      const newLog = logs[0];
      if (!newLog) return;
      const tradeId = newLog.transactionHash;
      setLiveTrades(prev => {
        if (prev.find(t => t.id === tradeId)) return prev;
        const newTrade: Trade = {
          id: tradeId,
          user: newLog.args.user as string,
          isBuy: newLog.args.isBuy as boolean,
          timestamp: Math.floor(Date.now() / 1000),
          tokenAddress: newLog.args.tokenAddress as string
        };
        return [newTrade, ...prev];
      });
      refetch(); 
    },
  });

  return (
    <main className="min-h-screen bg-black text-white font-mono">
      
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="flex flex-col items-center justify-center py-12 border-b border-zinc-800 mb-12">
          <Link href="/create" className="group relative">
            <div className="absolute -inset-1 bg-yellow-400 rounded blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
            <button className="relative px-8 py-4 bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all text-xl font-black rounded-lg uppercase">
              [ LAUNCH A NEW COIN ]
            </button>
          </Link>
          <p className="text-zinc-600 text-[9px] mt-4 uppercase tracking-[0.2em]">Arc Network Testnet Environment</p>
        </div>

        {/* SEARCH AND SORT UI */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or ticker..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-xs focus:border-yellow-400/50 outline-none transition-all"
              />
           </div>
           <div className="flex bg-zinc-900/50 border border-zinc-800 rounded-xl p-1">
              <button 
                onClick={() => setSortBy("marketcap")}
                className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${sortBy === 'marketcap' ? 'bg-zinc-800 text-yellow-400' : 'text-zinc-500'}`}
              >
                MARKET CAP
              </button>
              <button 
                onClick={() => setSortBy("newest")}
                className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${sortBy === 'newest' ? 'bg-zinc-800 text-yellow-400' : 'text-zinc-500'}`}
              >
                NEWEST
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-12">
            {king && !searchQuery && (
              <section className="relative p-[1px] rounded-2xl bg-zinc-800 hover:bg-yellow-400/50 transition-colors">
                <div className="bg-zinc-950 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="bg-yellow-400 text-black px-3 py-1 text-[10px] font-black rounded-full shadow-[0_0_10px_rgba(250,204,21,0.4)]">👑 KING OF THE HILL</span>
                  </div>
                  <TokenCard token={king} variant="king" />
                </div>
              </section>
            )}

            <div>
              <h3 className="text-zinc-500 text-[10px] font-black uppercase mb-6 tracking-[0.3em] flex items-center gap-4">
                <span>{searchQuery ? 'Search Results' : 'Trending Feed'}</span>
                <div className="h-[1px] flex-1 bg-zinc-900"></div>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(searchQuery ? filteredTokens : listTokens).map((token) => (
                  <TokenCard key={token.id} token={token} />
                ))}
              </div>
            </div>
          </div>

          {/* LIVE ACTIVITY SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase text-yellow-400 tracking-tighter">Live Trades Activity</h3>
                <div className="flex gap-1">
                    <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse delay-75"></span>
                </div>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 h-[650px] overflow-y-auto space-y-4 custom-scrollbar">
                {displayTrades.map((trade) => (
                  <div key={trade.id} className="text-[10px] border-b border-zinc-800/30 pb-3 group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-zinc-500 font-mono">{trade.user.slice(0,6)}...{trade.user.slice(-4)}</span>
                      <span className="text-zinc-700 text-[8px] italic">
                        {new Date(Number(trade.timestamp) * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={trade.isBuy ? "text-green-500 font-black" : "text-red-500 font-black"}>
                            {trade.isBuy ? "BUY" : "SELL"}
                        </span>
                        <span className="text-zinc-400">on</span>
                        <span className="text-zinc-200 truncate font-bold">{trade.tokenAddress.slice(0,8)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </main>
  );
}