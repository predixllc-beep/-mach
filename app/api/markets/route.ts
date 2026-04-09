import { NextResponse } from 'next/server';
import { rankMarkets, UserProfile } from '@/lib/ranking';
import { useStore } from '@/store/useStore'; // In a real app, this would be a DB call

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const type = searchParams.get('type') || 'feed'; // 'feed', 'live', 'trending'
  
  // Mock fetching markets from database
  // Since we can't directly access Zustand state in a server route easily without a shared DB,
  // we will mock the response structure based on the initial state for demonstration of the API.
  
  // Note: In production, this would query Postgres/Redis.
  const mockMarkets = [
    {
      id: 'm1',
      title: 'Who will win the 2028 US Presidential Election?',
      category: 'Politics',
      volume: 5420000,
      outcomes: [
        { id: 'o1', title: 'Candidate A', reserves: 45000 },
        { id: 'o2', title: 'Candidate B', reserves: 50000 },
      ],
      endDate: '2028-11-07T23:59:59Z',
      image: 'https://picsum.photos/seed/election/400/300',
      aiSummary: 'Polling data shows a tight race.',
      sentimentScore: 50,
      aiConfidence: 75,
      aiProbabilities: { 'o1': 0.40, 'o2': 0.35 }
    },
    // ... more mocked markets would be here
  ];

  // Mock User Profile
  const mockUser: UserProfile = {
    id: 'user_1',
    viewedCategories: { 'Politics': 10, 'Crypto': 2 },
    tradeHistory: ['m1']
  };

  let filteredMarkets = mockMarkets as any[];

  if (category && category !== 'All') {
    filteredMarkets = filteredMarkets.filter(m => m.category === category);
  }

  // Apply Ranking Algorithm
  const rankedMarkets = rankMarkets(filteredMarkets, mockUser);

  return NextResponse.json({
    success: true,
    data: rankedMarkets,
    metadata: {
      type,
      count: rankedMarkets.length
    }
  });
}
