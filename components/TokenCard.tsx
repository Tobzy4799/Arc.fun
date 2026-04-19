'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface TokenCardProps {
    token: {
        id: string
        name: string
        symbol: string
        ipfsCID: string
        creator: string
        currentSupply: string | number
        reserveUSDC: string | number
    },
    variant?: 'default' | 'king'
}

export default function TokenCard({ token, variant = 'default' }: TokenCardProps) {
    const [resolvedImage, setResolvedImage] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || 'maroon-added-newt-1.mypinata.cloud';
    const tokenKey = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;

    const progress = (Number(token.currentSupply) / 1e27) * 100;
    const isKing = variant === 'king';

    useEffect(() => {
        async function resolveIpfs() {
            if (!token?.ipfsCID) return;
            try {
                const res = await fetch(`https://${gateway}/ipfs/${token.ipfsCID}?pinataGatewayToken=${tokenKey}`);
                const metadata = await res.json();

                if (metadata.description) {
                    setDescription(metadata.description);
                }

                if (metadata.image) {
                    let cleanCID = metadata.image;
                    if (cleanCID.includes('ipfs/')) {
                        cleanCID = cleanCID.split('ipfs/').pop();
                    } else if (cleanCID.includes('ipfs://')) {
                        cleanCID = cleanCID.replace('ipfs://', '');
                    }
                    cleanCID = cleanCID.split('?')[0];
                    setResolvedImage(`https://${gateway}/ipfs/${cleanCID}?pinataGatewayToken=${tokenKey}`);
                } else {
                    setResolvedImage(`https://${gateway}/ipfs/${token.ipfsCID}?pinataGatewayToken=${tokenKey}`);
                }
            } catch (e) {
                setResolvedImage(`https://${gateway}/ipfs/${token.ipfsCID}?pinataGatewayToken=${tokenKey}`);
            }
        }
        resolveIpfs();
    }, [token.ipfsCID, gateway, tokenKey]);

    return (
        <Link href={`/token/${token.id}`}>
            <div className={`bg-zinc-900 border ${isKing ? 'border-yellow-400/50' : 'border-zinc-800'} rounded-xl overflow-hidden hover:border-yellow-400 transition-all group p-4 flex ${isKing ? 'flex-col md:flex-row gap-6' : 'gap-4'}`}>

                <div className={`${isKing ? 'w-full md:w-40 h-40' : 'w-24 h-24'} relative rounded-lg overflow-hidden bg-zinc-800 shrink-0`}>
                    {resolvedImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={resolvedImage}
                            alt={token.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full animate-pulse bg-zinc-700" />
                    )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start">
                        <h3 className={`font-black text-white truncate uppercase ${isKing ? 'text-2xl' : 'text-sm'}`}>
                            {token.name} <span className="text-zinc-500 font-mono text-xs font-normal">${token.symbol}</span>
                        </h3>
                    </div>

                    <p className="text-zinc-500 text-[9px] mb-2 truncate opacity-60">
                        BY: {token.creator.slice(0, 6)}...{token.creator.slice(-4)}
                    </p>

                    {description && (
                        <p className={`text-zinc-400 text-[10px] italic mb-3 line-clamp-2 leading-relaxed`}>
                            {description}
                        </p>
                    )}

                    <div className="space-y-2 mt-auto">
                        <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-zinc-500 uppercase">Bonding Curve Progress</span>
                            <span className="text-yellow-400">{progress.toFixed(2)}%</span>
                        </div>
                        <div className={`w-full bg-black rounded-full overflow-hidden border border-zinc-800 ${isKing ? 'h-3' : 'h-1.5'}`}>
                            <div
                                className="bg-yellow-400 h-full transition-all duration-700 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className={`mt-4 pt-3 border-t border-zinc-800/50 flex justify-between items-center`}>
                        <p className="text-white font-mono text-[10px] font-bold">
                            Market Cap: <span className="text-yellow-400">
                                {(() => {
                                    // Change 1e6 to 1e18 below if your USDC is 18 decimals
                                    const rawValue = Number(token.reserveUSDC || 0) / 1e18;

                                    if (rawValue === 0) return "$0.00";

                                    if (rawValue >= 1000000) {
                                        return `$${(rawValue / 1000000).toFixed(2)}m`;
                                    } else if (rawValue >= 1000) {
                                        return `$${(rawValue / 1000).toFixed(2)}k`;
                                    } else {
                                        return `$${rawValue.toFixed(2)}`;
                                    }
                                })()}
                            </span>
                        </p>
                        {isKing && <span className="text-[10px] text-yellow-400 font-black tracking-widest animate-pulse uppercase">Live Leader</span>}
                    </div>
                </div>
            </div>
        </Link>
    )
}