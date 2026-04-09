import { useState, useEffect } from 'react';

export function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export function formatCountdown(timeLeft: ReturnType<typeof useCountdown>) {
  if (timeLeft.isExpired) return "Ended";
  if (timeLeft.days > 0) return `${timeLeft.days}d ${timeLeft.hours}h`;
  if (timeLeft.hours > 0) return `${timeLeft.hours}h ${timeLeft.minutes}m`;
  return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
}
