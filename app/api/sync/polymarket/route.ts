import { NextResponse } from 'next/server';

// Mock Polymarket Integration
// In a real app, this would fetch from Polymarket's Gamma API (https://gamma-api.polymarket.com/events)

export async function GET(request: Request) {
  try {
    // Simulate fetching from Polymarket
    const polymarketMockData = [
      {
        id: "poly_1",
        title: "Will Bitcoin hit $100k in 2024?",
        category: "Crypto",
        volume: 15000000,
        endDate: "2024-12-31T23:59:59Z",
        outcomes: [
          { id: "yes", title: "Yes", price: 0.65 },
          { id: "no", title: "No", price: 0.35 }
        ]
      },
      {
        id: "poly_2",
        title: "Will Taylor Swift release Reputation (Taylor's Version) in 2024?",
        category: "Music",
        volume: 2500000,
        endDate: "2024-12-31T23:59:59Z",
        outcomes: [
          { id: "yes", title: "Yes", price: 0.82 },
          { id: "no", title: "No", price: 0.18 }
        ]
      }
    ];

    // Normalize data into internal format
    const normalizedMarkets = polymarketMockData.map(pm => {
      // Convert price to mock reserves for CPMM compatibility
      // If price is 0.65, reserve ratio is roughly 35:65
      const totalLiquidity = pm.volume * 0.1; // Mock liquidity
      const yesReserve = totalLiquidity * (1 - pm.outcomes[0].price);
      const noReserve = totalLiquidity * (1 - pm.outcomes[1].price);

      return {
        id: pm.id,
        title: pm.title,
        category: pm.category,
        volume: pm.volume,
        endDate: pm.endDate,
        image: `https://picsum.photos/seed/${pm.id}/400/300`,
        aiSummary: "Data imported from Polymarket.",
        sentimentScore: 50,
        aiConfidence: 80,
        aiProbabilities: {
          [pm.outcomes[0].id]: pm.outcomes[0].price,
          [pm.outcomes[1].id]: pm.outcomes[1].price
        },
        outcomes: [
          { id: pm.outcomes[0].id, title: pm.outcomes[0].title, reserves: yesReserve },
          { id: pm.outcomes[1].id, title: pm.outcomes[1].title, reserves: noReserve }
        ]
      };
    });

    return NextResponse.json({
      success: true,
      data: normalizedMarkets
    });

  } catch (error) {
    console.error('Polymarket sync error:', error);
    return NextResponse.json({ error: 'Failed to sync with Polymarket' }, { status: 500 });
  }
}
