# Trading Platform Backend API

A comprehensive trading platform backend API similar to [Axiom.trade](https://axiom.trade) and [GMGN.ai](https://gmgn.ai), built with Node.js, Express, TypeScript, and MongoDB. This platform provides real-time token analytics, wallet tracking, portfolio management, and trading insights for Solana and other blockchain networks.

## 🚀 Features

### Core Features
- **Token Analytics**: Real-time price tracking, volume analysis, market cap, and holder statistics
- **Wallet Tracking**: Monitor wallet portfolios, trading history, and performance metrics
- **Portfolio Management**: Track holdings, calculate P&L, and analyze performance
- **Transaction Monitoring**: Real-time transaction tracking and analysis
- **Market Overview**: Aggregate market data, trending tokens, top gainers/losers
- **Real-time Updates**: WebSocket support for live price and wallet updates
- **Search & Discovery**: Advanced token search and filtering capabilities

### Technical Features
- RESTful API with Express.js
- Real-time WebSocket communication via Socket.IO
- MongoDB for data persistence
- TypeScript for type safety
- Solana blockchain integration
- Token metadata fetching via Metaplex
- Comprehensive error handling and validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Yarn package manager
- Solana RPC endpoint

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cocos-plane-game
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_USERNAME=your_mongodb_username
   DB_PASSWORD=your_mongodb_password
   DB_HOST=your_mongodb_host
   DB_NAME=your_database_name

   # Server Configuration
   PORT=3000

   # Solana Configuration
   RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   RPC_WEBSOCKET_ENDPOINT=wss://api.mainnet-beta.solana.com

   # JWT Secret (if using authentication)
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Start the development server**
   ```bash
   yarn dev
   ```

   Or for production:
   ```bash
   yarn build
   yarn start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Token Endpoints

**Get Token Details**
```http
GET /api/tokens/:mintAddress
```
Returns detailed information about a specific token.

**Response:**
```json
{
  "status": true,
  "data": {
    "mintAddress": "So11111111111111111111111111111111111111112",
    "symbol": "SOL",
    "name": "Solana",
    "price": 150.25,
    "priceChange24h": 5.50,
    "priceChangePercent24h": 3.8,
    "marketCap": 75000000000,
    "volume24h": 5000000000,
    "liquidity": 1000000000,
    "holderCount": 5000000,
    "image": "https://...",
    "description": "..."
  }
}
```

**Create/Update Token**
```http
POST /api/tokens
Content-Type: application/json

{
  "mintAddress": "...",
  "symbol": "TOKEN",
  "name": "Token Name",
  "price": 0.001,
  "marketCap": 1000000,
  "volume24h": 50000
}
```

**Get Token Price History**
```http
GET /api/tokens/:mintAddress/price-history?days=7
```

**Get Token Holders**
```http
GET /api/tokens/:mintAddress/holders?limit=100
```

**Get Token Transactions**
```http
GET /api/tokens/:mintAddress/transactions?limit=100&offset=0&type=buy
```

#### Analytics Endpoints

**Get Token Analytics**
```http
GET /api/analytics/token/:mintAddress
```
Returns comprehensive analytics including recent transactions and top holders.

**Get Trending Tokens**
```http
GET /api/analytics/trending?limit=50&sortBy=volume24h
```
Query parameters:
- `limit`: Number of results (default: 50)
- `sortBy`: Sort field (volume24h, marketCap, priceChangePercent24h)

**Get Wallet Analytics**
```http
GET /api/analytics/wallet/:address
```
Returns wallet portfolio, trading stats, and recent transactions.

**Get Market Overview**
```http
GET /api/analytics/market/overview
```
Returns aggregate market statistics, top gainers, and top losers.

**Search Tokens**
```http
GET /api/analytics/search?q=SOL&limit=20
```

#### Wallet Endpoints

**Get Wallet Portfolio**
```http
GET /api/wallets/portfolio/:address
```

**Update Wallet Portfolio**
```http
POST /api/wallets/portfolio/:address
Content-Type: application/json

{
  "holdings": [...],
  "totalValue": 10000
}
```

**Get Wallet Transactions**
```http
GET /api/wallets/transactions/:address?limit=100&offset=0&type=buy
```

**Track Wallet**
```http
POST /api/wallets/track
Content-Type: application/json

{
  "address": "wallet_address",
  "labels": ["whale", "trader"],
  "notes": "Active trader"
}
```

**Get Tracked Wallets**
```http
GET /api/wallets/tracked?limit=50&offset=0
```

#### Legacy Endpoints

**Get Token List**
```http
POST /token/getList
```

## 🔌 WebSocket API

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### Subscribe to Token Updates
```javascript
// Subscribe to token price updates
socket.emit('subscribe:token', 'mint_address_here');

// Receive token updates
socket.on('token:update', (data) => {
  console.log('Token update:', data);
  // {
  //   mintAddress: "...",
  //   price: 0.001,
  //   priceChange24h: 0.0001,
  //   priceChangePercent24h: 10.5,
  //   volume24h: 50000,
  //   marketCap: 1000000,
  //   liquidity: 500000
  // }
});

// Unsubscribe
socket.emit('unsubscribe:token', 'mint_address_here');
```

### Subscribe to Wallet Updates
```javascript
// Subscribe to wallet updates
socket.emit('subscribe:wallet', 'wallet_address_here');

// Receive wallet updates
socket.on('wallet:update', (data) => {
  console.log('Wallet update:', data);
});

// Unsubscribe
socket.emit('unsubscribe:wallet', 'wallet_address_here');
```

### Connection Status
```javascript
socket.on('connectionUpdated', (count) => {
  console.log('Active connections:', count);
});
```

## 📊 Data Models

### Token Model
- `mintAddress`: Unique token identifier
- `symbol`, `name`: Token information
- `price`, `priceChange24h`, `priceChangePercent24h`: Price data
- `marketCap`, `volume24h`, `liquidity`: Market metrics
- `holderCount`, `topHolders`: Holder information
- `image`, `description`: Metadata
- `isVerified`, `riskScore`: Analytics flags

### Wallet Model
- `address`: Wallet address
- `totalValue`, `totalValueChange24h`: Portfolio value
- `tokens`: Array of token holdings
- `totalTrades`, `totalVolume`, `winRate`: Trading stats
- `isWhale`: Whale flag
- `labels`, `notes`: Custom labels

### Transaction Model
- `signature`: Transaction signature
- `wallet`, `tokenMint`: Participants
- `type`: buy, sell, transfer, swap
- `amount`, `amountUSD`, `price`: Transaction details
- `platform`, `dex`: Trading platform
- `status`: success, failed, pending

### Portfolio Model
- `walletAddress`: Associated wallet
- `holdings`: Array of token holdings with values
- `totalValue`, `totalValueChange24h`: Portfolio metrics
- `totalProfit`, `totalProfitPercent`: Performance metrics

## 🏗️ Project Structure

```
cocos-plane-game/
├── api/                 # API service functions
├── config/              # Configuration files
├── model/               # MongoDB models
│   ├── TokenModel/
│   ├── WalletModel/
│   ├── TransactionModel/
│   ├── PortfolioModel/
│   └── UserModel/
├── routes/              # Express routes
│   ├── TokenRoute/
│   ├── AnalyticsRoute/
│   ├── WalletRoute/
│   └── CoinRoute/
├── socket/              # WebSocket server
├── utils/               # Utility functions
├── index.ts             # Main server file
├── package.json
└── tsconfig.json
```

## 🔧 Development

### Available Scripts

- `yarn dev`: Start development server with hot reload
- `yarn start`: Start production server
- `yarn build`: Build TypeScript to JavaScript
- `yarn ts.check`: Type check without building
- `yarn test`: Run tests

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Pre-commit hooks for type checking

## 🔒 Security Considerations

- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Add authentication/authorization for protected routes
- Validate and sanitize all user inputs
- Use HTTPS in production
- Implement CORS policies appropriately

## 🚀 Deployment

### Environment Setup
1. Set up MongoDB Atlas or self-hosted MongoDB
2. Configure environment variables
3. Set up Solana RPC endpoint (consider using premium RPC for production)
4. Configure reverse proxy (nginx) if needed

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use secure MongoDB connection string
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up backup strategy for MongoDB
- [ ] Use process manager (PM2, systemd)
- [ ] Set up error tracking (Sentry, etc.)

## 📈 Performance Optimization

- Use MongoDB indexes for frequently queried fields
- Implement caching for frequently accessed data (Redis)
- Use connection pooling for database connections
- Optimize WebSocket message broadcasting
- Consider using CDN for static assets
- Implement pagination for large datasets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by [Axiom.trade](https://axiom.trade) and [GMGN.ai](https://gmgn.ai)
- Built with [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- Uses [Metaplex](https://www.metaplex.com/) for NFT metadata

## 📞 Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

---

**Built with ❤️ for the Solana trading community**

