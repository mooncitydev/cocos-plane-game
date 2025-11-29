import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true, index: true },
  
  // Portfolio data
  totalValue: { type: Number, default: 0 },
  totalValueChange24h: { type: Number, default: 0 },
  totalValueChangePercent24h: { type: Number, default: 0 },
  
  // Token holdings
  tokens: [{
    mintAddress: String,
    balance: Number,
    value: Number,
    percentage: Number
  }],
  
  // Trading stats
  totalTrades: { type: Number, default: 0 },
  totalVolume: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  
  // Activity
  firstSeenAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
  isWhale: { type: Boolean, default: false },
  
  // Labels
  labels: [{ type: String }],
  notes: { type: String },
  
  // Timestamps
  date: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

// Indexes
WalletSchema.index({ totalValue: -1 });
WalletSchema.index({ totalVolume: -1 });
WalletSchema.index({ lastActiveAt: -1 });

const WalletModel = mongoose.model("wallet", WalletSchema);

export default WalletModel;

