/**
 * Stock Market API Service
 * Integrates with Finnhub for real-time stock prices and company data
 */

interface FinnhubQuoteResponse {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

interface FinnhubSymbolSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

interface FinnhubSearchResponse {
  count: number;
  result: FinnhubSymbolSearchResult[];
}

interface StockQuote {
  symbol: string;
  name?: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class StockAPIService {
  private apiKey: string;
  private baseUrl = 'https://finnhub.io/api/v1';
  private quoteCache: Map<string, CacheEntry<StockQuote>> = new Map();
  private profileCache: Map<string, CacheEntry<{ name: string; ticker: string }>> = new Map();
  private searchCache: Map<string, CacheEntry<FinnhubSymbolSearchResult[]>> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FINNHUB_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️  FINNHUB_API_KEY not set. Stock data will be mocked.');
    }
  }

  /**
   * Check if a cache entry is still valid
   */
  private isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
    if (!entry) return false;
    return Date.now() - entry.timestamp < this.CACHE_TTL;
  }

  /**
   * Get real-time stock quote (with 5-minute cache)
   */
  async getQuote(symbol: string): Promise<StockQuote | null> {
    const normalizedSymbol = symbol.toUpperCase();

    // Check cache first
    const cached = this.quoteCache.get(normalizedSymbol);
    if (this.isCacheValid(cached)) {
      console.log(`[Stock API] Cache hit for ${normalizedSymbol}`);
      return cached.data;
    }

    if (!this.apiKey) {
      return this.getMockQuote(symbol);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/quote?symbol=${normalizedSymbol}&token=${this.apiKey}`
      );

      if (!response.ok) {
        console.error(`Finnhub API error: ${response.status}`);
        return this.getMockQuote(symbol);
      }

      const data: FinnhubQuoteResponse = await response.json();

      // If current price is 0, the symbol might be invalid
      if (data.c === 0) {
        console.warn(`No data found for symbol: ${symbol}`);
        return null;
      }

      const quote: StockQuote = {
        symbol: normalizedSymbol,
        currentPrice: data.c,
        change: data.d,
        changePercent: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
      };

      // Cache the result
      this.quoteCache.set(normalizedSymbol, {
        data: quote,
        timestamp: Date.now(),
      });

      console.log(`[Stock API] Fetched and cached ${normalizedSymbol}`);
      return quote;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return this.getMockQuote(symbol);
    }
  }

  /**
   * Search for stocks by query (with 5-minute cache)
   */
  async searchSymbols(query: string): Promise<FinnhubSymbolSearchResult[]> {
    const normalizedQuery = query.toLowerCase().trim();

    // Check cache first
    const cached = this.searchCache.get(normalizedQuery);
    if (this.isCacheValid(cached)) {
      console.log(`[Stock API] Search cache hit for "${normalizedQuery}"`);
      return cached.data;
    }

    if (!this.apiKey) {
      return this.getMockSearchResults(query);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}&token=${this.apiKey}`
      );

      if (!response.ok) {
        console.error(`Finnhub search API error: ${response.status}`);
        return this.getMockSearchResults(query);
      }

      const data: FinnhubSearchResponse = await response.json();

      // Filter to only US stocks and limit results
      const results = data.result
        .filter(result =>
          !result.symbol.includes('.') && // Filter out non-US stocks
          result.type === 'Common Stock'
        )
        .slice(0, 10);

      // Cache the results
      this.searchCache.set(normalizedQuery, {
        data: results,
        timestamp: Date.now(),
      });

      console.log(`[Stock API] Searched and cached "${normalizedQuery}"`);
      return results;
    } catch (error) {
      console.error(`Error searching symbols:`, error);
      return this.getMockSearchResults(query);
    }
  }

  /**
   * Get company profile (includes company name) - with 5-minute cache
   */
  async getCompanyProfile(symbol: string): Promise<{ name: string; ticker: string } | null> {
    const normalizedSymbol = symbol.toUpperCase();

    // Check cache first
    const cached = this.profileCache.get(normalizedSymbol);
    if (this.isCacheValid(cached)) {
      console.log(`[Stock API] Profile cache hit for ${normalizedSymbol}`);
      return cached.data;
    }

    if (!this.apiKey) {
      return this.getMockCompanyProfile(symbol);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/stock/profile2?symbol=${normalizedSymbol}&token=${this.apiKey}`
      );

      if (!response.ok) {
        console.error(`Finnhub profile API error: ${response.status}`);
        return this.getMockCompanyProfile(symbol);
      }

      const data = await response.json();

      if (!data.name) {
        return null;
      }

      const profile = {
        name: data.name,
        ticker: data.ticker || normalizedSymbol,
      };

      // Cache the result
      this.profileCache.set(normalizedSymbol, {
        data: profile,
        timestamp: Date.now(),
      });

      console.log(`[Stock API] Fetched and cached profile for ${normalizedSymbol}`);
      return profile;
    } catch (error) {
      console.error(`Error fetching company profile for ${symbol}:`, error);
      return this.getMockCompanyProfile(symbol);
    }
  }

  /**
   * Mock data for when API key is not available
   */
  private getMockQuote(symbol: string): StockQuote {
    const mockData: Record<string, StockQuote> = {
      AAPL: {
        symbol: 'AAPL',
        name: 'Apple Inc',
        currentPrice: 189.95,
        change: 2.15,
        changePercent: 1.14,
        high: 191.20,
        low: 188.50,
        open: 189.00,
        previousClose: 187.80,
      },
      GOOGL: {
        symbol: 'GOOGL',
        name: 'Alphabet Inc',
        currentPrice: 142.65,
        change: -0.85,
        changePercent: -0.59,
        high: 144.20,
        low: 142.00,
        open: 143.50,
        previousClose: 143.50,
      },
      TSLA: {
        symbol: 'TSLA',
        name: 'Tesla Inc',
        currentPrice: 241.50,
        change: 5.25,
        changePercent: 2.22,
        high: 244.00,
        low: 238.50,
        open: 239.00,
        previousClose: 236.25,
      },
      SPY: {
        symbol: 'SPY',
        name: 'S&P 500 ETF',
        currentPrice: 445.20,
        change: 1.80,
        changePercent: 0.41,
        high: 446.50,
        low: 443.20,
        open: 444.00,
        previousClose: 443.40,
      },
      MSFT: {
        symbol: 'MSFT',
        name: 'Microsoft Corp',
        currentPrice: 378.50,
        change: 3.20,
        changePercent: 0.85,
        high: 380.00,
        low: 376.50,
        open: 377.00,
        previousClose: 375.30,
      },
    };

    return mockData[symbol.toUpperCase()] || {
      symbol: symbol.toUpperCase(),
      currentPrice: 100.00,
      change: 0,
      changePercent: 0,
      high: 100.00,
      low: 100.00,
      open: 100.00,
      previousClose: 100.00,
    };
  }

  private getMockSearchResults(query: string): FinnhubSymbolSearchResult[] {
    const mockResults: FinnhubSymbolSearchResult[] = [
      { description: 'Apple Inc', displaySymbol: 'AAPL', symbol: 'AAPL', type: 'Common Stock' },
      { description: 'Microsoft Corp', displaySymbol: 'MSFT', symbol: 'MSFT', type: 'Common Stock' },
      { description: 'Alphabet Inc', displaySymbol: 'GOOGL', symbol: 'GOOGL', type: 'Common Stock' },
      { description: 'Tesla Inc', displaySymbol: 'TSLA', symbol: 'TSLA', type: 'Common Stock' },
      { description: 'Amazon.com Inc', displaySymbol: 'AMZN', symbol: 'AMZN', type: 'Common Stock' },
    ];

    const q = query.toLowerCase();
    return mockResults.filter(r => 
      r.symbol.toLowerCase().includes(q) || 
      r.description.toLowerCase().includes(q)
    );
  }

  private getMockCompanyProfile(symbol: string): { name: string; ticker: string } | null {
    const mockProfiles: Record<string, { name: string; ticker: string }> = {
      AAPL: { name: 'Apple Inc', ticker: 'AAPL' },
      GOOGL: { name: 'Alphabet Inc', ticker: 'GOOGL' },
      TSLA: { name: 'Tesla Inc', ticker: 'TSLA' },
      SPY: { name: 'S&P 500 ETF Trust', ticker: 'SPY' },
      MSFT: { name: 'Microsoft Corporation', ticker: 'MSFT' },
      VTI: { name: 'Vanguard Total Stock Market ETF', ticker: 'VTI' },
      QQQ: { name: 'Invesco QQQ Trust', ticker: 'QQQ' },
    };

    return mockProfiles[symbol.toUpperCase()] || null;
  }
}

// Export singleton instance
export const stockAPI = new StockAPIService();
