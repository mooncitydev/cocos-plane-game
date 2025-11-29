import TokenModel from "../model/TokenModel";
import { broadcastTokenUpdate } from "../socket/socketServer";
import { getTokenImage } from "../utils";
import { PublicKey } from "@solana/web3.js";

/**
 * Update token price and market data
 */
export const updateTokenPrice = async (
  mintAddress: string,
  priceData: {
    price: number;
    priceChange24h?: number;
    priceChangePercent24h?: number;
    volume24h?: number;
    marketCap?: number;
    liquidity?: number;
  }
) => {
  try {
    const token = await TokenModel.findOneAndUpdate(
      { mintAddress },
      {
        ...priceData,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    // Broadcast update to subscribed clients
    broadcastTokenUpdate(mintAddress, {
      price: priceData.price,
      priceChange24h: priceData.priceChange24h || 0,
      priceChangePercent24h: priceData.priceChangePercent24h || 0,
      volume24h: priceData.volume24h || 0,
      marketCap: priceData.marketCap || 0,
      liquidity: priceData.liquidity || 0
    });

    return token;
  } catch (error) {
    console.error("Error updating token price:", error);
    throw error;
  }
};

/**
 * Update token holder information
 */
export const updateTokenHolders = async (
  mintAddress: string,
  holderData: {
    holderCount: number;
    topHolders: Array<{
      address: string;
      balance: number;
      percentage: number;
    }>;
  }
) => {
  try {
    const token = await TokenModel.findOneAndUpdate(
      { mintAddress },
      {
        holderCount: holderData.holderCount,
        topHolders: holderData.topHolders,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    return token;
  } catch (error) {
    console.error("Error updating token holders:", error);
    throw error;
  }
};

/**
 * Create or update token with metadata
 */
export const upsertToken = async (tokenData: {
  mintAddress: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  image?: string;
  description?: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  liquidity?: number;
  holderCount?: number;
  creator?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  telegramUrl?: string;
  isVerified?: boolean;
  tags?: string[];
}) => {
  try {
    // Try to fetch image if not provided
    if (!tokenData.image) {
      try {
        const image = await getTokenImage(new PublicKey(tokenData.mintAddress));
        if (image) {
          tokenData.image = image;
        }
      } catch (error) {
        console.log("Error fetching token image:", error);
      }
    }

    const token = await TokenModel.findOneAndUpdate(
      { mintAddress: tokenData.mintAddress },
      {
        ...tokenData,
        lastUpdated: new Date(),
        firstSeenAt: tokenData.mintAddress ? undefined : new Date()
      },
      { upsert: true, new: true }
    );

    return token;
  } catch (error) {
    console.error("Error upserting token:", error);
    throw error;
  }
};

/**
 * Get token with enriched data
 */
export const getTokenWithAnalytics = async (mintAddress: string) => {
  try {
    const token = await TokenModel.findOne({ mintAddress });
    
    if (!token) {
      return null;
    }

    // Calculate risk score based on various factors
    let riskScore = 0;
    
    if (token.liquidity && token.liquidity < 10000) riskScore += 30;
    if (token.holderCount && token.holderCount < 100) riskScore += 20;
    if (!token.isVerified) riskScore += 25;
    if (token.priceChangePercent24h && Math.abs(token.priceChangePercent24h) > 50) riskScore += 15;
    if (!token.creator) riskScore += 10;

    token.riskScore = Math.min(riskScore, 100);

    return token;
  } catch (error) {
    console.error("Error getting token with analytics:", error);
    throw error;
  }
};

