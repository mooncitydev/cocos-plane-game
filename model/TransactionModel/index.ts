import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  signature: { type: String, required: true, unique: true, index: true },
  blockTime: { type: Date, required: true, index: true },
  slot: { type: Number, index: true },
  
  // Participants
  wallet: { type: String, required: true, index: true },
  tokenMint: { type: String, index: true },
  
  // Transaction details
  type: { 
    type: String, 
    enum: ['buy', 'sell', 'transfer', 'swap', 'other'],
    required: true 
  },
  amount: { type: Number, required: true },
  amountUSD: { type: Number },
  price: { type: Number },
  
  // Platform
  platform: { type: String }, // e.g., 'raydium', 'jupiter', 'pump.fun'
  dex: { type: String },
  
  // Status
  status: { 
    type: String, 
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  
  // Fees
  fee: { type: Number, default: 0 },
  feeUSD: { type: Number, default: 0 },
  
  // Metadata
  metadata: { type: mongoose.Schema.Types.Mixed },
  
  // Timestamps
  date: { type: Date, default: Date.now },
});

// Indexes for analytics queries
TransactionSchema.index({ wallet: 1, blockTime: -1 });
TransactionSchema.index({ tokenMint: 1, blockTime: -1 });
TransactionSchema.index({ type: 1, blockTime: -1 });

const TransactionModel = mongoose.model("transaction", TransactionSchema);

export default TransactionModel;

