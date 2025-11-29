import { Router } from "express";
import TokenModel from "../../model/TokenModel";
import WalletModel from "../../model/WalletModel";
import TransactionModel from "../../model/TransactionModel";

const AnalyticsRouter = Router();

// Get token analytics
AnalyticsRouter.get("/token/:mintAddress", async (req, res) => {
  try {
    const { mintAddress } = req.params;
    
    const token = await TokenModel.findOne({ mintAddress });
    
    if (!token) {
      return res.status(404).json({
        status: false,
        msg: "Token not found"
      });
    }
    
    // Get recent transactions
    const recentTransactions = await TransactionModel
      .find({ tokenMint: mintAddress })
      .sort({ blockTime: -1 })
      .limit(50)
      .select('signature wallet type amount amountUSD price blockTime');
    
    // Get top holders
    const topHolders = token.topHolders || [];
    
    return res.json({
      status: true,
      data: {
        token,
        recentTransactions,
        topHolders
      }
    });
  } catch (error: any) {
    console.log("Get token analytics error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error fetching token analytics"
    });
  }
});

// Get trending tokens
AnalyticsRouter.get("/trending", async (req, res) => {
  try {
    const { limit = 50, sortBy = 'volume24h' } = req.query;
    
    const sortOptions: any = {};
    sortOptions[sortBy as string] = -1;
    
    const tokens = await TokenModel
      .find({ volume24h: { $gt: 0 } })
      .sort(sortOptions)
      .limit(Number(limit))
      .select('mintAddress symbol name image price priceChangePercent24h volume24h marketCap liquidity holderCount');
    
    return res.json({
      status: true,
      data: tokens
    });
  } catch (error: any) {
    console.log("Get trending tokens error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error fetching trending tokens"
    });
  }
});

// Get wallet analytics
AnalyticsRouter.get("/wallet/:address", async (req, res) => {
  try {
    const { address } = req.params;
    
    const wallet = await WalletModel.findOne({ address });
    
    if (!wallet) {
      return res.status(404).json({
        status: false,
        msg: "Wallet not found"
      });
    }
    
    // Get recent transactions
    const recentTransactions = await TransactionModel
      .find({ wallet: address })
      .sort({ blockTime: -1 })
      .limit(100)
      .select('signature tokenMint type amount amountUSD price blockTime platform');
    
    // Get trading stats
    const buyCount = await TransactionModel.countDocuments({ 
      wallet: address, 
      type: 'buy' 
    });
    const sellCount = await TransactionModel.countDocuments({ 
      wallet: address, 
      type: 'sell' 
    });
    
    return res.json({
      status: true,
      data: {
        wallet,
        recentTransactions,
        tradingStats: {
          buyCount,
          sellCount,
          totalTrades: wallet.totalTrades,
          winRate: wallet.winRate,
          totalProfit: wallet.totalProfit
        }
      }
    });
  } catch (error: any) {
    console.log("Get wallet analytics error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error fetching wallet analytics"
    });
  }
});

// Get market overview
AnalyticsRouter.get("/market/overview", async (req, res) => {
  try {
    const totalTokens = await TokenModel.countDocuments();
    const totalVolume24h = await TokenModel.aggregate([
      { $group: { _id: null, total: { $sum: "$volume24h" } } }
    ]);
    const totalMarketCap = await TokenModel.aggregate([
      { $group: { _id: null, total: { $sum: "$marketCap" } } }
    ]);
    
    const topGainers = await TokenModel
      .find({ priceChangePercent24h: { $gt: 0 } })
      .sort({ priceChangePercent24h: -1 })
      .limit(10)
      .select('mintAddress symbol name image price priceChangePercent24h volume24h');
    
    const topLosers = await TokenModel
      .find({ priceChangePercent24h: { $lt: 0 } })
      .sort({ priceChangePercent24h: 1 })
      .limit(10)
      .select('mintAddress symbol name image price priceChangePercent24h volume24h');
    
    return res.json({
      status: true,
      data: {
        totalTokens,
        totalVolume24h: totalVolume24h[0]?.total || 0,
        totalMarketCap: totalMarketCap[0]?.total || 0,
        topGainers,
        topLosers
      }
    });
  } catch (error: any) {
    console.log("Get market overview error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error fetching market overview"
    });
  }
});

// Search tokens
AnalyticsRouter.get("/search", async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        status: false,
        msg: "Search query is required"
      });
    }
    
    const tokens = await TokenModel.find({
      $or: [
        { symbol: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { mintAddress: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(Number(limit))
    .select('mintAddress symbol name image price marketCap volume24h');
    
    return res.json({
      status: true,
      data: tokens
    });
  } catch (error: any) {
    console.log("Search tokens error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error searching tokens"
    });
  }
});

export default AnalyticsRouter;

