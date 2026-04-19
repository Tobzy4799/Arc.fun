// lib/indexer.ts

const ENVIO_LOCAL_URL = "https://indexer.dev.hyperindex.xyz/803b010/v1/graphql";

export const fetchTradeHistory = async (tokenAddress?: string) => {
    // Note: Using Factory_Trade to match your verified Hasura output
    const query = `
    query GetLatestTrades($token: String) {
      Factory_Trade(
        where: { tokenAddress: { _ilike: $token } },
        order_by: { timestamp: desc }, 
        limit: 50
      ) {
        id
        tokenAddress
        user
        isBuy
        tokenAmount
        usdcAmount
        timestamp
      }
    }
  `;

    try {
        const response = await fetch(ENVIO_LOCAL_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query,
                variables: { token: tokenAddress }
            }),
        });

        const result = await response.json();

        if (result.errors) {
            console.error("GraphQL Errors:", result.errors);
            return [];
        }

        // We use result.data.Factory_Trade because that's the key in your JSON response
        return result.data?.Factory_Trade || [];
    } catch (error) {
        console.error("Envio fetch error:", error);
        return [];
    }
};