import { create, StoreApi, UseBoundStore } from 'zustand';
import { socket } from '@/lib/socket';
import { rankMarkets } from '@/lib/ranking';

export type Outcome = {
  id: string;
  title: string;
  reserves: number; // AMM balance of this outcome token
};

export type Market = {
  id: string;
  title: string;
  category: string;
  volume: number;
  outcomes: Outcome[];
  endDate: string;
  image: string;
  aiSummary: string;
  sentimentScore: number; // 0 to 100
  aiConfidence: number; // 0 to 100
  aiProbabilities: Record<string, number>; // outcomeId -> probability
};

export type Position = {
  marketId: string;
  outcomeId: string;
  shares: number;
  avgPrice: number;
  realizedPnL: number;
};

export type Portfolio = {
  balance: number; // USDC
  genesisTokens: number; // GEN token
  stakedGenesis: number;
  rewardsEarned: number;
  positions: Position[];
};

interface StoreState {
  markets: Market[];
  portfolio: Portfolio;
  buyShares: (marketId: string, outcomeId: string, amount: number) => void;
  sellShares: (marketId: string, outcomeId: string, shares: number) => void;
  stakeTokens: (amount: number) => void;
  unstakeTokens: (amount: number) => void;
  claimRewards: () => void;
  updateMarket: (market: Market) => void;
  getRankedMarkets: () => Market[];
}

const initialMarkets: Market[] = [
  {
    id: 'm1',
    title: 'Who will win the 2028 US Presidential Election?',
    category: 'Politics',
    volume: 5420000,
    outcomes: [
      { id: 'o1', title: 'Candidate A', reserves: 45000 },
      { id: 'o2', title: 'Candidate B', reserves: 50000 },
      { id: 'o3', title: 'Candidate C', reserves: 85000 },
      { id: 'o4', title: 'Other', reserves: 95000 },
    ],
    endDate: '2028-11-07T23:59:59Z',
    image: 'https://picsum.photos/seed/election/400/300',
    aiSummary: 'Polling data shows a tight race between A and B, with C gaining slight momentum in swing states.',
    sentimentScore: 50,
    aiConfidence: 75,
    aiProbabilities: { 'o1': 0.40, 'o2': 0.35, 'o3': 0.15, 'o4': 0.10 }
  },
  {
    id: 'm2',
    title: 'Bitcoin Price on Dec 31, 2026',
    category: 'Crypto',
    volume: 3100000,
    outcomes: [
      { id: 'o1', title: '< $50k', reserves: 80000 },
      { id: 'o2', title: '$50k - $100k', reserves: 40000 },
      { id: 'o3', title: '$100k - $150k', reserves: 50000 },
      { id: 'o4', title: '> $150k', reserves: 70000 },
    ],
    endDate: '2026-12-31T23:59:59Z',
    image: 'https://picsum.photos/seed/btc2/400/300',
    aiSummary: 'Institutional adoption suggests a strong floor, but macro conditions may limit extreme upside.',
    sentimentScore: 65,
    aiConfidence: 35,
    aiProbabilities: { 'o1': 0.15, 'o2': 0.45, 'o3': 0.30, 'o4': 0.10 }
  },
  {
    id: 'm3',
    title: 'Champions League Winner 2026',
    category: 'Sports',
    volume: 1200000,
    outcomes: [
      { id: 'o1', title: 'Real Madrid', reserves: 30000 },
      { id: 'o2', title: 'Man City', reserves: 35000 },
      { id: 'o3', title: 'Bayern', reserves: 50000 },
      { id: 'o4', title: 'Field (Other)', reserves: 25000 },
    ],
    endDate: '2026-05-30T23:59:59Z',
    image: 'https://picsum.photos/seed/soccer/400/300',
    aiSummary: 'Real Madrid and Man City remain favorites based on squad depth and historical performance.',
    sentimentScore: 70,
    aiConfidence: 88,
    aiProbabilities: { 'o1': 0.30, 'o2': 0.25, 'o3': 0.15, 'o4': 0.30 }
  },
  {
    id: 'm4',
    title: 'Will this TikTok dance trend hit 10M views by Friday?',
    category: 'TikTok',
    volume: 450000,
    outcomes: [
      { id: 'o1', title: 'Yes', reserves: 20000 },
      { id: 'o2', title: 'No', reserves: 40000 },
    ],
    endDate: '2026-04-12T23:59:59Z',
    image: 'https://picsum.photos/seed/tiktok/400/300',
    aiSummary: 'Current view velocity is high, but historical data shows trends usually taper off after 48 hours.',
    sentimentScore: 85,
    aiConfidence: 60,
    aiProbabilities: { 'o1': 0.65, 'o2': 0.35 }
  },
  {
    id: 'm5',
    title: 'Will Taylor Swift announce a new album in 2026?',
    category: 'Music',
    volume: 890000,
    outcomes: [
      { id: 'o1', title: 'Yes', reserves: 30000 },
      { id: 'o2', title: 'No', reserves: 25000 },
    ],
    endDate: '2026-12-31T23:59:59Z',
    image: 'https://picsum.photos/seed/music/400/300',
    aiSummary: 'Based on her typical release cycle, a new album announcement is highly probable late in the year.',
    sentimentScore: 90,
    aiConfidence: 80,
    aiProbabilities: { 'o1': 0.55, 'o2': 0.45 }
  },
  {
    id: 'm6',
    title: 'Stranger Things Season 5 Release Date',
    category: 'Series',
    volume: 650000,
    outcomes: [
      { id: 'o1', title: 'Q3 2026', reserves: 40000 },
      { id: 'o2', title: 'Q4 2026', reserves: 30000 },
      { id: 'o3', title: '2027', reserves: 60000 },
    ],
    endDate: '2026-12-31T23:59:59Z',
    image: 'https://picsum.photos/seed/series/400/300',
    aiSummary: 'Production delays suggest a late 2026 or early 2027 release is most likely.',
    sentimentScore: 60,
    aiConfidence: 70,
    aiProbabilities: { 'o1': 0.25, 'o2': 0.40, 'o3': 0.35 }
  },
  {
    id: 'm7',
    title: 'Will @CryptoWhale be right about ETH hitting $5k this week?',
    category: 'Trader',
    volume: 210000,
    outcomes: [
      { id: 'o1', title: 'Yes', reserves: 50000 },
      { id: 'o2', title: 'No', reserves: 15000 },
    ],
    endDate: '2026-04-15T23:59:59Z',
    image: 'https://picsum.photos/seed/trader/400/300',
    aiSummary: 'Market momentum is strong, but $5k is a major resistance level.',
    sentimentScore: 45,
    aiConfidence: 50,
    aiProbabilities: { 'o1': 0.20, 'o2': 0.80 }
  }
];

// Generalized CPMM Price Calculation
// Price of outcome i = (Product of all reserves) / (reserves[i] * Sum(Product of all reserves except j))
// Simpler approximation for UI: Price_i = (1 / reserves_i) / Sum(1 / reserves_j)
export const getMarketPrices = (market: Market) => {
  let sumInverse = 0;
  market.outcomes.forEach(o => {
    sumInverse += 1 / o.reserves;
  });

  const prices: Record<string, number> = {};
  market.outcomes.forEach(o => {
    prices[o.id] = (1 / o.reserves) / sumInverse;
  });

  return prices;
};

// Calculate buy outcome using CPMM
export const calculateBuyOutcome = (market: Market, outcomeId: string, amount: number) => {
  // To buy `amount` of collateral worth of outcomeId:
  // 1. Mint `amount` of all outcome tokens.
  // 2. AMM balances increase by `amount` for all outcomes.
  // 3. User wants to extract `sharesReceived` of `outcomeId`.
  // 4. AMM balance of `outcomeId` decreases by `sharesReceived`.
  // 5. Product of new balances must equal product of old balances.
  
  let oldProduct = 1;
  market.outcomes.forEach(o => oldProduct *= o.reserves);

  let newProductWithoutTarget = 1;
  market.outcomes.forEach(o => {
    if (o.id !== outcomeId) {
      newProductWithoutTarget *= (o.reserves + amount);
    }
  });

  const targetNewReserve = oldProduct / newProductWithoutTarget;
  const targetOldReserve = market.outcomes.find(o => o.id === outcomeId)!.reserves;
  
  // The AMM's new reserve for the target outcome is `targetNewReserve`.
  // It started at `targetOldReserve`, gained `amount` from minting, and gave `sharesReceived` to the user.
  // targetNewReserve = targetOldReserve + amount - sharesReceived
  const sharesReceived = targetOldReserve + amount - targetNewReserve;
  const avgPrice = amount / sharesReceived;

  return { sharesReceived, avgPrice, targetNewReserve };
};

export const calculateSellOutcome = (market: Market, outcomeId: string, shares: number) => {
  // To sell `shares` of outcomeId:
  // 1. User gives `shares` of outcomeId to AMM.
  // 2. AMM balance of outcomeId increases by `shares`.
  // 3. User wants `revenue` in collateral.
  // 4. AMM burns `revenue` of all outcome tokens.
  // 5. AMM balances decrease by `revenue` for all outcomes.
  // 6. Product of new balances = old product.
  
  // This requires solving a polynomial of degree N for `revenue`.
  // For UI approximation, we'll use the current price with a linear slippage model.
  const prices = getMarketPrices(market);
  const currentPrice = prices[outcomeId];
  
  // Slippage approximation: price drops as you sell.
  const targetReserve = market.outcomes.find(o => o.id === outcomeId)!.reserves;
  const slippageFactor = shares / targetReserve; 
  const avgPrice = currentPrice * (1 - slippageFactor * 0.5); // Rough approximation
  
  const revenue = shares * Math.max(avgPrice, 0.01);
  return { revenue };
};

export const useStore: UseBoundStore<StoreApi<StoreState>> = create<StoreState>((set) => ({
  markets: initialMarkets,
  portfolio: {
    balance: 10000,
    genesisTokens: 500,
    stakedGenesis: 0,
    rewardsEarned: 0,
    positions: [],
  },
  buyShares: (marketId, outcomeId, amount) => set((state) => {
    const market = state.markets.find(m => m.id === marketId);
    if (!market || state.portfolio.balance < amount) return state;

    const { sharesReceived, targetNewReserve } = calculateBuyOutcome(market, outcomeId, amount);

    // Fee logic: 1% fee
    const fee = amount * 0.01;
    const netAmount = amount - fee;
    
    // Distribute fee to stakers (simulated)
    const rewardsEarned = state.portfolio.stakedGenesis > 0 ? state.portfolio.rewardsEarned + (fee * 0.5) : state.portfolio.rewardsEarned;

    const existingPositionIndex = state.portfolio.positions.findIndex(
      p => p.marketId === marketId && p.outcomeId === outcomeId
    );

    let newPositions = [...state.portfolio.positions];

    if (existingPositionIndex >= 0) {
      const pos = newPositions[existingPositionIndex];
      const totalCost = (pos.shares * pos.avgPrice) + netAmount;
      const newShares = pos.shares + sharesReceived;
      newPositions[existingPositionIndex] = {
        ...pos,
        shares: newShares,
        avgPrice: totalCost / newShares,
      };
    } else {
      newPositions.push({
        marketId,
        outcomeId,
        shares: sharesReceived,
        avgPrice: netAmount / sharesReceived,
        realizedPnL: 0
      });
    }

    const newMarkets = state.markets.map(m => {
      if (m.id === marketId) {
        const updatedMarket = {
          ...m,
          volume: m.volume + amount,
          outcomes: m.outcomes.map(o => {
            if (o.id === outcomeId) {
              return { ...o, reserves: targetNewReserve };
            }
            return { ...o, reserves: o.reserves + netAmount };
          })
        };
        // Emit market update and trade
        socket.emit('market_update', updatedMarket);
        socket.emit('trade', { type: 'buy', marketId, outcomeId, amount, shares: sharesReceived, timestamp: Date.now() });
        return updatedMarket;
      }
      return m;
    });

    return {
      markets: newMarkets,
      portfolio: {
        ...state.portfolio,
        balance: state.portfolio.balance - amount,
        rewardsEarned,
        positions: newPositions,
      }
    };
  }),
  sellShares: (marketId, outcomeId, shares) => set((state) => {
    const market = state.markets.find(m => m.id === marketId);
    if (!market) return state;

    const existingPositionIndex = state.portfolio.positions.findIndex(
      p => p.marketId === marketId && p.outcomeId === outcomeId
    );

    if (existingPositionIndex < 0) return state;

    const pos = state.portfolio.positions[existingPositionIndex];
    if (pos.shares < shares) return state;

    const { revenue } = calculateSellOutcome(market, outcomeId, shares);
    
    // Fee logic
    const fee = revenue * 0.01;
    const netRevenue = revenue - fee;
    const rewardsEarned = state.portfolio.stakedGenesis > 0 ? state.portfolio.rewardsEarned + (fee * 0.5) : state.portfolio.rewardsEarned;

    let newPositions = [...state.portfolio.positions];
    const costBasisOfSoldShares = shares * pos.avgPrice;
    const realizedPnL = netRevenue - costBasisOfSoldShares;

    if (pos.shares === shares) {
      newPositions.splice(existingPositionIndex, 1);
    } else {
      newPositions[existingPositionIndex] = {
        ...pos,
        shares: pos.shares - shares,
        realizedPnL: pos.realizedPnL + realizedPnL
      };
    }

    // Approximate reserve updates for sell
    const newMarkets = state.markets.map(m => {
      if (m.id === marketId) {
        const updatedMarket = {
          ...m,
          volume: m.volume + revenue,
          outcomes: m.outcomes.map(o => {
            if (o.id === outcomeId) {
              return { ...o, reserves: o.reserves + shares };
            }
            return { ...o, reserves: Math.max(o.reserves - netRevenue, 1) };
          })
        };
        // Emit market update and trade
        socket.emit('market_update', updatedMarket);
        socket.emit('trade', { type: 'sell', marketId, outcomeId, shares, revenue: netRevenue, timestamp: Date.now() });
        return updatedMarket;
      }
      return m;
    });

    return {
      markets: newMarkets,
      portfolio: {
        ...state.portfolio,
        balance: state.portfolio.balance + netRevenue,
        rewardsEarned,
        positions: newPositions,
      }
    };
  }),
  stakeTokens: (amount) => set((state) => {
    if (state.portfolio.genesisTokens < amount) return state;
    return {
      portfolio: {
        ...state.portfolio,
        genesisTokens: state.portfolio.genesisTokens - amount,
        stakedGenesis: state.portfolio.stakedGenesis + amount,
      }
    };
  }),
  unstakeTokens: (amount) => set((state) => {
    if (state.portfolio.stakedGenesis < amount) return state;
    return {
      portfolio: {
        ...state.portfolio,
        genesisTokens: state.portfolio.genesisTokens + amount,
        stakedGenesis: state.portfolio.stakedGenesis - amount,
      }
    };
  }),
  claimRewards: () => set((state) => {
    return {
      portfolio: {
        ...state.portfolio,
        balance: state.portfolio.balance + state.portfolio.rewardsEarned,
        rewardsEarned: 0,
      }
    };
  }),
  updateMarket: (updatedMarket) => set((state) => {
    return {
      markets: state.markets.map(m => m.id === updatedMarket.id ? updatedMarket : m)
    };
  }),
  getRankedMarkets: () => {
    const state = useStore.getState();
    // In a real app, we would pass the user profile here
    return rankMarkets(state.markets);
  }
}));
