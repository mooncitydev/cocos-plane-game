import { Router } from "express";
import TokenModel from "../../model/TokenModel";
import TransactionModel from "../../model/TransactionModel";
import { getTokenImage } from "../../utils";
import { PublicKey } from "@solana/web3.js";

const TokenRouter = Router();

// Get token details
TokenRouter.get("/:mintAddress", async (req, res) => {
  try {
    const { mintAddress } = req.params;
    
    let token = await TokenModel.findOne({ mintAddress });
    
    if (!token) {
      return res.status(404).json({
        status: false,
        msg: "Token not found"
      });
    }
    
    // Ensure image is fetched if missing
    if (!token.image) {
      try {
        const image = await getTokenImage(new PublicKey(mintAddress));
        if (image) {
          token.image = image;
          await token.save();
        }
      } catch (error) {
        console.log("Error fetching token image:", error);
      }
    }
    
    return res.json({
      status: true,
      data: token
    });
  } catch (error: any) {
    console.log("Get token error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error fetching token"
    });
  }
});

// Create or update token
TokenRouter.post("/", async (req, res) => {
  try {
    const tokenData = req.body;
    
    if (!tokenData.mintAddress) {
      return res.status(400).json({
        status: false,
        msg: "Mint address is required"
      });
    }
    
    // Try to get token image if not provided
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
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    
    return res.json({
      status: true,
      data: token
    });
  } catch (error: any) {
    console.log("Create/update token error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error creating/updating token"
    });
  }
});

// Get token price history (from transactions)
TokenRouter.get("/:mintAddress/price-history", async (req, res) => {
  try {
    const { mintAddress } = req.params;
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    
    const transactions = await TransactionModel
      .find({
        tokenMint: mintAddress,
        type: { $in: ['buy', 'sell'] },
        blockTime: { $gte: startDate },
        price: { $exists: true, $ne: null }
      })
      .sort({ blockTime: 1 })
      .select('blockTime price amount amountUSD')
      .limit(1000);
    
    return res.json({
      status: true,
      data: transactions
    });
  } catch (error: any) {
    console.log("Get token price history error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error fetching price history"
    });
  }
});

// Get token holders
TokenRouter.get("/:mintAddress/holders", async (req, res) => {
  try {
    const { mintAddress } = req.params;
    const { limit = 100 } = req.query;
    
    const token = await TokenModel.findOne({ mintAddress });
    
    if (!token) {
      return res.status(404).json({
        status: false,
        msg: "Token not found"
      });
    }
    
    const topHolders = token.topHolders || [];
    
    return res.json({
      status: true,
      data: {
        totalHolders: token.holderCount || 0,
        topHolders: topHolders.slice(0, Number(limit))
      }
    });
  } catch (error: any) {
    console.log("Get token holders error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error fetching token holders"
    });
  }
});

// Get token transactions
TokenRouter.get("/:mintAddress/transactions", async (req, res) => {
  try {
    const { mintAddress } = req.params;
    const { limit = 100, offset = 0, type } = req.query;
    
    const query: any = { tokenMint: mintAddress };
    if (type) query.type = type;
    
    const transactions = await TransactionModel
      .find(query)
      .sort({ blockTime: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .select('signature wallet type amount amountUSD price blockTime platform');
    
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
    console.log("Get token transactions error ==>", error);
    res.status(400).json({
      status: false,
      msg: "Error fetching token transactions"
    });
  }
});

export default TokenRouter;

