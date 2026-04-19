// app/support/page.tsx
import { MessageSquare, X, ExternalLink, ShieldCheck } from 'lucide-react';

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-black text-white font-mono p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <section className="text-center space-y-4 py-12">
          <h1 className="text-5xl font-black text-yellow-400 uppercase tracking-tighter">
            Support Center
          </h1>
          <p className="text-zinc-500 text-sm uppercase font-bold tracking-widest">
            ARC.FUN // TESTNET BETA
          </p>
        </section>

        {/* Support Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Discord Card */}
          <a 
            href="https://discord.com/users/tobzy4799" 
            className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl hover:bg-indigo-600/10 hover:border-indigo-500 transition-all group"
          >
            <MessageSquare className="text-indigo-500 mb-6 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-black uppercase text-lg">Community</h3>
            <p className="text-zinc-500 text-[10px] mt-2 uppercase">
              Text us on discord to know more
            </p>
          </a>

          {/* X (formerly Twitter) Card */}
          <a 
            href="https://x.com/tobzy47" 
            className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl hover:bg-white/5 hover:border-white transition-all group"
          >
            <X className="text-white mb-6 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-black uppercase text-lg">Updates</h3>
            <p className="text-zinc-500 text-[10px] mt-2 uppercase">
              Follow us on X for protocol announcements.
            </p>
          </a>

          {/* Docs/Security Card */}
          <a 
            href="#" 
            className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl hover:bg-yellow-400/5 hover:border-yellow-400 transition-all group"
          >
            <ShieldCheck className="text-yellow-400 mb-6 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-black uppercase text-lg">Security</h3>
            <p className="text-zinc-500 text-[10px] mt-2 uppercase">
             coming soon
            </p>
          </a>
        </div>

        {/* Live System Status Tracker */}
        <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider">
              Indexer: Operational
            </span>
          </div>
          
          <div className="text-zinc-600 text-[10px] uppercase font-bold">
            Last Block Sync: Just Now
          </div>

       <a 
  href="https://testnet.arcscan.app/" // Replace with your actual testnet explorer URL
  target="_blank" 
  rel="noopener noreferrer"
  className="flex items-center gap-2 text-[10px] font-black uppercase text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
>
  Network Explorer <ExternalLink size={12} />
</a>
        </div>
      </div>
    </main>
  );
}