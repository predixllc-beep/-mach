"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, CheckCircle2, Link as LinkIcon, AlertCircle, ShieldCheck, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";

type Step = "input" | "analyzing" | "review";

interface GeneratedMarket {
  title: string;
  category: string;
  outcomes: string[];
  probabilities: number[];
  endDate: string;
  confidenceScore: number;
  reasoning: string;
}

export default function CreateMarketPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<Step>("input");
  const [input, setInput] = useState("");
  const [loadingPhase, setLoadingPhase] = useState(0);
  
  const [marketData, setMarketData] = useState<GeneratedMarket | null>(null);
  const [ownership, setOwnership] = useState<"own" | "dont_own" | null>(null);
  const [proof, setProof] = useState("");

  // Loading phases animation
  useEffect(() => {
    if (step === "analyzing") {
      const phases = [
        { delay: 0, phase: 0 }, // Analyzing content
        { delay: 1500, phase: 1 }, // Fetching data
        { delay: 3000, phase: 2 }, // Generating market
      ];
      
      const timeouts = phases.map(p => setTimeout(() => setLoadingPhase(p.phase), p.delay));
      return () => timeouts.forEach(clearTimeout);
    }
  }, [step]);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setStep("analyzing");
    setLoadingPhase(0);

    try {
      const res = await fetch("/api/ai/generate-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!res.ok) throw new Error("Failed to generate");
      
      const data = await res.json();
      setMarketData(data);
      
      // Ensure the loading animation finishes its sequence before moving on
      setTimeout(() => setStep("review"), 1000);
    } catch (error) {
      console.error(error);
      alert("Failed to generate market. Please try again.");
      setStep("input");
    }
  };

  const handleCreate = () => {
    if (!marketData || !ownership) return;
    if (ownership === "own" && !proof) {
      alert("Please provide proof of ownership.");
      return;
    }
    if (ownership === "dont_own" && !proof) {
      alert("Please provide source attribution.");
      return;
    }

    // In a real app, this would save to Supabase
    // For now, we mock it by adding to Zustand store (if we had an addMarket action)
    // and redirecting to home
    
    alert("Market created successfully!");
    router.push("/");
  };

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 pt-4 pb-4 px-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Create Market</h1>
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-full">
          <X className="w-5 h-5" />
        </Button>
      </header>

      <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: INPUT */}
          {step === "input" && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-center space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">What&apos;s happening?</h2>
                <p className="text-muted-foreground text-sm">Paste a link or write a topic. AI will do the rest.</p>
              </div>

              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste TikTok link, YouTube URL, or write a topic..."
                  className="w-full h-32 p-4 bg-secondary/50 border-none rounded-2xl resize-none focus:ring-2 focus:ring-primary text-lg"
                  autoFocus
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={!input.trim()}
                className="w-full h-14 rounded-xl text-lg font-bold shadow-lg"
              >
                Generate Market <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: ANALYZING */}
          {step === "analyzing" && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center space-y-8"
            >
              <div className="relative w-24 h-24">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>

              <div className="space-y-4 w-full max-w-[240px]">
                <LoadingStep text="Analyzing content..." active={loadingPhase >= 0} done={loadingPhase > 0} />
                <LoadingStep text="Fetching real-time data..." active={loadingPhase >= 1} done={loadingPhase > 1} />
                <LoadingStep text="Generating market..." active={loadingPhase >= 2} done={false} />
              </div>
            </motion.div>
          )}

          {/* STEP 3: REVIEW */}
          {step === "review" && marketData && (
            <motion.div 
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col space-y-6 pb-24"
            >
              <div className="bg-primary/10 text-primary px-4 py-3 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-snug">{marketData.reasoning}</p>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Market Title</label>
                  <Input 
                    value={marketData.title}
                    onChange={(e) => setMarketData({...marketData, title: e.target.value})}
                    className="font-semibold text-lg h-auto py-3 bg-card border-border/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category (Locked) */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Category</label>
                    <div className="h-12 bg-secondary/50 rounded-xl flex items-center px-4 text-sm font-semibold text-muted-foreground border border-border/30">
                      {marketData.category}
                    </div>
                  </div>
                  
                  {/* AI Confidence (Locked) */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">AI Confidence</label>
                    <div className="h-12 bg-secondary/50 rounded-xl flex items-center px-4 text-sm font-semibold text-primary border border-border/30 gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      {marketData.confidenceScore}%
                    </div>
                  </div>
                </div>

                {/* Outcomes */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Outcomes & Initial Price</label>
                  <div className="space-y-2">
                    {marketData.outcomes.map((outcome, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-card border border-border/50 p-2 rounded-xl">
                        <Input 
                          value={outcome}
                          onChange={(e) => {
                            const newOutcomes = [...marketData.outcomes];
                            newOutcomes[idx] = e.target.value;
                            setMarketData({...marketData, outcomes: newOutcomes});
                          }}
                          className="border-none bg-transparent font-semibold focus-visible:ring-0"
                        />
                        <div className="shrink-0 px-3 py-1.5 bg-secondary rounded-lg font-mono text-sm font-bold">
                          {(marketData.probabilities[idx] * 100).toFixed(0)}¢
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Resolution Date</label>
                  <Input 
                    type="datetime-local"
                    value={marketData.endDate.slice(0, 16)}
                    onChange={(e) => setMarketData({...marketData, endDate: new Date(e.target.value).toISOString()})}
                    className="bg-card border-border/50"
                  />
                </div>

                {/* Ownership Check */}
                <div className="pt-4 border-t border-border/50">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Content Ownership</label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setOwnership("own")}
                      className={`p-3 rounded-xl border text-sm font-bold transition-colors flex flex-col items-center gap-2 ${ownership === "own" ? "bg-primary/10 border-primary text-primary" : "bg-card border-border/50 text-muted-foreground hover:border-border"}`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      I own this
                    </button>
                    <button
                      onClick={() => setOwnership("dont_own")}
                      className={`p-3 rounded-xl border text-sm font-bold transition-colors flex flex-col items-center gap-2 ${ownership === "dont_own" ? "bg-secondary border-foreground text-foreground" : "bg-card border-border/50 text-muted-foreground hover:border-border"}`}
                    >
                      <LinkIcon className="w-5 h-5" />
                      I don&apos;t own this
                    </button>
                  </div>

                  <AnimatePresence>
                    {ownership && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <Input 
                          placeholder={ownership === "own" ? "Paste proof link (e.g. Twitter profile)" : "Paste source URL"}
                          value={proof}
                          onChange={(e) => setProof(e.target.value)}
                          className="bg-card border-border/50"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={handleCreate}
                  disabled={!ownership || !proof}
                  className="w-full h-14 rounded-xl text-lg font-bold shadow-lg"
                >
                  Deploy Market
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}

function LoadingStep({ text, active, done }: { text: string, active: boolean, done: boolean }) {
  return (
    <div className={`flex items-center gap-3 transition-opacity duration-500 ${active ? "opacity-100" : "opacity-30"}`}>
      <div className="w-6 h-6 shrink-0 flex items-center justify-center">
        {done ? (
          <CheckCircle2 className="w-5 h-5 text-success" />
        ) : active ? (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
          />
        ) : (
          <div className="w-2 h-2 bg-muted rounded-full" />
        )}
      </div>
      <span className={`text-sm font-medium ${done ? "text-success" : active ? "text-foreground" : "text-muted-foreground"}`}>
        {text}
      </span>
    </div>
  );
}
