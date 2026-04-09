import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuickTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketTitle: string;
  outcomeTitle: string;
  probability: number;
}

export function QuickTradeModal({ isOpen, onClose, marketTitle, outcomeTitle, probability }: QuickTradeModalProps) {
  const [amount, setAmount] = useState("");
  const [side, setSide] = useState<"YES" | "NO">(outcomeTitle === "NO" ? "NO" : "YES");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-card rounded-[28px] shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-5 pb-4 flex justify-between items-center">
              <h3 className="font-bold text-xl">Trade</h3>
              <button onClick={onClose} className="p-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-5 pb-6 space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Market</p>
                <p className="font-semibold text-base leading-snug line-clamp-2">{marketTitle}</p>
              </div>
              
              <div className="flex bg-secondary p-1 rounded-xl">
                <button
                  onClick={() => setSide("YES")}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${side === "YES" ? "bg-card shadow-sm text-success" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Buy YES {(probability * 100).toFixed(0)}¢
                </button>
                <button
                  onClick={() => setSide("NO")}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${side === "NO" ? "bg-card shadow-sm text-danger" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Buy NO {((1 - probability) * 100).toFixed(0)}¢
                </button>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Amount (USD)</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 font-bold text-xl h-14 rounded-xl bg-secondary border-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-muted-foreground font-medium">Potential Return</span>
                <span className="font-bold text-success text-lg">
                  ${amount ? (parseFloat(amount) / (side === "YES" ? probability : 1 - probability)).toFixed(2) : "0.00"}
                </span>
              </div>
              
              <Button className="w-full h-14 rounded-xl font-bold text-lg bg-primary hover:bg-primary/90 text-primary-foreground" onClick={onClose}>
                Confirm Trade
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
