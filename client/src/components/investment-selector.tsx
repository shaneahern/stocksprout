import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp } from "lucide-react";
import type { Investment } from "@shared/schema";
import { getStockLogoUrl, getFallbackLogoUrl } from "@/lib/stock-logo";

interface InvestmentSelectorProps {
  selectedInvestment: Investment | null;
  onSelectInvestment: (investment: Investment) => void;
}

export default function InvestmentSelector({
  selectedInvestment,
  onSelectInvestment
}: InvestmentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: investments = [] } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const { data: searchResults = [] } = useQuery<Investment[]>({
    queryKey: ["/api/investments/search", searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/investments/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: searchQuery.length > 2,
  });

  const popularInvestments = investments.slice(0, 6);
  const displayInvestments = searchQuery.length > 2 ? searchResults : popularInvestments;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, symbol: string) => {
    const target = e.currentTarget;
    // Prevent infinite loop if fallback also fails
    if (!target.src.startsWith('data:')) {
      target.src = getFallbackLogoUrl(symbol);
    }
  };

  const handleSelectInvestment = (investment: Investment) => {
    onSelectInvestment(investment);
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Popular Choices */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Popular Choices</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {popularInvestments.map((investment) => (
            <Card
              key={investment.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedInvestment?.id === investment.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleSelectInvestment(investment)}
              data-testid={`card-investment-${investment.symbol}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-muted">
                    <img 
                      src={getStockLogoUrl(investment.symbol, investment.name)}
                      alt={`${investment.symbol} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => handleImageError(e, investment.symbol)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground truncate">
                      {investment.symbol}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {investment.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    ${parseFloat(investment.currentPrice).toFixed(2)}
                  </span>
                  <Badge variant="secondary" className="capitalize text-xs">
                    {investment.type}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-sm font-semibold text-success">
                    +{investment.ytdReturn}% YTD
                  </span>
                </div>
                {selectedInvestment?.id === investment.id && (
                  <div className="mt-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-primary text-sm font-medium">Selected</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Search Section */}
      <div className="border-t border-border pt-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Search for Specific Investment</h3>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stocks, ETFs, or funds..."
              className="pl-10"
              data-testid="input-investment-search"
            />
          </div>

          {searchQuery.length > 2 && (
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {searchResults.map((investment) => (
                <Card
                  key={investment.id}
                  className={`cursor-pointer transition-all ${
                    selectedInvestment?.id === investment.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectInvestment(investment)}
                  data-testid={`search-result-${investment.symbol}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={getStockLogoUrl(investment.symbol, investment.name)}
                            alt={`${investment.symbol} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => handleImageError(e, investment.symbol)}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{investment.symbol}</h4>
                          <p className="text-sm text-muted-foreground">{investment.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${parseFloat(investment.currentPrice).toFixed(2)}</p>
                        <p className="text-sm text-success">+{investment.ytdReturn}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {searchResults.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No investments found for "{searchQuery}"
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
