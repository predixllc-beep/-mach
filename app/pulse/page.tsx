"use client";

import { Activity, MessageSquare, Bell, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PulsePage() {
  return (
    <main className="flex flex-col min-h-screen pb-24 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border pt-4 pb-4 px-4">
        <h1 className="text-xl font-bold tracking-tight">Pulse</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Global Activity */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Activity</h2>
          </div>
          
          <Card className="p-0 bg-card border-border shadow-sm overflow-hidden">
            <div className="divide-y divide-border/50">
              {[
                { user: "0x4F...9A2", action: "bought 5,000 YES", market: "Will Bitcoin reach $100k...", time: "Just now", icon: TrendingUp, color: "text-[#16C784]" },
                { user: "Whale_77", action: "sold 12,000 NO", market: "Will Taylor Swift announce...", time: "2m ago", icon: TrendingUp, color: "text-[#EA3943]" },
                { user: "CryptoKing", action: "created market", market: "ETH Gas Fees > 50 gwei...", time: "5m ago", icon: Bell, color: "text-primary" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="p-4 flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        <span className="font-mono font-bold">{item.user}</span> <span className="text-muted-foreground">{item.action}</span>
                      </p>
                      <p className="text-xs font-medium mt-0.5 line-clamp-1">{item.market}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Trending Chats */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Trending Discussions</h2>
          </div>
          
          <div className="space-y-3">
            {[
              { market: "Who will win the 2028 US Presidential Election?", msgs: 342, active: 45 },
              { market: "Will this TikTok dance trend hit 10M views?", msgs: 128, active: 12 },
              { market: "Champions League Winner 2026", msgs: 89, active: 8 },
            ].map((chat, i) => (
              <Card key={i} className="p-3 bg-card border-border shadow-sm flex justify-between items-center hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium line-clamp-1">{chat.market}</p>
                  <p className="text-xs text-muted-foreground mt-1">{chat.msgs} messages</p>
                </div>
                <div className="flex items-center space-x-1 bg-blue-500/10 text-blue-500 px-2 py-1 rounded text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>{chat.active} online</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
