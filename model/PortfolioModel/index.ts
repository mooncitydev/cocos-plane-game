import mongoose from "mongoose";

const PortfolioSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  
  // Portfolio summary
  totalValue: { type: Number, default: 0 },
  totalValueChange24h: { type: Number, default: 0 },
  totalValueChangePercent24h: { type: Number, default: 0 },
  
  // Holdings
  holdings: [{
    mintAddress: { type: String, required: true },
    symbol: String,
    name: String,
    balance: { type: Number, required: true },
    price: Number,
    value: Number,
    valueChange24h: Number,
    valueChangePercent24h: Number,
    percentage: Number,
    image: String
  }],
  
  // Performance
  totalProfit: { type: Number, default: 0 },
  totalProfitPercent: { type: Number, default: 0 },
  bestPerformer: {
    mintAddress: String,
    profit: Number,
    profitPercent: Number
  },
  worstPerformer: {
    mintAddress: String,
    profit: Number,
    profitPercent: Number
  },
  
  // Timestamps
  lastUpdated: { type: Date, default: Date.now },
  date: { type: Date, default: Date.now },
});

// Indexes
PortfolioSchema.index({ walletAddress: 1, lastUpdated: -1 });
PortfolioSchema.index({ userId: 1 });

const PortfolioModel = mongoose.model("portfolio", PortfolioSchema);

export default PortfolioModel;

