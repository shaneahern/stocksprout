import type { Express } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { stockAPI } from "../stock-api";

export function registerPortfolioRoutes(app: Express) {
  // Investment routes
  app.get("/api/investments", async (req, res) => {
    try {
      const investments = await storage.getAllInvestments();
      res.json(investments);
    } catch (error) {
      console.error("Failed to fetch investments:", error);
      res.status(500).json({ error: "Failed to fetch investments" });
    }
  });

  app.get("/api/investments/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }

      // Use Finnhub to search for real stocks
      const searchResults = await stockAPI.searchSymbols(query);

      // Convert Finnhub results to Investment format with real-time prices
      const investments = await Promise.all(
        searchResults.map(async (result) => {
          // Check if we already have this investment in our database
          let investment = await storage.getInvestmentBySymbol(result.symbol);

          if (!investment) {
            // Get real-time quote for this symbol
            const quote = await stockAPI.getQuote(result.symbol);

            if (quote) {
              // Determine investment type (ETF, stock, etc.)
              let investmentType = 'stock';
              if (result.type.includes('ETF') || result.type.includes('Fund')) {
                investmentType = 'etf';
              } else if (result.symbol.match(/^(BTC|ETH|DOGE|SOL|ADA)/)) {
                investmentType = 'crypto';
              }

              // Create a temporary investment object (we'll save it when user selects it)
              investment = {
                id: `temp-${result.symbol}`,
                symbol: result.symbol,
                name: result.description,
                type: investmentType,
                currentPrice: quote.currentPrice.toFixed(2),
                ytdReturn: quote.changePercent.toFixed(2),
              };
            }
          } else {
            // Update price from real-time quote if available
            const quote = await stockAPI.getQuote(result.symbol);
            if (quote) {
              investment.currentPrice = quote.currentPrice.toFixed(2);
              investment.ytdReturn = quote.changePercent.toFixed(2);
            }
          }

          return investment;
        })
      );

      // Filter out any null results
      res.json(investments.filter(inv => inv !== null && inv !== undefined));
    } catch (error) {
      console.error("Investment search error:", error);
      res.status(500).json({ error: "Failed to search investments" });
    }
  });

  // Stock API routes (Finnhub integration)
  app.get("/api/stocks/quote/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const quote = await stockAPI.getQuote(symbol);

      if (!quote) {
        return res.status(404).json({ error: "Stock not found" });
      }

      res.json(quote);
    } catch (error) {
      console.error("Stock quote error:", error);
      res.status(500).json({ error: "Failed to fetch stock quote" });
    }
  });

  app.get("/api/stocks/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 1) {
        return res.status(400).json({ error: "Search query required" });
      }

      const results = await stockAPI.searchSymbols(query);
      res.json(results);
    } catch (error) {
      console.error("Stock search error:", error);
      res.status(500).json({ error: "Failed to search stocks" });
    }
  });

  app.get("/api/stocks/profile/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const profile = await stockAPI.getCompanyProfile(symbol);

      if (!profile) {
        return res.status(404).json({ error: "Company profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Company profile error:", error);
      res.status(500).json({ error: "Failed to fetch company profile" });
    }
  });

  // Portfolio routes
  app.get("/api/portfolio/:childId", async (req, res) => {
    try {
      // Fixed N+1 query: Use SQL join to get holdings with investment data in a single query
      const { portfolioHoldings, investments } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      const results = await db
        .select({
          // Holding fields
          id: portfolioHoldings.id,
          childId: portfolioHoldings.childId,
          investmentId: portfolioHoldings.investmentId,
          shares: portfolioHoldings.shares,
          averageCost: portfolioHoldings.averageCost,
          currentValue: portfolioHoldings.currentValue,
          // Investment fields
          investmentSymbol: investments.symbol,
          investmentName: investments.name,
          investmentType: investments.type,
          investmentCurrentPrice: investments.currentPrice,
          investmentYtdReturn: investments.ytdReturn,
        })
        .from(portfolioHoldings)
        .leftJoin(investments, eq(portfolioHoldings.investmentId, investments.id))
        .where(eq(portfolioHoldings.childId, req.params.childId));

      const enrichedHoldings = results.map(row => {
        if (!row.investmentSymbol) {
          console.error(`[Portfolio] ERROR: Holding ${row.id} references investmentId ${row.investmentId} but investment not found in database!`);
        }

        return {
          id: row.id,
          childId: row.childId,
          investmentId: row.investmentId,
          shares: row.shares,
          averageCost: row.averageCost,
          currentValue: row.currentValue,
          investment: row.investmentSymbol ? {
            id: row.investmentId,
            symbol: row.investmentSymbol,
            name: row.investmentName,
            type: row.investmentType,
            currentPrice: row.investmentCurrentPrice,
            ytdReturn: row.investmentYtdReturn,
          } : null,
        };
      });

      res.json(enrichedHoldings);
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  // Logo proxy endpoint to bypass ad blockers
  app.get("/api/logo/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const companyName = req.query.name as string | undefined;
      const ticker = symbol.toUpperCase();

      // Full ticker to domain mapping (matches client-side mapping)
      const domainMapping: Record<string, string> = {
        // Tech
        'AAPL': 'apple.com', 'GOOGL': 'abc.xyz', 'GOOG': 'abc.xyz',
        'MSFT': 'microsoft.com', 'AMZN': 'amazon.com', 'META': 'meta.com', 'FB': 'meta.com',
        'TSLA': 'tesla.com', 'NVDA': 'nvidia.com', 'NFLX': 'netflix.com',
        'ADBE': 'adobe.com', 'CRM': 'salesforce.com', 'ORCL': 'oracle.com',
        'INTC': 'intel.com', 'AMD': 'amd.com', 'UBER': 'uber.com', 'LYFT': 'lyft.com',
        'SNAP': 'snap.com', 'SPOT': 'spotify.com', 'SQ': 'squareup.com', 'PYPL': 'paypal.com',
        'SHOP': 'shopify.com', 'TWLO': 'twilio.com', 'ZM': 'zoom.us',
        'DOCU': 'docusign.com', 'SNOW': 'snowflake.com', 'CRWD': 'crowdstrike.com',
        'ABNB': 'airbnb.com', 'ROKU': 'roku.com', 'RBLX': 'roblox.com',
        'DASH': 'doordash.com', 'COIN': 'coinbase.com', 'PLTR': 'palantir.com',
        'IBM': 'ibm.com', 'CSCO': 'cisco.com', 'QCOM': 'qualcomm.com',
        'TXN': 'ti.com', 'NOW': 'servicenow.com', 'PANW': 'paloaltonetworks.com',
        'NET': 'cloudflare.com', 'DDOG': 'datadoghq.com', 'MDB': 'mongodb.com', 'ZS': 'zscaler.com',
        // Finance
        'JPM': 'jpmorganchase.com', 'BAC': 'bankofamerica.com', 'WFC': 'wellsfargo.com',
        'GS': 'goldmansachs.com', 'MS': 'morganstanley.com', 'C': 'citigroup.com',
        'V': 'visa.com', 'MA': 'mastercard.com', 'AXP': 'americanexpress.com', 'BLK': 'blackrock.com',
        // Consumer
        'WMT': 'walmart.com', 'HD': 'homedepot.com', 'NKE': 'nike.com',
        'MCD': 'mcdonalds.com', 'SBUX': 'starbucks.com', 'DIS': 'disney.com',
        'KO': 'coca-cola.com', 'PEP': 'pepsi.com', 'PG': 'pg.com',
        'COST': 'costco.com', 'TGT': 'target.com', 'LOW': 'lowes.com',
        'F': 'ford.com', 'GM': 'gm.com', 'CMG': 'chipotle.com',
        // Healthcare
        'JNJ': 'jnj.com', 'UNH': 'unitedhealthgroup.com', 'PFE': 'pfizer.com',
        'ABBV': 'abbvie.com', 'TMO': 'thermofisher.com', 'ABT': 'abbott.com',
        // ETFs
        'SPY': 'ssga.com', 'VOO': 'vanguard.com', 'VTI': 'vanguard.com', 'QQQ': 'invesco.com',
      };

      let domain = domainMapping[ticker];

      // If not in mapping, try to guess from company name
      if (!domain && companyName) {
        const guessed = companyName
          .replace(/\s+(Inc\.?|Corp\.?|Corporation|Company|Co\.?|Ltd\.?|Limited|Group|plc|LLC|LP)$/i, '')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');

        if (guessed.length >= 3 && guessed.length <= 30) {
          domain = `${guessed}.com`;
        }
      }

      if (!domain) {
        return res.status(404).json({ error: 'Logo not available' });
      }

      // Fetch logo from Clearbit and proxy it
      const logoUrl = `https://logo.clearbit.com/${domain}`;
      const logoResponse = await fetch(logoUrl);

      if (!logoResponse.ok) {
        return res.status(404).json({ error: 'Logo not found' });
      }

      // Set proper headers
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

      // Stream the logo image
      const buffer = await logoResponse.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error('Logo proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch logo' });
    }
  });
}
