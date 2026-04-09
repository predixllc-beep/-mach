import { NextResponse } from 'next/server';

// Mock Database (Same as trade route for demonstration)
const db = {
  users: {
    'user_1': {
      balance: 10000,
      positions: [
        {
          marketId: 'm1',
          outcomeId: 'o1',
          shares: 150,
          avgPrice: 0.45,
          realizedPnL: 0
        }
      ]
    }
  },
  markets: {
    'm1': {
      id: 'm1',
      reserves: { 'o1': 45000, 'o2': 50000 }
    }
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user_1';

  const user = db.users[userId as keyof typeof db.users];
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Calculate Unrealized PnL
  let totalUnrealizedPnL = 0;
  let totalPositionsValue = 0;

  const positionsWithDetails = user.positions.map(pos => {
    const market = db.markets[pos.marketId as keyof typeof db.markets];
    let currentPrice = 0;
    
    if (market) {
      // Simple price calculation: (1 / reserve_i) / Sum(1 / reserve_j)
      let sumInverse = 0;
      Object.values(market.reserves).forEach(r => sumInverse += 1 / r);
      currentPrice = (1 / market.reserves[pos.outcomeId as keyof typeof market.reserves]) / sumInverse;
    }

    const currentValue = pos.shares * currentPrice;
    const totalCost = pos.shares * pos.avgPrice;
    const unrealizedPnL = currentValue - totalCost;
    
    totalUnrealizedPnL += unrealizedPnL;
    totalPositionsValue += currentValue;

    return {
      ...pos,
      currentPrice,
      currentValue,
      unrealizedPnL
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      balance: user.balance,
      totalPositionsValue,
      totalPortfolioValue: user.balance + totalPositionsValue,
      totalUnrealizedPnL,
      positions: positionsWithDetails
    }
  });
}
