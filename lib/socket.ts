import { io } from 'socket.io-client';

// Initialize socket connection
export const socket = io({
  path: '/socket.io',
  autoConnect: false,
});
