import Link from "next/link";
import { motion } from "motion/react";
import { Bitcoin, Trophy, Landmark, Laptop } from "lucide-react";

interface RelatedMarketCardProps {
  id: string;
  title: string;
  probability: number;
  category: string;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'crypto': return <Bitcoin className="w-3 h-3" />;
    case 'sports': return <Trophy className="w-3 h-3" />;
    case 'politics': return <Landmark className="w-3 h-3" />;
    case 'tech': return <Laptop className="w-3 h-3" />;
    default: return null;
  }
};

export function RelatedMarketCard({ id, title, probability, category }: RelatedMarketCardProps) {
  return (
    <Link href={`/market/${id}`}>
      <motion.div 
        whileTap={{ scale: 0.97 }}
        className="w-[200px] p-4 bg-card rounded-[16px] shadow-sm border border-border/30 flex flex-col justify-between h-full hover:border-border/80 transition-colors"
      >
        <div>
          <div className="flex items-center space-x-1 text-muted-foreground mb-2">
            {getCategoryIcon(category)}
            <p className="text-[10px] uppercase tracking-wider font-semibold">
              {category}
            </p>
          </div>
          <h4 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground mb-4">
            {title}
          </h4>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Leading</span>
          <span className="font-mono font-bold text-primary">{(probability * 100).toFixed(0)}%</span>
        </div>
      </motion.div>
    </Link>
  );
}
