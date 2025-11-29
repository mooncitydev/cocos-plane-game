import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from 'path';
import { PORT, connectDb as connectMongoDB } from "./config";
import http from "http";
import CoinRouter from "./routes/CoinRoute";
import TokenRouter from "./routes/TokenRoute";
import AnalyticsRouter from "./routes/AnalyticsRoute";
import WalletRouter from "./routes/WalletRoute";
import { socketio } from "./socket/socketServer";

// Load environment variables from .env file
dotenv.config();

// Connect to the MongoDB database
connectMongoDB();

// Create an instance of the Express application
const app = express();

// Set up Cross-Origin Resource Sharing (CORS) options
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, './public')));

// Parse incoming JSON requests using body-parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const server = http.createServer(app);

// Initialize Socket.IO
socketio(server);

// Define routes for different API endpoints
app.use("/token", CoinRouter); // Legacy route
app.use("/api/tokens", TokenRouter); // New token routes
app.use("/api/analytics", AnalyticsRouter); // Analytics routes
app.use("/api/wallets", WalletRouter); // Wallet routes

// Health check endpoint
app.get("/", async (req: any, res: any) => {
  res.json({
    status: true,
    message: "Trading Platform Backend API is running!",
    version: "1.0.0",
    endpoints: {
      tokens: "/api/tokens",
      analytics: "/api/analytics",
      wallets: "/api/wallets"
    }
  });
});

app.get("/health", async (req: any, res: any) => {
  res.json({
    status: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start the Express server to listen on the specified port
server.listen(PORT, () => {
  console.log(`🚀 Trading Platform Backend API server is running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket server ready for real-time updates`);
});
