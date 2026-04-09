import { NextResponse } from 'next/server';

// Mock Database for Wallet/Positions
const db = {
  users: {
    'user_1': {
      balance: 10000,
      positions: [] as any[]
    }
  },
  markets: {
    'm1': {
      id: 'm1',
      reserves: { 'o1': 45000, 'o2': 50000 }
    }
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { marketId, outcomeId, amount, userId = 'user_1' } = body;

    if (!marketId || !outcomeId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid trade parameters' }, { status: 400 });
    }

    const user = db.users[userId as keyof typeof db.users];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Validate Balance
    if (user.balance < amount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    const market = db.markets[marketId as keyof typeof db.markets];
    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }

    // 2. Deduct Funds
    user.balance -= amount;

    // 3. Simple CPMM Trade Execution (Price Engine)
    // Product of reserves must remain constant
    const oldReserves = market.reserves;
    const oldProduct = Object.values(oldReserves).reduce((a, b) => a * b, 1);
    
    // Add liquidity (amount) to all outcomes
    const newReservesWithoutTarget = { ...oldReserves };
    for (const key in newReservesWithoutTarget) {
      if (key !== outcomeId) {
        newReservesWithoutTarget[key as keyof typeof newReservesWithoutTarget] += amount;
      }
    }

    const newProductWithoutTarget = Object.entries(newReservesWithoutTarget)
      .filter(([k]) => k !== outcomeId)
      .reduce((acc, [_, v]) => acc * v, 1);

    const targetNewReserve = oldProduct / newProductWithoutTarget;
    const targetOldReserve = oldReserves[outcomeId as keyof typeof oldReserves];
    
    const sharesReceived = targetOldReserve + amount - targetNewReserve;
    const avgPrice = amount / sharesReceived;

    // Update Market Reserves
    market.reserves = newReservesWithoutTarget;
    market.reserves[outcomeId as keyof typeof market.reserves] = targetNewReserve;

    // 4. Create/Update Position
    const existingPosIndex = user.positions.findIndex(p => p.marketId === marketId && p.outcomeId === outcomeId);
    if (existingPosIndex >= 0) {
      const pos = user.positions[existingPosIndex];
      const totalCost = (pos.shares * pos.avgPrice) + amount;
      pos.shares += sharesReceived;
      pos.avgPrice = totalCost / pos.shares;
    } else {
      user.positions.push({
        marketId,
        outcomeId,
        shares: sharesReceived,
        avgPrice,
        realizedPnL: 0
      });
    }

    // In a real app, we would emit a WebSocket event here via Redis Pub/Sub
    // socket.emit('trade', { marketId, outcomeId, amount, sharesReceived });

    return NextResponse.json({
      success: true,
      data: {
        sharesReceived,
        avgPrice,
        newBalance: user.balance,
        position: user.positions.find(p => p.marketId === marketId && p.outcomeId === outcomeId)
      }
    });

  } catch (error) {
    console.error('Trade execution error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
