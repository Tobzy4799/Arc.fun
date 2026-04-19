// app/guidelines/page.tsx
export default function GuidelinesPage() {
  const rules = [
    { 
        title: "Fair Launch", 
        desc: "No pre-sales. No insiders. The creator and the community buy on the same terms." 
    },
    { 
        title: "The Bonding Curve", 
        desc: "Price is determined by supply. As more people buy, the price follows a mathematical curve upward." 
    },
    { 
        title: "Graduation (Beta Phase)", 
        desc: "When the curve hits 100%, trading on the curve completes. On mainnet, this triggers a liquidity migration to ARC Swap." 
    },
    { 
        title: "Anti-Rug Mechanics", 
        desc: "Liquidity is handled by the smart contract. There are no LP tokens for developers to pull." 
    },
    { 
        title: "Testnet Assets", 
        desc: "ARC.FUN is currently in Beta. All tokens and USDC used here are for testing purposes only." 
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white font-mono p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <section className="space-y-4">
          <h1 className="text-5xl font-black text-yellow-400 uppercase tracking-tighter">
            Protocol <br/>Guidelines
          </h1>
          <p className="text-zinc-500 max-w-xl text-sm">
            ARC.FUN is designed to make token launches safe, fair, and fun. 
            Follow these rules to understand the bonding curve mechanics.
          </p>
        </section>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule, i) => (
            <div key={i} className="group p-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-yellow-400/50 transition-all">
              <span className="text-[10px] text-yellow-400 font-bold mb-4 block">0{i + 1} </span>
              <h2 className="text-xl font-black uppercase mb-3">{rule.title}</h2>
              <p className="text-zinc-500 text-xs leading-relaxed group-hover:text-zinc-300 transition-colors">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Start Footer */}
        <div className="border-t border-zinc-800 pt-12">
            <h3 className="text-sm font-black uppercase mb-6 text-zinc-400">Quick Start</h3>
            <div className="flex flex-col md:flex-row gap-8 text-[11px] font-bold text-zinc-500 uppercase">
                <div className="flex gap-3 items-center"><span className="text-white bg-zinc-800 px-2 py-1 rounded">1</span> Connect Wallet</div>
                <div className="flex gap-3 items-center"><span className="text-white bg-zinc-800 px-2 py-1 rounded">2</span> Choose a Moonshot</div>
                <div className="flex gap-3 items-center"><span className="text-white bg-zinc-800 px-2 py-1 rounded">3</span> Ride the Curve</div>
            </div>
        </div>
      </div>
    </main>
  );
}