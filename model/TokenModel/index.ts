import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
  mintAddress: { type: String, required: true, unique: true, index: true },
  symbol: { type: String },
  name: { type: String },
  decimals: { type: Number, default: 9 },
  image: { type: String },
  description: { type: String },
  
  // Price data
  price: { type: Number, default: 0 },
  priceChange24h: { type: Number, default: 0 },
  priceChangePercent24h: { type: Number, default: 0 },
  
  // Market data
  marketCap: { type: Number, default: 0 },
  volume24h: { type: Number, default: 0 },
  volume7d: { type: Number, default: 0 },
  liquidity: { type: Number, default: 0 },
  
  // Holder data
  holderCount: { type: Number, default: 0 },
  topHolders: [{ 
    address: String, 
    balance: Number, 
    percentage: Number 
  }],
  
  // Social data
  twitterUrl: { type: String },
  websiteUrl: { type: String },
  telegramUrl: { type: String },
  
  // Metadata
  creator: { type: String },
  createdAt: { type: Date },
  firstSeenAt: { type: Date, default: Date.now },
  
  // Analytics
  isVerified: { type: Boolean, default: false },
  riskScore: { type: Number, default: 0 },
  tags: [{ type: String }],
  
  // Timestamps
  lastUpdated: { type: Date, default: Date.now },
  date: { type: Date, default: Date.now },
});

// Indexes for better query performance
TokenSchema.index({ marketCap: -1 });
TokenSchema.index({ volume24h: -1 });
TokenSchema.index({ priceChangePercent24h: -1 });
TokenSchema.index({ createdAt: -1 });

const TokenModel = mongoose.model("token", TokenSchema);

export default TokenModel;

