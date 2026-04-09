"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface QuickTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  outcomeTitle: string;
  probability: number;
  currentPrice: number;
  balance: number;
  onTrade: (amount: number, side: "YES" | "NO") => void;
}

export function QuickTradeModal({
  isOpen,
  onClose,
  outcomeTitle,
  probability,
  currentPrice,
  balance,
  onTrade
}: QuickTradeModalProps) {
  const [amount, setAmount] = useState<string>("10");
  const [side, setSide] = useState<"YES" | "NO">("YES");

  const numAmount = parseFloat(amount || "0");
  const estimatedReturn = numAmount > 0 ? (numAmount / (side === "YES" ? currentPrice : 1 - currentPrice)).toFixed(2) : "0.00";

  const handleTrade = () => {
    if (numAmount > 0 && numAmount <= balance) {
      onTrade(numAmount, side);
      onClose();
    }
  };

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
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[340px] bg-card rounded-[28px] shadow-2xl border border-border/50 p-6 pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Trade</h3>
                  <p className="text-sm text-muted-foreground font-medium">{outcomeTitle}</p>
                </div>
                <button onClick={onClose} className="p-2 bg-secondary rounded-full text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* YES / NO Toggle */}
                <div className="flex bg-secondary p-1 rounded-xl">
                  <button
                    onClick={() => setSide("YES")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${side === "YES" ? "bg-card shadow-sm text-success" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Buy YES {(currentPrice * 100).toFixed(0)}¢
                  </button>
                  <button
                    onClick={() => setSide("NO")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${side === "NO" ? "bg-card shadow-sm text-danger" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Buy NO {((1 - currentPrice) * 100).toFixed(0)}¢
                  </button>
                </div>

                {/* Amount Input */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground font-medium">Amount ($)</span>
                    <span className="text-muted-foreground font-medium">Bal: ${balance.toLocaleString()}</span>
                  </div>
                  <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-lg">$</span>
                    <Input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 font-mono text-2xl h-14 bg-secondary/50 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary"
                      placeholder="0.00"
                    />
                  </div>
                  
                  {/* Slider */}
                  <Slider
                    defaultValue={[10]}
                    max={balance}
                    step={1}
                    value={[numAmount]}
                    onValueChange={(vals) => {
                      if (Array.isArray(vals)) {
                        setAmount(vals[0].toString());
                      } else {
                        setAmount(vals.toString());
                      }
                    }}
                    className="py-2"
                  />
                </div>

                {/* Estimated Return */}
                <div className="flex justify-between items-center p-4 bg-secondary/30 rounded-xl border border-border/50">
                  <span className="text-sm text-muted-foreground font-medium">Estimated Return</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xl text-primary">${estimatedReturn}</span>
                  </div>
                </div>

                {/* Actions */}
                <Button 
                  className={`w-full h-14 text-lg font-bold rounded-xl shadow-sm text-white ${side === "YES" ? "bg-success hover:bg-success/90" : "bg-danger hover:bg-danger/90"}`}
                  onClick={handleTrade}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                >
                  Confirm Trade
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
