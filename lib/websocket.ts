import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from './auth';
import { AuthUser } from './auth';

let io: SocketIOServer | null = null;

export function initializeWebSocket(server: HTTPServer) {
  const allowedOrigins = process.env.NEXT_PUBLIC_APP_URL
    ? [process.env.NEXT_PUBLIC_APP_URL]
    : process.env.NODE_ENV === 'production'
    ? ['https://rispay.onrender.com'] // Update with your Render URL
    : ['http://localhost:3000'];

  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const payload = verifyToken(token);
    if (!payload) {
      return next(new Error('Invalid token'));
    }

    socket.data.user = {
      id: payload.userId,
      username: payload.username,
      role: payload.role,
    };

    next();
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as AuthUser;
    console.log(`User ${user.username} connected`);

    // Join user-specific room
    socket.join(`user:${user.id}`);

    socket.on('disconnect', () => {
      console.log(`User ${user.username} disconnected`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

/**
 * Emit balance update to user
 */
export function emitBalanceUpdate(userId: string, accountId: string, newBalance: number) {
  const socketIO = getIO();
  socketIO.to(`user:${userId}`).emit('balance_update', {
    accountId,
    balance: newBalance,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Emit transaction notification to user
 */
export function emitTransactionNotification(
  userId: string,
  transaction: {
    id: string;
    amount: number;
    type: 'sent' | 'received';
    memo?: string;
  }
) {
  const socketIO = getIO();
  socketIO.to(`user:${userId}`).emit('transaction_notification', {
    ...transaction,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Emit interest payout notification
 */
export function emitInterestPayout(userId: string, accountId: string, interest: number) {
  const socketIO = getIO();
  socketIO.to(`user:${userId}`).emit('interest_payout', {
    accountId,
    interest,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast admin message to all users
 */
export function broadcastAdminMessage(message: string) {
  const socketIO = getIO();
  socketIO.emit('admin_broadcast', {
    message,
    timestamp: new Date().toISOString(),
  });
}
