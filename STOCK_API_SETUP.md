# Stock API Integration Guide

StockSprout integrates with external APIs to provide real-time stock data and logos.

## 📊 Stock Prices - Finnhub API

### Overview
We use [Finnhub](https://finnhub.io) for real-time stock quotes, company information, and stock search.

### Features
- Real-time stock prices
- Company profiles
- Stock symbol search
- Historical data (future enhancement)

### Setup

1. **Sign up for a free account** at [https://finnhub.io/register](https://finnhub.io/register)

2. **Get your API key** from the dashboard

3. **Add to environment variables**:
   ```bash
   # In your .env file
   FINNHUB_API_KEY=your_api_key_here
   ```

### Free Tier Limits
- **60 API calls per minute**
- **Unlimited requests per month**
- Real-time US stock data
- Perfect for small to medium applications

### Fallback Behavior
If no API key is set, the app will automatically use **mock data** with popular stocks (AAPL, GOOGL, TSLA, etc.). This is useful for:
- Local development
- Testing
- Demo purposes

## 🎨 Stock Logos - Clearbit Logo API

### Overview
We use [Clearbit Logo API](https://clearbit.com/logo) for company logos.

### Features
- Free and unlimited
- **No authentication required**
- **CORS enabled** (works in browser)
- High-quality company logos
- Direct image URLs
- 30-day CDN caching

### Setup
**No setup required!** The logo API works out of the box with no API key needed.

### How It Works
We maintain a mapping of stock tickers to company domains, then use Clearbit to fetch the logo:

```typescript
// Example: AAPL -> apple.com
const logoUrl = `https://logo.clearbit.com/apple.com`;
```

### Supported Stocks
We have pre-mapped 100+ popular stocks including:
- **Tech**: AAPL, GOOGL, MSFT, AMZN, TSLA, NVDA, NFLX, META
- **Finance**: JPM, BAC, V, MA, GS, MS
- **Consumer**: WMT, NKE, DIS, SBUX, MCD
- **Healthcare**: JNJ, UNH, PFE, ABBV
- **ETFs**: SPY, VOO, VTI, QQQ, and all major sector ETFs

### Fallback
For stocks not in our mapping, or if a logo fails to load, the app automatically shows a beautiful colored tile with the stock's first letter.

## 🔧 API Endpoints

### Stock Quotes
```
GET /api/stocks/quote/:symbol
```
Returns real-time quote data for a stock symbol.

**Example Response:**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc",
  "currentPrice": 189.95,
  "change": 2.15,
  "changePercent": 1.14,
  "high": 191.20,
  "low": 188.50,
  "open": 189.00,
  "previousClose": 187.80
}
```

### Stock Search
```
GET /api/stocks/search?q=apple
```
Search for stocks by symbol or company name.

**Example Response:**
```json
[
  {
    "description": "Apple Inc",
    "displaySymbol": "AAPL",
    "symbol": "AAPL",
    "type": "Common Stock"
  }
]
```

### Company Profile
```
GET /api/stocks/profile/:symbol
```
Get company information.

**Example Response:**
```json
{
  "name": "Apple Inc",
  "ticker": "AAPL"
}
```

## 💡 Usage in Components

### Getting Stock Logos
```tsx
import { getStockLogoUrl, getFallbackLogoUrl } from "@/lib/stock-logo";

function StockCard({ symbol }) {
  const handleImageError = (e) => {
    e.currentTarget.src = getFallbackLogoUrl(symbol);
  };

  return (
    <img 
      src={getStockLogoUrl(symbol)}
      alt={`${symbol} logo`}
      onError={handleImageError}
    />
  );
}
```

### Fetching Stock Quotes
```tsx
import { useQuery } from "@tanstack/react-query";

function StockPrice({ symbol }) {
  const { data: quote } = useQuery({
    queryKey: [`/api/stocks/quote/${symbol}`],
  });

  return (
    <div>
      <p>Price: ${quote?.currentPrice}</p>
      <p>Change: {quote?.changePercent}%</p>
    </div>
  );
}
```

## 🚀 Deployment Notes

### Production Checklist
- [ ] Add `FINNHUB_API_KEY` to production environment variables
- [ ] Ensure `.env` is in `.gitignore` (never commit API keys!)
- [ ] Monitor API usage in Finnhub dashboard
- [ ] Add Elbstream attribution link in footer

### Rate Limiting
Finnhub's free tier provides 60 calls/minute, which is sufficient for most use cases. To optimize:

1. **Cache responses** - React Query automatically caches API responses
2. **Batch requests** - Fetch data for multiple stocks in a single component
3. **Use mock data** in development to preserve API quota

### Cost-Free Operation
With the current setup, you can run StockSprout **completely free**:
- ✅ Finnhub free tier: $0/month
- ✅ Elbstream logos: $0/month (with attribution)
- ✅ Neon PostgreSQL free tier: $0/month
- ✅ Replit deployment: $0/month (for personal projects)

## 🔒 Security

### API Key Safety
- **Never** commit API keys to Git
- **Always** use environment variables
- **Regenerate** keys if accidentally exposed
- **Use** server-side proxy (we handle this automatically)

The stock API service runs on the **server side**, so your Finnhub API key is never exposed to the client.

## 📚 Additional Resources

- [Finnhub API Documentation](https://finnhub.io/docs/api)
- [Finnhub Dashboard](https://finnhub.io/dashboard)
- [Elbstream Logo API](https://elbstream.com/logos)
- [React Query Documentation](https://tanstack.com/query/latest)
