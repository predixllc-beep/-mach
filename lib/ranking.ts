import { Market } from '@/store/useStore';

export interface UserProfile {
  id: string;
  viewedCategories: Record<string, number>;
  tradeHistory: string[]; // Market IDs
}

// Helper to calculate time decay (boosts score if ending soon)
function calculateTimeDecay(endDate: string): number {
  const now = new Date().getTime();
  const end = new Date(endDate).getTime();
  const timeRemaining = end - now;
  
  if (timeRemaining <= 0) return 0;
  
  // If ending within 24 hours, boost significantly
  const hoursRemaining = timeRemaining / (1000 * 60 * 60);
  if (hoursRemaining < 24) {
    return Math.max(0, 100 - (hoursRemaining * 4)); // 0-100 scale
  }
  
  return Math.max(0, 100 / Math.log2(hoursRemaining));
}

// Calculate momentum based on recent volume and price changes (mocked via volume for now)
function calculateMomentum(market: Market): number {
  // In a real app, this would compare volume over the last 1h vs 24h
  // We'll normalize the current volume to a 0-100 scale for demonstration
  return Math.min(100, (market.volume / 1000000) * 10); 
}

export function calculateFeedScore(market: Market, user?: UserProfile): number {
  // 1. Volume Score (Normalized 0-100)
  const volumeScore = Math.min(100, (market.volume / 5000000) * 100);
  
  // 2. Momentum Score
  const momentumScore = calculateMomentum(market);
  
  // 3. AI Confidence Score
  const aiScore = market.aiConfidence || 50;
  
  // 4. Time Decay Score
  const timeDecayScore = calculateTimeDecay(market.endDate);
  
  // 5. User Interest Score (Personalization)
  let userInterestScore = 50; // Default baseline
  if (user) {
    const categoryViews = user.viewedCategories[market.category] || 0;
    const hasTraded = user.tradeHistory.includes(market.id);
    userInterestScore = Math.min(100, (categoryViews * 5) + (hasTraded ? 30 : 0));
  }

  // Base Formula
  let feedScore = 
    (volumeScore * 0.30) +
    (momentumScore * 0.25) +
    (aiScore * 0.20) +
    (timeDecayScore * 0.15) +
    (userInterestScore * 0.10);

  // Randomization (5-10% variance to keep feed fresh)
  const randomFactor = 1 + ((Math.random() * 0.10) - 0.05); // 0.95 to 1.05
  
  return feedScore * randomFactor;
}

export function calculateLiveScore(market: Market): number {
  const recency = calculateTimeDecay(market.endDate) * 0.4;
  const activity = calculateMomentum(market) * 0.4;
  const volatility = (market.sentimentScore > 70 || market.sentimentScore < 30 ? 100 : 50) * 0.2;
  
  return recency + activity + volatility;
}

export function rankMarkets(markets: Market[], user?: UserProfile): Market[] {
  return [...markets].sort((a, b) => {
    const scoreA = calculateFeedScore(a, user);
    const scoreB = calculateFeedScore(b, user);
    return scoreB - scoreA; // Descending order
  });
}
