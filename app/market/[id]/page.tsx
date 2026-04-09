"use client";

import { useState, useMemo, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Brain, TrendingUp, Info, RefreshCw, Activity, AlertTriangle, Users, Bitcoin, Trophy, Landmark, Laptop } from "lucide-react";
import { useStore, getMarketPrices, calculateBuyOutcome, Market, Outcome } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { OutcomeCard } from "@/components/market/OutcomeCard";
import { InsightCard } from "@/components/market/InsightCard";
import { RelatedMarketCard } from "@/components/market/RelatedMarketCard";
import { QuickTradeModal } from "@/components/market/QuickTradeModal";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'crypto': return <Bitcoin className="w-4 h-4" />;
    case 'sports': return <Trophy className="w-4 h-4" />;
    case 'politics': return <Landmark className="w-4 h-4" />;
    case 'tech': return <Laptop className="w-4 h-4" />;
    default: return null;
  }
};

// Generate dummy chart data
const generateChartData = (currentProb: number) => {
  const data = [];
  let prob = 0.5;
  for (let i = 30; i >= 0; i--) {
    data.push({
      time: format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), "MMM dd"),
      prob: prob * 100,
    });
    // Random walk towards current prob
    prob += (currentProb - prob) * 0.1 + (Math.random() - 0.5) * 0.05;
  }
  data[data.length - 1].prob = currentProb * 100;
  return data;
};

import { CategoryGraph } from "@/components/market/CategoryGraph";

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { markets, portfolio, buyShares } = useStore();
  const market = markets.find((m: Market) => m.id === resolvedParams.id);
  
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string>('');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiData, setAiData] = useState<{ summary: string; score: number } | null>(null);

  // Initialize selected outcome on mount
  useEffect(() => {
    if (market && !selectedOutcomeId && market.outcomes.length > 0) {
      setSelectedOutcomeId(market.outcomes[0].id);
    }
  }, [market, selectedOutcomeId]);

  const prices = market ? getMarketPrices(market) : {};
  const currentPrice = selectedOutcomeId ? prices[selectedOutcomeId] || 0 : 0;
  const probability = currentPrice;

  const chartData = useMemo(() => market ? generateChartData(probability) : [], [market, probability]);

  if (!market) {
    return <div className="p-8 text-center">Market not found</div>;
  }

  const handleTradeClick = (outcomeId: string) => {
    setSelectedOutcomeId(outcomeId);
    setIsTradeModalOpen(true);
  };

  const executeTrade = (amount: number) => {
    if (amount <= 0 || !selectedOutcomeId) return;
    buyShares(market.id, selectedOutcomeId, amount);
  };

  const handleRefreshAI = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: market.title, category: market.category })
      });
      if (res.ok) {
        const data = await res.json();
        setAiData(data);
      }
    } catch (error) {
      console.error("Failed to refresh AI analysis", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const displaySummary = aiData?.summary || market.aiSummary;
  const displayScore = aiData?.score || market.sentimentScore;
  
  const relatedMarkets = markets.filter((m: Market) => m.id !== market.id && m.category === market.category).slice(0, 3);
  if (relatedMarkets.length === 0) {
    relatedMarkets.push(...markets.filter((m: Market) => m.id !== market.id).slice(0, 3));
  }

  return (
    <main className="flex flex-col min-h-screen pb-24 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-8 w-8">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2 bg-secondary px-2 py-1 rounded-md text-muted-foreground">
            {getCategoryIcon(market.category)}
            <span className="text-xs font-bold uppercase tracking-wider">
              {market.category}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-xs font-medium text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3" />
            <span className="font-mono">${(market.volume / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span className="font-mono">1.2k</span>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-8">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold leading-tight text-foreground mb-4">{market.title}</h1>
        </div>

        {/* Main Chart / Simulation */}
        <CategoryGraph category={market.category} probability={probability} />

        {/* Outcomes Section */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Outcomes</h3>
          <div className="space-y-3">
            {market.outcomes.map((outcome: Outcome) => (
              <OutcomeCard 
                key={outcome.id}
                title={outcome.title}
                probability={prices[outcome.id]}
                price={prices[outcome.id]}
                onTradeClick={() => handleTradeClick(outcome.id)}
              />
            ))}
          </div>
        </section>

        {/* Insights Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">AI Insights</h3>
            <Button variant="ghost" size="sm" onClick={handleRefreshAI} disabled={isAnalyzing} className="h-8 px-2 text-muted-foreground">
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="p-4 bg-primary/5 rounded-[16px] border border-primary/10 mb-4">
            <p className="text-sm text-foreground leading-relaxed">
              {displaySummary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InsightCard 
              title="AI Score" 
              value={displayScore} 
              icon={<Brain className="w-4 h-4" />} 
              highlight 
            />
            <InsightCard 
              title="Confidence" 
              value={`${market.aiConfidence}%`} 
              icon={<TrendingUp className="w-4 h-4" />} 
            />
            <InsightCard 
              title="Volatility" 
              value="High" 
              icon={<Activity className="w-4 h-4" />} 
              subtitle="Expect swings"
            />
            <InsightCard 
              title="Risk Level" 
              value="Elevated" 
              icon={<AlertTriangle className="w-4 h-4" />} 
              subtitle="Whale activity"
            />
          </div>
        </section>

        {/* Related Markets */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Related Markets</h3>
          <ScrollArea className="w-full whitespace-nowrap -mx-4 px-4">
            <div className="flex w-max space-x-3 pb-4">
              {relatedMarkets.map((m: Market) => {
                const mPrices = getMarketPrices(m);
                const leadingId = Object.keys(mPrices).reduce((a, b) => mPrices[a] > mPrices[b] ? a : b);
                return (
                  <RelatedMarketCard 
                    key={m.id}
                    id={m.id}
                    title={m.title}
                    category={m.category}
                    probability={mPrices[leadingId]}
                  />
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </section>
      </div>

      {/* Quick Trade Modal */}
      {selectedOutcomeId && (
        <QuickTradeModal 
          isOpen={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          outcomeTitle={market.outcomes.find((o: Outcome) => o.id === selectedOutcomeId)?.title || ''}
          probability={prices[selectedOutcomeId]}
          currentPrice={prices[selectedOutcomeId]}
          balance={portfolio.balance}
          onTrade={executeTrade}
        />
      )}
    </main>
  );
}
