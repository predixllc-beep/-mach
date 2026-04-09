"use client";

import { Sparkles, Flame, Activity } from "lucide-react";
import { useStore, getMarketPrices, Market, Outcome } from "@/store/useStore";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { HeroCard } from "@/components/feed/HeroCard";
import { MiniMarketCard } from "@/components/feed/MiniMarketCard";
import { MarketCard } from "@/components/feed/MarketCard";
import { LiveFeedSection } from "@/components/feed/LiveFeedSection";

export default function HomePage() {
  const { portfolio, getRankedMarkets } = useStore();
  const markets = getRankedMarkets();

  // Separate markets for different sections
  const heroMarket = markets[0];
  const heroPrices = heroMarket ? getMarketPrices(heroMarket) : {};
  const heroLeadingOutcomeId = Object.keys(heroPrices).length > 0 ? Object.keys(heroPrices).reduce((a, b) => heroPrices[a] > heroPrices[b] ? a : b) : '';
  const heroLeadingOutcome = heroMarket?.outcomes.find((o: Outcome) => o.id === heroLeadingOutcomeId);

  const miniMarkets = markets.slice(1, 5);
  const feedMarkets = markets.slice(1);

  return (
    <main className="flex flex-col min-h-screen pb-20 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md pt-4 pb-3 px-4 flex justify-between items-center border-b border-border/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Genesis</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Flame className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pt-4">
        {/* 1. HERO CARD */}
        {heroMarket && (
          <HeroCard 
            market={heroMarket} 
            leadingOutcomeTitle={heroLeadingOutcome?.title || ''}
            leadingProbability={heroPrices[heroLeadingOutcomeId] || 0}
          />
        )}

        {/* 2. MINI CARDS ROW (Horizontal Scroll) */}
        <div className="mb-6 mt-2">
          <div className="px-4 flex items-center space-x-2 mb-3">
            <Flame className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Hot Markets</h2>
          </div>
          <ScrollArea className="w-full whitespace-nowrap px-4">
            <div className="flex w-max space-x-3 pb-4">
              {miniMarkets.map((market: Market, i: number) => {
                const prices = getMarketPrices(market);
                const leadingId = Object.keys(prices).reduce((a, b) => prices[a] > prices[b] ? a : b);
                
                return (
                  <MiniMarketCard
                    key={market.id}
                    id={market.id}
                    title={market.title}
                    type={i === 0 ? "closing" : "resolved"}
                    timeLeft={i === 0 ? "2h 14m" : undefined}
                    result={i !== 0 ? market.outcomes[0].title : undefined}
                    probability={prices[leadingId]}
                  />
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        {/* 2.5 LIVE FEED INTEGRATION */}
        <div className="mb-6">
          <LiveFeedSection />
        </div>

        {/* 3. MAIN FEED (Infinite Vertical) */}
        <div className="px-4 pb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              For You
            </h2>
          </div>

          {feedMarkets.map((market: Market, index: number) => (
            <MarketCard 
              key={market.id} 
              market={market} 
              prices={getMarketPrices(market)} 
              index={index} 
            />
          ))}
        </div>
      </div>
    </main>
  );
}
