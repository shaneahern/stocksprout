/**
 * Stock Logo Utility
 * Uses Clearbit Logo API (free, no auth) with fallback to generated logos
 */
/**
 * Get stock logo URL using multiple fallback strategies
 * @param symbol - Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
 * @param companyName - Optional company name to help find logo
 * @param size - Logo size in pixels (default: 64)
 * @returns URL to the stock logo
 */
export declare function getStockLogoUrl(symbol: string, companyName?: string, size?: number): string;
/**
 * Get fallback logo (for when stock logo fails to load)
 */
export declare function getFallbackLogoUrl(symbol: string): string;
/**
 * Get investment type icon emoji
 */
export declare function getInvestmentTypeIcon(type: string): string;
