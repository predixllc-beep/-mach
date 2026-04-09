import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import Redis from 'ioredis';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Initialize Redis (mocked or real depending on env)
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redis: Redis | null = null;
try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null // Do not retry if it fails to connect initially for local dev without redis
  });
  redis.on('error', (err) => {
    console.warn('Redis connection error (expected if no local redis server):', err.message);
  });
} catch (e) {
  console.warn('Failed to initialize Redis:', e);
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('trade', async (data) => {
      // Broadcast trade to all clients
      io.emit('trade_executed', data);
      
      // Cache latest trade in Redis
      if (redis && redis.status === 'ready') {
        try {
          await redis.lpush(`trades:${data.marketId}`, JSON.stringify(data));
          await redis.ltrim(`trades:${data.marketId}`, 0, 49); // Keep last 50 trades
        } catch (e) {
          console.error('Redis error:', e);
        }
      }
    });

    socket.on('market_update', async (data) => {
      // Broadcast market update
      io.emit('market_updated', data);
      
      // Cache latest market state in Redis
      if (redis && redis.status === 'ready') {
        try {
          await redis.set(`market:${data.marketId}`, JSON.stringify(data));
        } catch (e) {
          console.error('Redis error:', e);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
