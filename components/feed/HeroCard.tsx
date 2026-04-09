import Link from "next/link";
import { motion } from "motion/react";
import { Market } from "@/store/useStore";
import { useCountdown, formatCountdown } from "@/lib/useCountdown";
import { Brain, TrendingUp } from "lucide-react";

interface HeroCardProps {
  market: Market;
  leadingOutcomeTitle: string;
  leadingProbability: number;
}

export function HeroCard({ market, leadingOutcomeTitle, leadingProbability }: HeroCardProps) {
  const timeLeft = useCountdown(market.endDate);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="px-4 mb-5"
    >
      <Link href={`/market/${market.id}`}>
        <div className="relative p-5 w-full rounded-[28px] shadow-sm group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          
          <div className="flex justify-between items-center mb-4">
            <span className="px-2.5 py-1 bg-background rounded-full text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm border border-primary/10">
              Featured
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-background rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm border border-border/50">
              <Brain className="w-3 h-3" />
              <span>AI {market.sentimentScore}</span>
            </div>
          </div>
          
          <h2 className="text-xl font-bold leading-tight line-clamp-2 text-foreground mb-6">
            {market.title}
          </h2>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Leading Outcome</p>
              <p className="font-semibold text-sm text-foreground">{leadingOutcomeTitle}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="text-success font-bold text-2xl">
                {(leadingProbability * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          
          <div className="mt-4 h-2 w-full bg-background rounded-full overflow-hidden flex">
            <div className="h-full bg-success transition-all duration-500" style={{ width: `${leadingProbability * 100}%` }} />
            <div className="h-full bg-danger transition-all duration-500" style={{ width: `${(1 - leadingProbability) * 100}%` }} />
          </div>

        </div>
      </Link>
    </motion.div>
  );
}
