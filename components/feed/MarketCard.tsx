import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Bitcoin, Trophy, Landmark, Laptop, Video, Music, Tv, User, Heart, MessageCircle, BarChart2, ExternalLink, Play, Activity, Brain } from "lucide-react";
import { Market } from "@/store/useStore";
import { useCountdown, formatCountdown } from "@/lib/useCountdown";
import { QuickTradeModal } from "./QuickTradeModal";

interface MarketCardProps {
  market: Market;
  prices: Record<string, number>;
  index: number;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'crypto': return <Bitcoin className="w-4 h-4" />;
    case 'sports': return <Trophy className="w-4 h-4" />;
    case 'politics': return <Landmark className="w-4 h-4" />;
    case 'tech': return <Laptop className="w-4 h-4" />;
    case 'tiktok': return <Video className="w-4 h-4" />;
    case 'music': return <Music className="w-4 h-4" />;
    case 'series': return <Tv className="w-4 h-4" />;
    case 'trader': return <User className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
};

const MUSIC_BARS = [40, 60, 30, 80, 50, 90, 40, 70, 30, 60, 40, 80, 50, 70, 30, 60, 40, 90, 50, 70];

const DynamicMedia = ({ category }: { category: string }) => {
  switch (category.toLowerCase()) {
    case 'sports':
      return (
        <div className="bg-secondary/50 rounded-xl p-3 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center font-bold text-xs">LAL</div>
            <span className="font-mono font-bold text-lg">102</span>
          </div>
          <div className="text-xs text-muted-foreground font-medium">Q4 02:14</div>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-lg">98</span>
            <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center font-bold text-xs">BOS</div>
          </div>
        </div>
      );
    case 'crypto':
      return (
        <div className="h-16 bg-secondary/30 rounded-xl mb-4 flex items-end overflow-hidden">
          <svg viewBox="0 0 100 30" className="w-full h-full stroke-primary fill-primary/10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="none">
            <path d="M0,30 L0,25 L10,20 L20,22 L30,15 L40,18 L50,10 L60,12 L70,5 L80,8 L90,2 L100,5 L100,30 Z" />
          </svg>
        </div>
      );
    case 'music':
      return (
        <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3 mb-4">
          <button className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0">
            <Play className="w-4 h-4 ml-1" />
          </button>
          <div className="flex-1 flex items-center gap-1 h-6">
            {MUSIC_BARS.map((height, i) => (
              <div key={i} className="flex-1 bg-primary/40 rounded-full" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      );
    case 'tiktok':
    case 'series':
      return (
        <div className="relative h-32 bg-secondary/50 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
          <Play className="w-8 h-8 text-white/80 absolute z-10" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20" />
        </div>
      );
    default:
      return null;
  }
};

export function MarketCard({ market, prices, index }: MarketCardProps) {
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeSide, setTradeSide] = useState<"YES" | "NO">("YES");
  const [showComments, setShowComments] = useState(false);
  
  // Find the leading outcome
  const leadingOutcomeId = Object.keys(prices).reduce((a, b) => prices[a] > prices[b] ? a : b);
  const leadingProbability = prices[leadingOutcomeId];
  const yesProbability = prices[market.outcomes[0].id] || 0.5;
  const noProbability = 1 - yesProbability;

  const handleTradeClick = (e: React.MouseEvent, side: "YES" | "NO") => {
    e.preventDefault();
    e.stopPropagation();
    setTradeSide(side);
    setIsTradeModalOpen(true);
  };

  const toggleComments = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowComments(!showComments);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="mb-4"
      >
        <div className="p-4 rounded-[24px] bg-card shadow-sm border border-border/40">
          <Link href={`/market/${market.id}`} className="block">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                  {getCategoryIcon(market.category)}
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {market.category}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                <Brain className="w-3.5 h-3.5" />
                <span>AI {market.sentimentScore}</span>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold leading-snug text-foreground line-clamp-2 mb-4">
              {market.title}
            </h3>

            {/* Dynamic Media Area */}
            <DynamicMedia category={market.category} />

            {/* Outcome Section */}
            <div className="mb-4">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-sm font-bold text-success">YES {(yesProbability * 100).toFixed(0)}%</span>
                <span className="text-sm font-bold text-danger">NO {(noProbability * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                <div className="h-full bg-success transition-all duration-500" style={{ width: `${yesProbability * 100}%` }} />
                <div className="h-full bg-danger transition-all duration-500" style={{ width: `${noProbability * 100}%` }} />
              </div>
            </div>
          </Link>

          {/* Action Row */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={(e) => handleTradeClick(e, "YES")}
              className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
            >
              <span className="font-bold text-success">Buy YES</span>
              <span className="font-mono text-sm text-muted-foreground">${yesProbability.toFixed(2)}</span>
            </button>
            <button 
              onClick={(e) => handleTradeClick(e, "NO")}
              className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
            >
              <span className="font-bold text-danger">Buy NO</span>
              <span className="font-mono text-sm text-muted-foreground">${noProbability.toFixed(2)}</span>
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/40 text-muted-foreground">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-xs font-medium">24</span>
              </button>
              <button onClick={toggleComments} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs font-medium">12</span>
              </button>
              <Link href={`/market/${market.id}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <BarChart2 className="w-4 h-4" />
              </Link>
            </div>
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              <span className="text-xs font-medium">Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Inline Comments */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-3 border-t border-border/40 space-y-3">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary shrink-0" />
                    <div>
                      <p className="text-xs font-semibold">user_123 <span className="text-muted-foreground font-normal">2h ago</span></p>
                      <p className="text-sm text-foreground mt-0.5">This is definitely going to happen.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary shrink-0" />
                    <div>
                      <p className="text-xs font-semibold">crypto_whale <span className="text-muted-foreground font-normal">5h ago</span></p>
                      <p className="text-sm text-foreground mt-0.5">I&apos;m betting NO on this one.</p>
                    </div>
                  </div>
                  <div className="relative mt-2">
                    <input 
                      type="text" 
                      placeholder="Add a comment..." 
                      className="w-full bg-secondary/50 border-none rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <QuickTradeModal 
        isOpen={isTradeModalOpen} 
        onClose={() => setIsTradeModalOpen(false)} 
        marketTitle={market.title}
        outcomeTitle={tradeSide}
        probability={tradeSide === "YES" ? yesProbability : noProbability}
      />
    </>
  );
}
