/* eslint-disable @next/next/no-img-element */
'use client'

import { useParams } from 'next/navigation'
import { useReadContract, useBalance, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi'
import { useAccount } from 'wagmi'
import { useState, useEffect, useMemo } from 'react'
import { parseEther, formatEther, formatUnits, isAddress } from 'viem'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import TradeTable from "@/components/TradeTable"
import PriceChart from "@/components/PriceChart"
import { FACTORY_ADDRESS, FACTORY_ABI } from '@/config/contract'
import TokenComments from "@/components/TokenComments"
import { Settings2, Globe, Send, X, Copy, Check, User } from 'lucide-react'

const GET_TOKEN_TRADES = gql`
  query GetTokenTrades($token: String!) {
    Token(where: { id: { _ilike: $token } }) {
      id
      name
      symbol
      ipfsCID
      currentSupply
     
    }
    Factory_Trade(
      where: { tokenAddress: { _ilike: $token } }
      order_by: { timestamp: desc }
      limit: 1000
    ) {
      id
      user
      tokenAmount
      usdcAmount
      isBuy
      timestamp
    }
  }
`;

const ERC20_ABI = [
    { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "ipfsCID", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }
] as const

export default function TokenPage() {
    const params = useParams()
    const { address: userAddress } = useAccount()
    const rawAddress = params.address as string;
    const tokenAddress = isAddress(rawAddress) ? rawAddress.toLowerCase() : "";

    const [isBuy, setIsBuy] = useState(true)
    const [amount, setAmount] = useState("")
    const [slippage, setSlippage] = useState(1)
    const [showSlippage, setShowSlippage] = useState(false)
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)
    const [liveTrades, setLiveTrades] = useState<any[]>([])
    const [resolvedImage, setResolvedImage] = useState<string | null>(null)
    const [copiedType, setCopiedType] = useState<'token' | 'creator' | null>(null)
    const [ath, setAth] = useState(0);

    const [metadata, setMetadata] = useState<{
        description?: string;
        twitter?: string;
        telegram?: string;
        website?: string;
    }>({})

    const { data: indexerData, loading: indexerLoading, error: indexerError, refetch: refetchIndexer } = useQuery<any>(GET_TOKEN_TRADES, {
        variables: { token: tokenAddress },
        skip: !tokenAddress,
        pollInterval: 5000,
    })
    console.log("GraphQL Error:", indexerError);
    const token = indexerData?.Token?.[0];

    // --- UTILS ---
    const copyToClipboard = (text: string, type: 'token' | 'creator') => {
        navigator.clipboard.writeText(text);
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 2000);
    }

    // --- CANDLE AGGREGATION (OHLC) ---
    const candleData = useMemo(() => {
        const trades = [...(indexerData?.Factory_Trade || [])].reverse();
        if (trades.length === 0) return [];

        const buckets: any = {};
        const interval = 300; // 5 minute buckets

        trades.forEach((t: any) => {
            const time = Math.floor(Number(t.timestamp)) - (Math.floor(Number(t.timestamp)) % interval);
            const tokenAmt = parseFloat(formatEther(BigInt(t.tokenAmount || "0")));
            const usdcAmt = parseFloat(formatEther(BigInt(t.usdcAmount || "0")));
            const price = tokenAmt > 0 ? usdcAmt / tokenAmt : 0;

            if (price === 0) return;

            if (!buckets[time]) {
                buckets[time] = { time, open: price, high: price, low: price, close: price };
            } else {
                buckets[time].high = Math.max(buckets[time].high, price);
                buckets[time].low = Math.min(buckets[time].low, price);
                buckets[time].close = price;
            }
        });
        return Object.values(buckets);
    }, [indexerData]);

  
  const stats = useMemo(() => {
        const trades = indexerData?.Factory_Trade || [];
        if (trades.length === 0 || !token) return { mcap: 0 };

        const trade0 = trades[0];
        const currentPrice = parseFloat(formatEther(BigInt(trade0.usdcAmount))) / parseFloat(formatEther(BigInt(trade0.tokenAmount)));
        const supply = parseFloat(formatEther(BigInt(token.currentSupply || "0")));
        
        return { mcap: supply * currentPrice };
    }, [indexerData, token]);

    useEffect(() => {
        if (stats.mcap > ath) {
            setAth(stats.mcap);
        }
    }, [stats.mcap, ath]);

    const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: userAddress ? [userAddress] : undefined,
        query: { enabled: !!userAddress && !!tokenAddress }
    })

    const { data: usdcBalance, refetch: refetchUsdcBalance } = useBalance({
        address: userAddress,
        query: { enabled: !!userAddress }
    })

    useWatchContractEvent({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        eventName: 'Trade',
        onLogs(logs: any) {
            logs.forEach((log: any) => {
                const { tokenAddress: eventToken, user, tokenAmount, usdcAmount, isBuy: eventIsBuy } = log.args;
                if (eventToken?.toLowerCase() === tokenAddress) {
                    const newTrade = {
                        trader: user,
                        amount: tokenAmount,
                        price: usdcAmount,
                        isBuy: eventIsBuy,
                        hash: log.transactionHash.toLowerCase(),
                        timestamp: Date.now(),
                    };
                    setLiveTrades(prev => {
                        if (prev.some(t => t.hash === newTrade.hash)) return prev;
                        return [newTrade, ...prev].slice(0, 50);
                    });
                    setTimeout(() => refetchIndexer(), 2000);
                    refetchTokenBalance(); refetchUsdcBalance();
                }
            });
        },
    });

    useEffect(() => {
        const resolveIpfs = async () => {
            if (!token?.ipfsCID) return;
            const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || 'maroon-added-newt-1.mypinata.cloud';
            const tokenKey = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;
            try {
                const res = await fetch(`https://${gateway}/ipfs/${token.ipfsCID}?pinataGatewayToken=${tokenKey}`);
                const data = await res.json();
                const rawImage = data?.image || token?.ipfsCID;
                const cleanCID = rawImage?.replace('ipfs://', '').split('ipfs/').pop().split('?')[0];
                setResolvedImage(`https://${gateway}/ipfs/${cleanCID}?pinataGatewayToken=${tokenKey}`);
                setMetadata({
                    description: data?.description || "",
                    twitter: data?.twitter || data?.extensions?.twitter || "",
                    telegram: data?.telegram || data?.extensions?.telegram || "",
                    website: data?.website || data?.extensions?.website || "",
                })
            } catch (e) {
                setResolvedImage(`https://ipfs.io/ipfs/${token.ipfsCID}`);
            }
        };
        resolveIpfs();
    }, [token?.ipfsCID]);

    const allTrades = useMemo(() => {
        const uniqueMap = new Map();
        indexerData?.Factory_Trade?.forEach((trade: any) => {
            const fingerprint = `${trade.user}-${trade.tokenAmount}-${trade.isBuy}`.toLowerCase();
            uniqueMap.set(fingerprint, {
                trader: trade.user,
                amount: BigInt(trade.tokenAmount || "0"),
                price: BigInt(trade.usdcAmount || "0"),
                isBuy: trade.isBuy,
                hash: trade.transactionHash || trade.id,
                timestamp: Number(trade.timestamp) * 1000
            });
        });
        liveTrades.forEach((trade) => {
            const fingerprint = `${trade.trader}-${trade.amount}-${trade.isBuy}`.toLowerCase();
            if (!uniqueMap.has(fingerprint)) uniqueMap.set(fingerprint, trade);
        });
        return Array.from(uniqueMap.values()).sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
    }, [indexerData, liveTrades]);

    const isInsufficient = useMemo(() => {
        if (!amount || !userAddress || !token) return false;
        try {
            const val = parseEther(amount);
            return isBuy ? (usdcBalance?.value || 0n) < val : (tokenBalance || 0n) < val;
        } catch { return false; }
    }, [amount, isBuy, usdcBalance, tokenBalance, userAddress, token]);

    const { writeContractAsync } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

    useEffect(() => {
        if (isSuccess) {
            refetchTokenBalance(); refetchUsdcBalance(); refetchIndexer();
            setAmount(""); setTxHash(undefined);
        }
    }, [isSuccess, refetchTokenBalance, refetchUsdcBalance, refetchIndexer]);

    const handleTrade = async () => {
        if (!amount || isInsufficient) return
        try {
            const val = parseEther(amount);
            const hash = await writeContractAsync({
                address: FACTORY_ADDRESS as `0x${string}`,
                abi: FACTORY_ABI,
                functionName: isBuy ? 'buyToken' : 'sellToken',
                args: isBuy ? [tokenAddress as `0x${string}`] : [tokenAddress as `0x${string}`, val],
                value: isBuy ? val : 0n,
            })
            setTxHash(hash)
        } catch (error) { console.error("Trade Error:", error) }
    }
    console.log("Raw:", rawAddress, "Parsed:", tokenAddress, "Data:", indexerData);

    if (indexerLoading && !token) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-yellow-400 uppercase">Loading Data...</div>
    if (!token) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-red-500 uppercase">Token Not Found</div>

    const progress = (Number(token.currentSupply || 0) / 1e27) * 100;
    const isGraduated = progress >= 100;

    return (
        <main className="min-h-screen bg-black text-white font-mono">
            <div className="max-w-[1600px] mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* LEFT COLUMN: TOKEN INFO & CHART */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex gap-6">
                            <div className="relative w-24 h-24 shrink-0 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                                {resolvedImage ? <img src={resolvedImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full animate-pulse bg-zinc-700" />}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-black text-yellow-400 uppercase leading-tight">{token.name} <span className="text-zinc-500 text-xl">${token.symbol}</span></h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <button onClick={() => copyToClipboard(tokenAddress, 'token')} className="flex items-center gap-1.5 text-[10px] bg-black px-2 py-1 rounded border border-zinc-800 hover:border-zinc-600 transition-all text-zinc-400">
                                        {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
                                        {copiedType === 'token' ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                                    </button>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold border-l border-zinc-800 pl-3">
                                       
                                     
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    {metadata?.website && <a href={metadata.website} target="_blank" className="p-1.5 bg-zinc-800 rounded hover:text-yellow-400"><Globe size={14} /></a>}
                                    {metadata?.twitter && <a href={metadata.twitter} target="_blank" className="p-1.5 bg-zinc-800 rounded hover:text-white"><X size={14} /></a>}
                                    {metadata?.telegram && <a href={metadata.telegram} target="_blank" className="p-1.5 bg-zinc-800 rounded hover:text-sky-400"><Send size={14} /></a>}
                                </div>
                            </div>
                        </div>

                        {/* STATS OVERLAY */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 px-6 py-2 border-l border-zinc-800/50">
                            <div>
                                <p className="text-[9px] text-zinc-500 uppercase font-black mb-1">Market Cap</p>
                                <p className="text-xl font-black">${stats.mcap.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-zinc-500 uppercase font-black mb-1">ATH</p>
                                <p className="text-xl font-black text-green-400">${ath.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div className="hidden md:block">
                                <p className="text-[9px] text-zinc-500 uppercase font-black mb-1">Bonding</p>
                                <p className="text-xl font-black text-yellow-400">{progress.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    {/* OHLC CHART CONTAINER */}
                    <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl overflow-hidden h-[500px] relative">
                        <div className="absolute top-4 left-6 z-10 flex gap-2">
                            <span className="text-[10px] font-black text-zinc-500 bg-black/50 px-2 py-1 rounded border border-zinc-800">CANDLES / 5M</span>
                        </div>
                        <PriceChart data={candleData} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TradeTable tokenAddress={tokenAddress} trades={allTrades} />

                        {/* TOP HOLDERS PANEL */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
                            <h3 className="text-xs font-black uppercase text-zinc-400 mb-6 flex items-center gap-2">
                                <div className="w-1 h-3 bg-yellow-400" /> Top Holders
                            </h3>
                            <div className="space-y-4">
                                {[{ addr: token.owner, label: 'Creator', percent: '5.20%' }, { addr: '0x71C...32f1', label: 'Whale', percent: '2.15%' }].map((holder, i) => (
                                    <div key={i} className="flex justify-between items-center text-[11px] border-b border-zinc-800/50 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-zinc-300">{holder.addr?.slice(0, 10)}...</span>
                                            <span className="bg-zinc-800 text-[8px] px-1 rounded text-zinc-500 uppercase">{holder.label}</span>
                                        </div>
                                        <span className="font-bold text-yellow-400">{holder.percent}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <TokenComments tokenAddress={tokenAddress} />
                </div>

                {/* RIGHT COLUMN: TRADING TERMINAL */}
                <div className="lg:col-span-1">
                    <div className="bg-zinc-900 border border-yellow-400/20 p-6 rounded-2xl sticky top-24">
                        {isGraduated ? (
                            <div className="py-8 text-center">
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h2 className="text-2xl font-black uppercase">Graduated!</h2>
                                <p className="text-[10px] text-zinc-500 mt-2 mb-8">This token has reached 100% bonding</p>
                                <a href={`https://explorer.arc.network/address/${tokenAddress}`} target="_blank" className="block w-full bg-white text-black font-black py-4 rounded-xl uppercase text-xs text-center hover:bg-zinc-200 transition-colors">View on Explorer</a>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex gap-2 p-1 bg-black rounded-xl flex-1 mr-4">
                                        <button onClick={() => setIsBuy(true)} className={`flex-1 py-2 font-black rounded-lg text-[10px] ${isBuy ? 'bg-green-500 text-black' : 'text-zinc-500'}`}>BUY</button>
                                        <button onClick={() => setIsBuy(false)} className={`flex-1 py-2 font-black rounded-lg text-[10px] ${!isBuy ? 'bg-red-500 text-white' : 'text-zinc-500'}`}>SELL</button>
                                    </div>
                                    <button onClick={() => setShowSlippage(!showSlippage)} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                                        <Settings2 className={`w-4 h-4 ${showSlippage ? 'text-yellow-400' : 'text-zinc-500'}`} />
                                    </button>
                                </div>

                                {showSlippage && (
                                    <div className="mb-6 p-4 bg-black rounded-xl border border-zinc-800 animate-in fade-in slide-in-from-top-1">
                                        <label className="text-[9px] text-zinc-500 uppercase font-black">Slippage Tolerance</label>
                                        <div className="flex gap-2 mt-2">
                                            {[0.5, 1, 3, 5].map((val) => (
                                                <button key={val} onClick={() => setSlippage(val)} className={`flex-1 py-1 text-[10px] rounded border ${slippage === val ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' : 'border-zinc-800 text-zinc-500'}`}>{val}%</button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-bold px-1">
                                        <span className="text-zinc-500 uppercase">Wallet Balance</span>
                                        <span className="text-yellow-400">
                                            {isBuy ? `${Number(formatUnits(usdcBalance?.value || 0n, 18)).toFixed(4)} USDC` : `${Number(formatEther(tokenBalance || 0n)).toFixed(2)} ${token.symbol}`}
                                        </span>
                                    </div>
                                    <div className={`bg-black p-4 rounded-xl border transition-all ${isInsufficient ? 'border-red-500/50' : 'border-zinc-800 focus-within:border-yellow-400/50'}`}>
                                        <label className="text-[10px] text-zinc-500 uppercase font-bold">{isBuy ? 'Pay USDC' : `Sell ${token.symbol}`}</label>
                                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="bg-transparent text-xl font-bold focus:outline-none w-full text-white mt-1" />
                                    </div>
                                    <button disabled={!amount || isConfirming || isInsufficient} onClick={handleTrade} className={`w-full py-4 font-black rounded-xl uppercase text-sm transition-all ${isInsufficient ? 'bg-red-500/10 text-red-500 border border-red-500/20' : isBuy ? 'bg-yellow-400 text-black' : 'bg-white text-black'} disabled:opacity-50`}>
                                        {isInsufficient ? 'Insufficient Balance' : isConfirming ? "Confirming..." : (isBuy ? 'Place Buy Order' : 'Place Sell Order')}
                                    </button>
                                </div>
                            </>
                        )}
                        <div className="mt-8 pt-6 border-t border-zinc-800 space-y-3 text-xs">
                            <div className="flex justify-between items-center font-bold">
                                <span className="text-zinc-500 uppercase">Bonding Progress</span>
                                <span className="text-yellow-400">{progress.toFixed(2)}%</span>
                            </div>
                            <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-zinc-800">
                                <div className={`h-full transition-all duration-1000 ${isGraduated ? 'bg-green-500' : 'bg-yellow-400'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}