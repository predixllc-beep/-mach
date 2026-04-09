"use client";

import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import { useStore } from '@/store/useStore';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const updateMarket = useStore((state: any) => state.updateMarket);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('market_updated', (market) => {
      console.log('Market updated received:', market);
      updateMarket(market);
    });

    socket.on('trade_executed', (trade) => {
      console.log('Trade executed received:', trade);
      // Dispatch custom event for UI components (like ClockLogo) to react
      window.dispatchEvent(new CustomEvent('trade_executed', { detail: trade }));
    });

    return () => {
      socket.off('connect');
      socket.off('market_updated');
      socket.off('trade_executed');
      socket.disconnect();
    };
  }, [updateMarket]);

  return <>{children}</>;
}
