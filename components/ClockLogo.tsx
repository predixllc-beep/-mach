import { Clock } from "lucide-react";

export function ClockLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className || ''}`}>
      <Clock className="w-6 h-6" />
    </div>
  );
}
