"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Zap, Waves } from "lucide-react";

const TABS = ["Live", "Trades", "Signals", "Whale"];

const MOCK_FEED = [
  { id: 1, type: "trade", title: "BTC gaining momentum", sub: "Buy pressure increasing", value: "+2.3%", isUp: true, time: "Just now" },
  { id: 2, type: "signal", title: "Breakout likely", sub: "AI confidence high", value: "Score 82", time: "2m ago" },
  { id: 3, type: "whale", title: "Large ETH position", sub: "$120K detected", value: "Alert", time: "5m ago" },
  { id: 4, type: "trade", title: "SOL facing resistance", sub: "Sell wall at $150", value: "-1.2%", isUp: false, time: "12m ago" },
  { id: 5, type: "signal", title: "Volatility spike", sub: "Macro event approaching", value: "Score 65", time: "15m ago" },
];

export function LiveFeedSection() {
  const [activeTab, setActiveTab] = useState("Live");

  return (
    <div className="mb-8">
      <div className="px-4 mb-4">
        <h2 className="text-lg font-bold text-foreground">Live Activity</h2>
      </div>

      {/* Tabs */}
      <div className="px-4 border-b border-border/40 flex space-x-6 mb-4">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold uppercase tracking-wider transition-colors relative ${
              activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="px-4">
        <div className="space-y-3 pb-4">
          {MOCK_FEED.slice(0, 3).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/30 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.type === 'trade' ? (item.isUp ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger') :
                  item.type === 'signal' ? 'bg-primary/10 text-primary' :
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  {item.type === 'trade' && (item.isUp ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />)}
                  {item.type === 'signal' && <Zap className="w-5 h-5" />}
                  {item.type === 'whale' && <Waves className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${
                  item.type === 'trade' ? (item.isUp ? 'text-success' : 'text-danger') :
                  'text-primary'
                }`}>
                  {item.value}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
