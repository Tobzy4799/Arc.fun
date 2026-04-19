'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { config } from "@/config/wagmi"

import { 
  ApolloClient, 
  InMemoryCache, 
  HttpLink 
} from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react';

// Initialize Apollo Client for Envio Indexer
// Using the HttpLink object fixes the 'uri' property flag
const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://indexer.dev.hyperindex.xyz/803b010/v1/graphql',
  }),
  cache: new InMemoryCache(),
})

export function Providers({ children }: { children: ReactNode }) {
  // Maintaining your existing QueryClient state pattern
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ApolloProvider client={client}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </ApolloProvider>
  )
}