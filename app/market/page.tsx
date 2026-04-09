"use client";

import { useState } from "react";
import { Search, TrendingUp, Flame, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useStore, getMarketPrices, Market, Outcome } from "@/store/useStore";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MarketCard } from "@/components/feed/MarketCard";
import { HeroCard } from "@/components/feed/HeroCard";

const CATEGORIES = ["All", "Crypto", "Sports", "Politics", "TikTok", "Music", "Series", "Trader"];

export default function MarketPage() {
  const { getRankedMarkets } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const markets = getRankedMarkets();

  const filteredMarkets = markets.filter((m: Market) => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Mock data for Featured / Gainers / Losers
  const featuredMarkets = markets.slice(0, 3);
  const gainers = markets.slice(0, 3);
  const losers = markets.slice(-3).reverse();

  return (
    <main className="flex flex-col min-h-screen pb-20 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md pt-4 pb-3 px-4 space-y-4 border-b border-border/50">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Markets</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search markets..." 
            className="pl-9 bg-card border-border/50 h-10 rounded-full shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories (Pills) */}
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex w-max space-x-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              >
                {category}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </header>

      <div className="flex-1 overflow-y-auto">
        
        {/* Featured Markets (Snap Scroll) - Only show if no search and All category */}
        {!searchQuery && selectedCategory === "All" && (
          <div className="mt-4 mb-6">
            <ScrollArea className="w-full whitespace-nowrap snap-x snap-mandatory">
              <div className="flex w-max space-x-4 px-4 pb-4">
                {featuredMarkets.map((market: Market) => {
                  const prices = getMarketPrices(market);
                  const leadingId = Object.keys(prices).reduce((a, b) => prices[a] > prices[b] ? a : b);
                  const leadingOutcome = market.outcomes.find((o: Outcome) => o.id === leadingId);
                  return (
                    <div key={market.id} className="w-[85vw] max-w-[320px] snap-center shrink-0">
                      <HeroCard 
                        market={market} 
                        leadingOutcomeTitle={leadingOutcome?.title || ''}
                        leadingProbability={prices[leadingId] || 0}
                      />
                    </div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>
        )}

        <div className="px-4">
          {/* Trending / Gainers / Losers Section (Only show if no search and All category) */}
          {!searchQuery && selectedCategory === "All" && (
            <div className="mb-6 space-y-6">
              {/* Trending */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Trending</h2>
                </div>
                <div className="space-y-3">
                  {markets.slice(3, 5).map(market => {
                    const prices = getMarketPrices(market);
                    const leadingId = Object.keys(prices).reduce((a, b) => prices[a] > prices[b] ? a : b);
                    return (
                      <div key={market.id} className="flex justify-between items-center p-3 bg-card rounded-xl border border-border/50">
                        <div className="flex-1 pr-4">
                          <p className="text-xs text-muted-foreground mb-1">{market.category}</p>
                          <p className="text-sm font-medium line-clamp-1">{market.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono font-bold text-foreground">{(prices[leadingId] * 100).toFixed(0)}%</p>
                          <p className="text-[10px] text-muted-foreground">${(market.volume / 1000000).toFixed(1)}M</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gainers & Losers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-1 mb-3">
                    <ArrowUpRight className="w-4 h-4 text-[#16C784]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Gainers</h2>
                  </div>
                  <div className="space-y-2">
                    {gainers.map(market => (
                      <div key={market.id} className="flex justify-between items-center">
                        <p className="text-xs font-medium line-clamp-1 flex-1 pr-2">{market.title}</p>
                        <span className="text-xs font-mono text-[#16C784]">+12%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-1 mb-3">
                    <ArrowDownRight className="w-4 h-4 text-[#EA3943]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Losers</h2>
                  </div>
                  <div className="space-y-2">
                    {losers.map(market => (
                      <div key={market.id} className="flex justify-between items-center">
                        <p className="text-xs font-medium line-clamp-1 flex-1 pr-2">{market.title}</p>
                        <span className="text-xs font-mono text-[#EA3943]">-8%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {searchQuery ? "Search Results" : selectedCategory !== "All" ? `${selectedCategory} Markets` : "All Markets"}
              </h2>
            </div>

            {filteredMarkets.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No markets found.
              </div>
            ) : (
              filteredMarkets.map((market: Market, index: number) => (
                <MarketCard 
                  key={market.id} 
                  market={market} 
                  prices={getMarketPrices(market)} 
                  index={index} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
