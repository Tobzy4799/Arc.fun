'use client'

import { formatEther } from 'viem'

interface Trade {
    trader: string;
    amount: bigint;
    price: bigint;
    isBuy: boolean;
    hash: string;
    timestamp: number;
}

export default function TradeTable({ 
    tokenAddress,
    trades 
}: { 
    tokenAddress: string; 
    trades: Trade[] 
}) {
    // REMOVED the redundant useMemo filter here. 
    // The parent component (TokenPage) already de-duplicates using a Map.

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden mt-8">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-yellow-400 text-xs font-black uppercase tracking-widest">Live Trades</h3>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Live Feed</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono">
                    <thead>
                        <tr className="text-zinc-500 border-b border-zinc-800/50 uppercase">
                            <th className="px-4 py-3 font-bold">Account</th>
                            <th className="px-4 py-3 font-bold">Type</th>
                            <th className="px-4 py-3 font-bold">USDC</th>
                            <th className="px-4 py-3 font-bold">Tokens</th>
                            <th className="px-4 py-3 font-bold">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/30">
                        {trades.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-10 text-center text-zinc-600 italic">
                                    Waiting for transactions...
                                </td>
                            </tr>
                        ) : (
                            trades.map((trade) => (
                                <tr key={trade.hash} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-4 py-3 text-zinc-400">
                                        {trade.trader.slice(0, 6)}...{trade.trader.slice(-4)}
                                    </td>
                                    <td className={`px-4 py-3 font-bold ${trade.isBuy ? 'text-green-500' : 'text-red-500'}`}>
                                        {trade.isBuy ? 'BUY' : 'SELL'}
                                    </td>
                                    <td className="px-4 py-3 text-white">
                                        {Number(formatEther(trade.price)).toFixed(4)}
                                    </td>
                                    <td className="px-4 py-3 text-white">
                                        {Number(formatEther(trade.amount)).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-500">
                                        {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}