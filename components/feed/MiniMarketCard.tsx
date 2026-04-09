import Link from "next/link";
import { motion } from "motion/react";
import { Clock, CheckCircle2 } from "lucide-react";

interface MiniMarketCardProps {
  id: string;
  title: string;
  type: "closing" | "resolved";
  timeLeft?: string;
  result?: string;
  probability?: number;
}

export function MiniMarketCard({ id, title, type, timeLeft, result, probability }: MiniMarketCardProps) {
  return (
    <Link href={`/market/${id}`}>
      <motion.div
        whileTap={{ scale: 0.97 }}
        className={`w-[160px] h-[100px] rounded-[16px] p-3 flex flex-col justify-between shadow-sm border border-border/40 ${
          type === "resolved" ? "bg-secondary/30 opacity-80" : "bg-card"
        }`}
      >
        <div>
          <div className="flex items-center space-x-1 mb-1.5">
            {type === "closing" ? (
              <>
                <Clock className="w-3 h-3 text-[#F59E0B]" />
                <span className="text-[10px] font-medium text-[#F59E0B] uppercase tracking-wider">
                  {timeLeft}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Resolved
                </span>
              </>
            )}
          </div>
          <p className="text-xs font-semibold leading-snug line-clamp-2 text-foreground">
            {title}
          </p>
        </div>

        {type === "closing" && probability !== undefined ? (
          <div className="flex justify-between items-end mt-2">
            <span className="text-[10px] text-muted-foreground font-medium">Leading</span>
            <span className="font-bold text-primary text-sm">{(probability * 100).toFixed(0)}%</span>
          </div>
        ) : (
          <div className="flex justify-between items-end mt-2">
            <span className="text-[10px] text-muted-foreground font-medium">Result</span>
            <span className="text-xs font-bold text-foreground">{result}</span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
