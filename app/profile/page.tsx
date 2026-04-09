"use client";

import { User, Settings, LogOut, Activity, Trophy, Clock, Moon, Sun, Wallet, TrendingUp, TrendingDown, ArrowRight, Coins, Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore, getMarketPrices, Position, Market, Outcome } from "@/store/useStore";

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { portfolio, markets, sellShares, stakeTokens, unstakeTokens, claimRewards } = useStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const positionsWithDetails = portfolio.positions.map((pos: Position) => {
    const market = markets.find((m: Market) => m.id === pos.marketId);
    let currentPrice = 0;
    let outcomeTitle = "Unknown";
    if (market) {
      const prices = getMarketPrices(market);
      currentPrice = prices[pos.outcomeId] || 0;
      outcomeTitle = market.outcomes.find((o: Outcome) => o.id === pos.outcomeId)?.title || "Unknown";
    }
    const currentValue = pos.shares * currentPrice;
    const totalCost = pos.shares * pos.avgPrice;
    const unrealizedPnL = currentValue - totalCost;
    const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;

    return {
      ...pos,
      market,
      outcomeTitle,
      currentPrice,
      currentValue,
      totalCost,
      unrealizedPnL,
      unrealizedPnLPercent
    };
  });

  const totalPositionsValue = positionsWithDetails.reduce((sum: number, pos: any) => sum + pos.currentValue, 0);
  const totalPortfolioValue = portfolio.balance + totalPositionsValue;
  const totalRealizedPnL = positionsWithDetails.reduce((sum: number, pos: any) => sum + pos.realizedPnL, 0);
  const totalUnrealizedPnL = positionsWithDetails.reduce((sum: number, pos: any) => sum + pos.unrealizedPnL, 0);

  return (
    <main className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border pt-4 pb-4 px-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">Profile</h1>
        <div className="flex space-x-2">
          {mounted && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* User Info */}
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 border-2 border-primary">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">Trader_0x9A</h2>
            <p className="text-sm text-muted-foreground font-mono">Joined April 2026</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card border-border shadow-sm flex flex-col items-center justify-center text-center space-y-1">
            <Trophy className="w-5 h-5 text-yellow-500 mb-1" />
            <p className="text-2xl font-mono font-bold">68%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Win Rate</p>
          </Card>
          <Card className="p-4 bg-card border-border shadow-sm flex flex-col items-center justify-center text-center space-y-1">
            <Activity className="w-5 h-5 text-blue-500 mb-1" />
            <p className="text-2xl font-mono font-bold">142</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Trades</p>
          </Card>
        </div>

        {/* Portfolio Value Card */}
        <Card className="p-6 bg-card border-border shadow-sm text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Total Value</p>
          <p className="text-4xl font-mono font-bold">${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          
          <div className="flex justify-center space-x-8 pt-4 border-t border-border/50 mt-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Available</p>
              <p className="font-mono font-semibold">${portfolio.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">In Positions</p>
              <p className="font-mono font-semibold">${totalPositionsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-8 pt-4 border-t border-border/50 mt-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Unrealized PnL</p>
              <p className={`font-mono font-semibold ${totalUnrealizedPnL >= 0 ? 'text-[#16C784]' : 'text-[#EA3943]'}`}>
                {totalUnrealizedPnL >= 0 ? '+' : ''}{totalUnrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Realized PnL</p>
              <p className={`font-mono font-semibold ${totalRealizedPnL >= 0 ? 'text-[#16C784]' : 'text-[#EA3943]'}`}>
                {totalRealizedPnL >= 0 ? '+' : ''}{totalRealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        {/* Positions List */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Positions</h2>
          
          {positionsWithDetails.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-border/50">
              <Wallet className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No active positions.</p>
              <Link href="/">
                <Button variant="link" className="text-primary mt-2">Explore Markets <ArrowRight className="w-4 h-4 ml-1" /></Button>
              </Link>
            </div>
          ) : (
            positionsWithDetails.map((pos: any, idx: number) => (
              <Card key={idx} className="p-4 bg-card border-border shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <Link href={`/market/${pos.marketId}`} className="flex-1 pr-4 hover:underline">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">{pos.market?.title || "Unknown Market"}</h3>
                  </Link>
                  <div className={`px-2 py-1 rounded text-xs font-bold bg-primary/20 text-primary`}>
                    {pos.outcomeTitle}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Shares</p>
                    <p className="font-mono text-sm">{pos.shares.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Price</p>
                    <p className="font-mono text-sm">${pos.avgPrice.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current</p>
                    <p className="font-mono text-sm">${pos.currentPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Value / PnL</p>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold">${pos.currentValue.toFixed(2)}</span>
                      <span className={`flex items-center text-xs font-mono font-medium ${pos.unrealizedPnL >= 0 ? 'text-[#16C784]' : 'text-[#EA3943]'}`}>
                        {pos.unrealizedPnL >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {pos.unrealizedPnL >= 0 ? '+' : ''}{pos.unrealizedPnL.toFixed(2)} ({pos.unrealizedPnLPercent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => sellShares(pos.marketId, pos.outcomeId, pos.shares)}
                  >
                    Sell All
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Recent Activity (Dummy) */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Activity</h2>
          
          <Card className="p-0 bg-card border-border shadow-sm overflow-hidden">
            <div className="divide-y divide-border/50">
              {[
                { action: "Bought YES", market: "Will Bitcoin reach $100k...", amount: "$500.00", time: "2h ago", color: "text-[#16C784]" },
                { action: "Sold NO", market: "Will the Fed cut rates...", amount: "+$120.50", time: "1d ago", color: "text-[#EA3943]" },
                { action: "Bought NO", market: "Will AI surpass human...", amount: "$300.00", time: "3d ago", color: "text-[#EA3943]" },
              ].map((item, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        <span className={item.color}>{item.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate w-40">{item.market}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold">{item.amount}</p>
                    <p className="text-[10px] text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>
    </main>
  );
}
