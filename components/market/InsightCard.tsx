import { ReactNode } from "react";

interface InsightCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  highlight?: boolean;
}

export function InsightCard({ title, value, icon, subtitle, highlight }: InsightCardProps) {
  return (
    <div className="p-4 bg-card rounded-[16px] shadow-sm border border-border/30 flex flex-col justify-between">
      <div className="flex items-center space-x-2 mb-3 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-semibold">{title}</span>
      </div>
      <div>
        <p className={`text-xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
