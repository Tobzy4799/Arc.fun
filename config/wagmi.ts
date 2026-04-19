import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors' // Import walletConnect

export const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://5042002.rpc.thirdweb.com'] }, 
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
} as const

// Get your Project ID from the environment variable
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const config = createConfig({
  chains: [arcTestnet, mainnet],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected(),
    // Add WalletConnect here so QR codes work
    walletConnect({ projectId }) 
  ],
  transports: {
    [arcTestnet.id]: http(),
    [mainnet.id]: http(),
  },
})