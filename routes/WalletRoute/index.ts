import { Router } from "express";
import WalletModel from "../../model/WalletModel";
import PortfolioModel from "../../model/PortfolioModel";
import TransactionModel from "../../model/TransactionModel";
import TokenModel from "../../model/TokenModel";

const WalletRouter = Router();

// Get wallet portfolio
WalletRouter.get("/portfolio/:address", async (req, res) => {
  try {
    const { address } = req.params;
    
    let portfolio = await PortfolioModel.findOne({ walletAddress: address });
    
    if (!portfolio) {
      // Create new portfolio if doesn't exist
      portfolio = await PortfolioModel.create({
        walletAddress: address,
        holdings: [],
        totalValue: 0
      });
    }
    
    return res.json({
      status: true,
      data: portfolio
    });
  } catch (error: any) {
    console.log("Get wallet portfolio error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error fetching wallet portfolio"
    });
  }
});

// Update wallet portfolio
WalletRouter.post("/portfolio/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const { holdings, totalValue } = req.body;
    
    const portfolio = await PortfolioModel.findOneAndUpdate(
      { walletAddress: address },
      {
        holdings,
        totalValue,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    return res.json({
      status: true,
      data: portfolio
    });
  } catch (error: any) {
    console.log("Update wallet portfolio error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error updating wallet portfolio"
    });
  }
});

// Get wallet transactions
WalletRouter.get("/transactions/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 100, offset = 0, type, tokenMint } = req.query;
    
    const query: any = { wallet: address };
    if (type) query.type = type;
    if (tokenMint) query.tokenMint = tokenMint;
    
    const transactions = await TransactionModel
      .find(query)
      .sort({ blockTime: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .select('signature tokenMint type amount amountUSD price blockTime platform status');
    
    const total = await TransactionModel.countDocuments(query);
    
    return res.json({
      status: true,
      data: {
        transactions,
        total,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error: any) {
    console.log("Get wallet transactions error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error fetching wallet transactions"
    });
  }
});

// Track new wallet
WalletRouter.post("/track", async (req, res) => {
  try {
    const { address, labels, notes } = req.body;
    
    if (!address) {
      return res.status(400).json({
        status: false,
        msg: "Wallet address is required"
      });
    }
    
    const wallet = await WalletModel.findOneAndUpdate(
      { address },
      {
        address,
        labels: labels || [],
        notes: notes || '',
        lastActiveAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    return res.json({
      status: true,
      data: wallet
    });
  } catch (error: any) {
    console.log("Track wallet error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error tracking wallet"
    });
  }
});

// Get tracked wallets
WalletRouter.get("/tracked", async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const wallets = await WalletModel
      .find({})
      .sort({ lastActiveAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .select('address totalValue totalValueChangePercent24h totalTrades totalVolume isWhale labels lastActiveAt');
    
    const total = await WalletModel.countDocuments();
    
    return res.json({
      status: true,
      data: {
        wallets,
        total,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error: any) {
    console.log("Get tracked wallets error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error fetching tracked wallets"
    });
  }
});

export default WalletRouter;

