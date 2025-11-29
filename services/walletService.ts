import WalletModel from "../model/WalletModel";
import PortfolioModel from "../model/PortfolioModel";
import TransactionModel from "../model/TransactionModel";
import { broadcastWalletUpdate } from "../socket/socketServer";

/**
 * Update wallet portfolio value
 */
export const updateWalletValue = async (
  address: string,
  valueData: {
    totalValue: number;
    totalValueChange24h?: number;
    totalValueChangePercent24h?: number;
  }
) => {
  try {
    const wallet = await WalletModel.findOneAndUpdate(
      { address },
      {
        ...valueData,
        lastActiveAt: new Date(),
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    // Broadcast update to subscribed clients
    broadcastWalletUpdate(address, {
      totalValue: valueData.totalValue,
      totalValueChange24h: valueData.totalValueChange24h || 0,
      totalValueChangePercent24h: valueData.totalValueChangePercent24h || 0
    });

    return wallet;
  } catch (error) {
    console.error("Error updating wallet value:", error);
    throw error;
  }
};

/**
 * Calculate wallet trading statistics
 */
export const calculateWalletStats = async (address: string) => {
  try {
    const transactions = await TransactionModel.find({ wallet: address });
    
    const buyTransactions = transactions.filter(t => t.type === 'buy');
    const sellTransactions = transactions.filter(t => t.type === 'sell');
    
    const totalTrades = transactions.length;
    const totalVolume = transactions.reduce((sum, t) => sum + (t.amountUSD || 0), 0);
    
    // Calculate win rate (simplified - can be enhanced)
    let wins = 0;
    let losses = 0;
    
    // Group by token and calculate P&L
    const tokenTrades = new Map<string, Array<{ type: string; price: number; amount: number }>>();
    
    transactions.forEach(t => {
      if (t.tokenMint && t.price && t.amount) {
        if (!tokenTrades.has(t.tokenMint)) {
          tokenTrades.set(t.tokenMint, []);
        }
        tokenTrades.get(t.tokenMint)!.push({
          type: t.type,
          price: t.price,
          amount: t.amount
        });
      }
    });
    
    // Simple win/loss calculation
    tokenTrades.forEach(trades => {
      const buys = trades.filter(t => t.type === 'buy');
      const sells = trades.filter(t => t.type === 'sell');
      
      if (buys.length > 0 && sells.length > 0) {
        const avgBuyPrice = buys.reduce((sum, t) => sum + t.price, 0) / buys.length;
        const avgSellPrice = sells.reduce((sum, t) => sum + t.price, 0) / sells.length;
        
        if (avgSellPrice > avgBuyPrice) {
          wins++;
        } else {
          losses++;
        }
      }
    });
    
    const winRate = totalTrades > 0 ? ((wins / (wins + losses)) * 100) || 0 : 0;
    
    // Calculate total profit
    const totalProfit = transactions.reduce((sum, t) => {
      if (t.type === 'sell' && t.amountUSD) {
        return sum + t.amountUSD;
      } else if (t.type === 'buy' && t.amountUSD) {
        return sum - t.amountUSD;
      }
      return sum;
    }, 0);
    
    // Update wallet with stats
    const wallet = await WalletModel.findOneAndUpdate(
      { address },
      {
        totalTrades,
        totalVolume,
        winRate,
        totalProfit,
        lastActiveAt: new Date(),
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    return wallet;
  } catch (error) {
    console.error("Error calculating wallet stats:", error);
    throw error;
  }
};

/**
 * Mark wallet as whale if value exceeds threshold
 */
export const checkAndMarkWhale = async (address: string, threshold: number = 1000000) => {
  try {
    const wallet = await WalletModel.findOne({ address });
    
    if (wallet && wallet.totalValue >= threshold) {
      wallet.isWhale = true;
      await wallet.save();
    }
    
    return wallet;
  } catch (error) {
    console.error("Error checking whale status:", error);
    throw error;
  }
};

/**
 * Update wallet portfolio
 */
export const updateWalletPortfolio = async (
  walletAddress: string,
  portfolioData: {
    holdings: Array<{
      mintAddress: string;
      symbol?: string;
      name?: string;
      balance: number;
      price?: number;
      value?: number;
      valueChange24h?: number;
      valueChangePercent24h?: number;
      percentage?: number;
      image?: string;
    }>;
    totalValue: number;
    totalValueChange24h?: number;
    totalValueChangePercent24h?: number;
  }
) => {
  try {
    // Calculate best and worst performers
    let bestPerformer = null;
    let worstPerformer = null;
    let maxProfit = -Infinity;
    let minProfit = Infinity;
    
    portfolioData.holdings.forEach(holding => {
      if (holding.valueChangePercent24h !== undefined) {
        if (holding.valueChangePercent24h > maxProfit) {
          maxProfit = holding.valueChangePercent24h;
          bestPerformer = {
            mintAddress: holding.mintAddress,
            profit: holding.valueChange24h || 0,
            profitPercent: holding.valueChangePercent24h
          };
        }
        if (holding.valueChangePercent24h < minProfit) {
          minProfit = holding.valueChangePercent24h;
          worstPerformer = {
            mintAddress: holding.mintAddress,
            profit: holding.valueChange24h || 0,
            profitPercent: holding.valueChangePercent24h
          };
        }
      }
    });
    
    const portfolio = await PortfolioModel.findOneAndUpdate(
      { walletAddress },
      {
        ...portfolioData,
        bestPerformer: bestPerformer || undefined,
        worstPerformer: worstPerformer || undefined,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    return portfolio;
  } catch (error) {
    console.error("Error updating wallet portfolio:", error);
    throw error;
  }
};

