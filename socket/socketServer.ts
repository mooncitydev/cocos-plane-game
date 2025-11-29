import { Server, Socket } from 'socket.io';
import * as http from "http";
import TokenModel from "../model/TokenModel";

export let io: Server | null = null;
export let counter = 0;

// Map of mint addresses to subscribed sockets
export const tokenSubscriptions = new Map<string, Set<Socket>>();
// Map of wallet addresses to subscribed sockets
export const walletSubscriptions = new Map<string, Set<Socket>>();

export const socketio = async (server: http.Server) => {
  try {
    // Socket communication
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: false
      },
      pingInterval: 10000,
      pingTimeout: 2000
    });

    io.on("connection", (socket) => {
      console.log(" --> ADD SOCKET", counter);
      counter++;
      io && io.emit("connectionUpdated", counter);
      
      // Subscribe to token price updates
      socket.on("subscribe:token", (mintAddress: string) => {
        if (!tokenSubscriptions.has(mintAddress)) {
          tokenSubscriptions.set(mintAddress, new Set());
        }
        tokenSubscriptions.get(mintAddress)!.add(socket);
        console.log(`Socket subscribed to token: ${mintAddress}`);
        
        // Send current token data immediately
        TokenModel.findOne({ mintAddress }).then(token => {
          if (token) {
            socket.emit("token:update", {
              mintAddress: token.mintAddress,
              price: token.price,
              priceChange24h: token.priceChange24h,
              priceChangePercent24h: token.priceChangePercent24h,
              volume24h: token.volume24h,
              marketCap: token.marketCap,
              liquidity: token.liquidity
            });
          }
        });
      });
      
      // Unsubscribe from token price updates
      socket.on("unsubscribe:token", (mintAddress: string) => {
        const subscribers = tokenSubscriptions.get(mintAddress);
        if (subscribers) {
          subscribers.delete(socket);
          if (subscribers.size === 0) {
            tokenSubscriptions.delete(mintAddress);
          }
        }
        console.log(`Socket unsubscribed from token: ${mintAddress}`);
      });
      
      // Subscribe to wallet updates
      socket.on("subscribe:wallet", (address: string) => {
        if (!walletSubscriptions.has(address)) {
          walletSubscriptions.set(address, new Set());
        }
        walletSubscriptions.get(address)!.add(socket);
        console.log(`Socket subscribed to wallet: ${address}`);
      });
      
      // Unsubscribe from wallet updates
      socket.on("unsubscribe:wallet", (address: string) => {
        const subscribers = walletSubscriptions.get(address);
        if (subscribers) {
          subscribers.delete(socket);
          if (subscribers.size === 0) {
            walletSubscriptions.delete(address);
          }
        }
        console.log(`Socket unsubscribed from wallet: ${address}`);
      });
      
      socket.on("disconnect", () => {
        console.log(" --> REMOVE SOCKET", counter);
        counter--;
        io && io.emit("connectionUpdated", counter);
      
        // Clean up token subscriptions
        tokenSubscriptions.forEach((subscribers, mintAddress) => {
          subscribers.delete(socket);
          if (subscribers.size === 0) {
            tokenSubscriptions.delete(mintAddress);
          }
        });
        
        // Clean up wallet subscriptions
        walletSubscriptions.forEach((subscribers, address) => {
          subscribers.delete(socket);
          if (subscribers.size === 0) {
            walletSubscriptions.delete(address);
          }
        });
      });
    });

  } catch (err) {
    console.error(err);
  }
};

// Helper function to broadcast token updates
export const broadcastTokenUpdate = (mintAddress: string, data: any) => {
  const subscribers = tokenSubscriptions.get(mintAddress);
  if (subscribers && subscribers.size > 0) {
    subscribers.forEach(socket => {
      socket.emit("token:update", {
        mintAddress,
        ...data
      });
    });
  }
};

// Helper function to broadcast wallet updates
export const broadcastWalletUpdate = (address: string, data: any) => {
  const subscribers = walletSubscriptions.get(address);
  if (subscribers && subscribers.size > 0) {
    subscribers.forEach(socket => {
      socket.emit("wallet:update", {
        address,
        ...data
      });
    });
  }
};
