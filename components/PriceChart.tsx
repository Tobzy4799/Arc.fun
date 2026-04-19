'use client'

import { useEffect, useRef } from 'react'
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts'

export default function PriceChart({ data }: { data: any[] }) {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<any>(null)
    const seriesRef = useRef<any>(null)

    useEffect(() => {
        if (!chartContainerRef.current) return

        // 1. Initialize Chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#71717a',
                fontFamily: 'JetBrains Mono, monospace', // Matching your terminal vibe
            },
            grid: {
                vertLines: { color: '#18181b', style: 2 },
                horzLines: { color: '#18181b', style: 2 },
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: '#27272a',
            },
        })

        // 2. Add Candlestick Series with Degen-friendly price formatting
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            priceFormat: {
                type: 'price',
                precision: 6, // Crucial for low-value tokens
                minMove: 0.000001,
            },
        })

        chartRef.current = chart
        seriesRef.current = candlestickSeries

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth })
            }
        }
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            chart.remove()
        }
    }, [])

    useEffect(() => {
        if (!seriesRef.current || !data || data.length === 0) return

        // 3. Strict Data Cleaning for Candlesticks
        // Lightweight-charts requires sorted, unique timestamps
        const cleanedData = [...data]
            .sort((a, b) => a.time - b.time)
            .filter((value, index, self) => 
                index === self.findIndex((t) => t.time === value.time)
            )

        seriesRef.current.setData(cleanedData)
        
        // 4. Zoom to fit the action
        if (cleanedData.length > 0) {
            chartRef.current.timeScale().fitContent()
        }
    }, [data])

    return (
        <div className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 overflow-hidden relative group">
            {/* Legend / Overlay */}
            <div className="absolute top-4 left-6 z-10 flex flex-col gap-1 pointer-events-none">
                <span className="text-[10px] text-yellow-400 font-black uppercase tracking-widest">
                    Price Action // USDC
                </span>
                <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="text-[8px] text-zinc-500 font-bold uppercase">Live Terminal</span>
                    </div>
                   <div className="text-[8px] text-zinc-400 font-bold uppercase tracking-tighter bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
        Standard 5M View
    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div ref={chartContainerRef} className="w-full" />
            
            {/* Watermark */}
            <div className="absolute bottom-16 right-6 opacity-5 pointer-events-none">
                <h1 className="text-4xl font-black italic uppercase text-white">ARC.FUN</h1>
            </div>
        </div>
    )
}