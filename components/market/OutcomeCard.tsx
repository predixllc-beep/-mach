import { motion } from "motion/react";

interface OutcomeCardProps {
  title: string;
  probability: number;
  price: number;
  onTradeClick: () => void;
}

export function OutcomeCard({ title, probability, price, onTradeClick }: OutcomeCardProps) {
  return (
    <button 
      onClick={onTradeClick}
      className="relative w-full overflow-hidden rounded-2xl border border-border/40 bg-card hover:border-primary/50 transition-colors group text-left"
    >
      {/* Background Bar */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${probability * 100}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-y-0 left-0 bg-primary/10"
      />
      
      {/* Content */}
      <div className="relative p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm border border-border/50 font-bold text-xs">
            {title.charAt(0)}
          </div>
          <h4 className="font-semibold text-base text-foreground">{title}</h4>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block font-mono font-bold text-lg text-primary">{(probability * 100).toFixed(0)}%</span>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">${price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
