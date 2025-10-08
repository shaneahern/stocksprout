/**
 * Stock Logo Utility
 * Uses Clearbit Logo API (free, no auth) with fallback to generated logos
 */

// Map of common stock tickers to their company domains
const TICKER_TO_DOMAIN: Record<string, string> = {
  // Tech
  'AAPL': 'apple.com',
  'GOOGL': 'abc.xyz',  // Alphabet/Google parent company
  'GOOG': 'abc.xyz',
  'MSFT': 'microsoft.com',
  'AMZN': 'amazon.com',
  'META': 'meta.com',
  'FB': 'meta.com',
  'TSLA': 'tesla.com',
  'NVDA': 'nvidia.com',
  'NFLX': 'netflix.com',
  'ADBE': 'adobe.com',
  'CRM': 'salesforce.com',
  'ORCL': 'oracle.com',
  'INTC': 'intel.com',
  'AMD': 'amd.com',
  'UBER': 'uber.com',
  'LYFT': 'lyft.com',
  'SNAP': 'snap.com',
  'SPOT': 'spotify.com',
  'SQ': 'squareup.com',
  'PYPL': 'paypal.com',
  'SHOP': 'shopify.com',
  'TWLO': 'twilio.com',
  'ZM': 'zoom.us',
  'DOCU': 'docusign.com',
  'SNOW': 'snowflake.com',
  'CRWD': 'crowdstrike.com',
  'ABNB': 'airbnb.com',
  'ROKU': 'roku.com',
  'RBLX': 'roblox.com',
  'DASH': 'doordash.com',
  'COIN': 'coinbase.com',
  'PLTR': 'palantir.com',
  'IBM': 'ibm.com',
  'CSCO': 'cisco.com',
  'QCOM': 'qualcomm.com',
  'TXN': 'ti.com',
  'NOW': 'servicenow.com',
  'PANW': 'paloaltonetworks.com',
  'NET': 'cloudflare.com',
  'DDOG': 'datadoghq.com',
  'MDB': 'mongodb.com',
  'ZS': 'zscaler.com',
  
  // Finance
  'JPM': 'jpmorganchase.com',
  'BAC': 'bankofamerica.com',
  'WFC': 'wellsfargo.com',
  'GS': 'goldmansachs.com',
  'MS': 'morganstanley.com',
  'C': 'citigroup.com',
  'V': 'visa.com',
  'MA': 'mastercard.com',
  'AXP': 'americanexpress.com',
  'BLK': 'blackrock.com',
  
  // Consumer
  'WMT': 'walmart.com',
  'HD': 'homedepot.com',
  'NKE': 'nike.com',
  'MCD': 'mcdonalds.com',
  'SBUX': 'starbucks.com',
  'DIS': 'disney.com',
  'KO': 'coca-cola.com',
  'PEP': 'pepsi.com',
  'PG': 'pg.com',
  'COST': 'costco.com',
  'TGT': 'target.com',
  'LOW': 'lowes.com',
  'F': 'ford.com',
  'GM': 'gm.com',
  'CMG': 'chipotle.com',
  'YUM': 'yum.com',
  'QSR': 'rbi.com',
  'LULU': 'lululemon.com',
  'ROST': 'rossstores.com',
  'TJX': 'tjx.com',
  'DG': 'dollargeneral.com',
  'DLTR': 'dollartree.com',
  
  // Healthcare
  'JNJ': 'jnj.com',
  'UNH': 'unitedhealthgroup.com',
  'PFE': 'pfizer.com',
  'ABBV': 'abbvie.com',
  'TMO': 'thermofisher.com',
  'ABT': 'abbott.com',
  'MRK': 'merck.com',
  'LLY': 'lilly.com',
  
  // Energy & Industrial
  'XOM': 'exxonmobil.com',
  'CVX': 'chevron.com',
  'BA': 'boeing.com',
  'CAT': 'caterpillar.com',
  'GE': 'ge.com',
  'MMM': '3m.com',
  'HON': 'honeywell.com',
  'COP': 'conocophillips.com',
  'SLB': 'slb.com',
  'EOG': 'eogresources.com',
  'PSX': 'phillips66.com',
  'VLO': 'valero.com',
  'MPC': 'marathonpetroleum.com',
  
  // Communication & Media
  'T': 'att.com',
  'VZ': 'verizon.com',
  'TMUS': 't-mobile.com',
  'CMCSA': 'comcast.com',
  'CHTR': 'charter.com',
  'NWSA': 'newscorp.com',
  'PARA': 'paramount.com',
  'WBD': 'wbd.com',
  
  // ETFs (using the fund provider's domain)
  'SPY': 'ssga.com',
  'VOO': 'vanguard.com',
  'VTI': 'vanguard.com',
  'QQQ': 'invesco.com',
  'IWM': 'ishares.com',
  'EEM': 'ishares.com',
  'VIG': 'vanguard.com',
  'VEA': 'vanguard.com',
  'VWO': 'vanguard.com',
  'AGG': 'ishares.com',
  'BND': 'vanguard.com',
  'LQD': 'ishares.com',
  'HYG': 'ishares.com',
  'GLD': 'ssga.com',
  'SLV': 'ishares.com',
  'USO': 'uso.com',
  'VNQ': 'vanguard.com',
  'XLE': 'ssga.com',
  'XLF': 'ssga.com',
  'XLK': 'ssga.com',
  'XLV': 'ssga.com',
  'XLI': 'ssga.com',
  'XLP': 'ssga.com',
  'XLY': 'ssga.com',
  'XLU': 'ssga.com',
  'XLB': 'ssga.com',
  'XLRE': 'ssga.com',
  'XLC': 'ssga.com',
};

/**
 * Get stock logo URL using multiple fallback strategies
 * @param symbol - Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
 * @param companyName - Optional company name to help find logo
 * @param size - Logo size in pixels (default: 64)
 * @returns URL to the stock logo
 */
export function getStockLogoUrl(symbol: string, companyName?: string, size: number = 64): string {
  const ticker = symbol.toUpperCase();
  
  // Strategy 1: Use server-side proxy for curated stocks (bypasses ad blockers)
  const domain = TICKER_TO_DOMAIN[ticker];
  if (domain) {
    // Use our logo proxy endpoint to bypass ad blockers
    return `/api/logo/${ticker}`;
  }
  
  // Strategy 2: If we have a company name, try to construct a domain and proxy it
  if (companyName) {
    const guessedDomain = guessCompanyDomain(companyName);
    // For guessed domains, go straight to fallback to avoid extra API calls
    if (guessedDomain) {
      // Could add to proxy, but for now use fallback
      return getFallbackLogoUrl(ticker);
    }
  }
  
  // Strategy 3: Use fallback logo directly
  // For unmapped stocks, use our generated SVG logo
  return getFallbackLogoUrl(ticker);
}

/**
 * Attempt to guess a company's domain from its name
 * This is a best-effort approach for common patterns
 */
function guessCompanyDomain(companyName: string): string | null {
  // Remove common suffixes
  let name = companyName
    .replace(/\s+(Inc\.?|Corp\.?|Corporation|Company|Co\.?|Ltd\.?|Limited|Group|plc|LLC|LP)$/i, '')
    .trim()
    .toLowerCase();
  
  // Remove special characters and spaces
  name = name.replace(/[^a-z0-9]/g, '');
  
  // Only return if it looks like a reasonable domain name
  if (name.length >= 3 && name.length <= 30) {
    return `${name}.com`;
  }
  
  return null;
}

/**
 * Get fallback logo (for when stock logo fails to load)
 */
export function getFallbackLogoUrl(symbol: string): string {
  // Handle empty or invalid symbols
  if (!symbol || symbol.length === 0) {
    symbol = '?';
  }
  
  // Use a color-coded initial as fallback
  const initial = symbol.charAt(0).toUpperCase();
  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // violet  
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#ef4444', // red
  ];
  
  // Consistent color based on first letter
  const charCode = initial.charCodeAt(0);
  const colorIndex = isNaN(charCode) ? 0 : charCode % colors.length;
  const color = (colors[colorIndex] || colors[0]).replace('#', '');
  
  // Use a simple SVG data URL as fallback
  const svg = `
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#${color}" rx="8"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="system-ui" font-size="28" font-weight="bold" fill="white">
        ${initial}
      </text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Get investment type icon emoji
 */
export function getInvestmentTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    stock: '📈',
    etf: '📊',
    crypto: '₿',
    fund: '💰',
    index: '📉',
  };
  
  return icons[type.toLowerCase()] || '💼';
}
