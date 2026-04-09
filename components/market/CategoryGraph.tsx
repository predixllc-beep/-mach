"use client";

import { useMemo, useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, BarChart, Bar } from "recharts";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, Play, Heart, MessageCircle, Share2 } from "lucide-react";

interface CategoryGraphProps {
  category: string;
  probability: number;
}

// Dummy data generators
const generateChartData = (currentProb: number) => {
  const data = [];
  let prob = 0.5;
  for (let i = 30; i >= 0; i--) {
    data.push({
      time: format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), "MMM dd"),
      prob: prob * 100,
    });
    prob += (currentProb - prob) * 0.1 + (Math.random() - 0.5) * 0.05;
  }
  data[data.length - 1].prob = currentProb * 100;
  return data;
};

const sportsEvents = [
  { minute: 12, type: "goal", team: "A" },
  { minute: 25, type: "yellow_card", team: "B" },
  { minute: 67, type: "goal", team: "A" },
  { minute: 82, type: "red_card", team: "B" },
];

const generateSportsData = () => {
  const data = [];
  let momentum = 50;
  for (let i = 0; i <= 90; i++) {
    const event = sportsEvents.find(e => e.minute === i);
    data.push({
      minute: i,
      momentum: momentum,
      event: event ? event.type : null,
    });
    // Random walk with mean reversion
    momentum += (Math.random() - 0.5) * 15 + (50 - momentum) * 0.05;
    momentum = Math.max(5, Math.min(95, momentum));
  }
  return data;
};

const generateTikTokData = () => {
  const data = [];
  let views = 1000;
  for (let i = 24; i >= 0; i--) {
    data.push({
      hour: `${24 - i}h ago`,
      views: Math.floor(views),
      engagement: Math.floor(views * 0.15 * (1 + Math.random() * 0.2)),
    });
    // Exponential growth simulation
    views = views * (1 + Math.random() * 0.3);
  }
  return data;
};

const generateMusicData = () => {
  const data = [];
  let streams = 50000;
  for (let i = 14; i >= 0; i--) {
    data.push({
      day: format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), "MMM dd"),
      streams: Math.floor(streams),
    });
    // Trend with some daily seasonality
    streams = streams * (1 + (Math.random() - 0.3) * 0.1);
  }
  return data;
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload.event) return null;

  const emoji = payload.event === 'goal' ? '⚽' : payload.event === 'yellow_card' ? '🟨' : '🟥';

  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle r={12} fill="var(--card)" stroke="var(--border)" strokeWidth={1} />
      <text x={0} y={4} textAnchor="middle" fontSize="12">{emoji}</text>
    </g>
  );
};

export function CategoryGraph({ category, probability }: CategoryGraphProps) {
  const chartData = useMemo(() => generateChartData(probability), [probability]);
  const sportsData = useMemo(() => generateSportsData(), []);
  const tiktokData = useMemo(() => generateTikTokData(), []);
  const musicData = useMemo(() => generateMusicData(), []);

  const [scoreA, setScoreA] = useState(1);
  const [scoreB, setScoreB] = useState(0);

  // Simulate a live goal after component mounts
  useEffect(() => {
    if (category.toLowerCase() === 'sports') {
      const timer = setTimeout(() => {
        setScoreA(2);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [category]);

  if (category.toLowerCase() === 'sports') {
    return (
      <div className="w-full space-y-4">
        {/* Match Simulation Header */}
        <div className="bg-card border border-border/50 rounded-[16px] p-4 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
          <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2 animate-pulse">
            Live &bull; 67&apos;
          </div>
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2 font-bold text-lg">
                A
              </div>
              <span className="text-sm font-semibold">Team A</span>
            </div>
            
            {/* Animated Score */}
            <div className="flex items-center space-x-4 h-12 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span 
                  key={`score-a-${scoreA}`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                  className="text-4xl font-black font-mono inline-block"
                >
                  {scoreA}
                </motion.span>
              </AnimatePresence>
              <span className="text-xl text-muted-foreground font-bold">-</span>
              <AnimatePresence mode="popLayout">
                <motion.span 
                  key={`score-b-${scoreB}`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                  className="text-4xl font-black font-mono inline-block"
                >
                  {scoreB}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2 font-bold text-lg">
                B
              </div>
              <span className="text-sm font-semibold">Team B</span>
            </div>
          </div>
        </div>

        {/* Momentum Chart with Overlaid Events */}
        <div className="h-[180px] w-full -ml-2 relative">
          <div className="absolute top-2 left-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Match Momentum
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sportsData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="minute" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                labelStyle={{ display: 'none' }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                formatter={(value: any, name: any, props: any) => {
                  if (props.payload.event) {
                    const eventName = props.payload.event === 'goal' ? 'Goal!' : props.payload.event === 'yellow_card' ? 'Yellow Card' : 'Red Card';
                    return [`${Number(value).toFixed(0)} (${eventName})`, 'Momentum'];
                  }
                  return [`${Number(value).toFixed(0)}`, 'Momentum'];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="momentum" 
                stroke="var(--primary)" 
                strokeWidth={3} 
                dot={(props) => <CustomDot {...props} />} 
                activeDot={{ r: 6, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (category.toLowerCase() === 'tiktok') {
    const latestData = tiktokData[tiktokData.length - 1];
    return (
      <div className="w-full space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <Play className="w-4 h-4 text-blue-500 mb-1" />
            <span className="text-lg font-bold font-mono">{(latestData.views / 1000).toFixed(1)}k</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Views</span>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <Heart className="w-4 h-4 text-pink-500 mb-1" />
            <span className="text-lg font-bold font-mono">{((latestData.engagement * 0.7) / 1000).toFixed(1)}k</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Likes</span>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <Share2 className="w-4 h-4 text-green-500 mb-1" />
            <span className="text-lg font-bold font-mono">{((latestData.engagement * 0.3) / 1000).toFixed(1)}k</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Shares</span>
          </div>
        </div>
        <div className="h-[180px] w-full -ml-2 relative">
          <div className="absolute top-2 left-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Engagement Velocity (24h)
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tiktokData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                labelStyle={{ color: 'var(--muted-foreground)', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (category.toLowerCase() === 'music') {
    return (
      <div className="w-full space-y-4">
        <div className="bg-card border border-border/50 rounded-[16px] p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Daily Streams</p>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold font-mono">{musicData[musicData.length - 1].streams.toLocaleString()}</span>
              <span className="flex items-center text-xs font-bold text-[#16C784]">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +12.4%
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Play className="w-6 h-6 text-primary ml-1" />
          </div>
        </div>
        <div className="h-[180px] w-full -ml-2 relative">
          <div className="absolute top-2 left-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Stream Trend (14d)
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={musicData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" hide />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'var(--secondary)' }}
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                labelStyle={{ color: 'var(--muted-foreground)', fontSize: '12px' }}
              />
              <Bar dataKey="streams" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Default Chart (Crypto, Politics, Tech)
  return (
    <div className="h-[250px] w-full -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            itemStyle={{ color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 'bold' }}
            labelStyle={{ color: 'var(--muted-foreground)', fontSize: '12px' }}
          />
          <Area type="monotone" dataKey="prob" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorProb)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
