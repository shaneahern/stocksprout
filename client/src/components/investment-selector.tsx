import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp } from "lucide-react";
import type { Investment } from "@shared/schema";

interface InvestmentSelectorProps {
  selectedInvestment: Investment | null;
  onSelectInvestment: (investment: Investment) => void;
}

export default function InvestmentSelector({ 
  selectedInvestment, 
  onSelectInvestment 
}: InvestmentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data: investments = [] } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const { data: searchResults = [] } = useQuery<Investment[]>({
    queryKey: ["/api/investments/search", { q: searchQuery }],
    enabled: searchQuery.length > 2,
  });

  const popularInvestments = investments.slice(0, 6);
  const displayInvestments = searchQuery.length > 2 ? searchResults : popularInvestments;

  const getInvestmentIcon = (type: string) => {
    switch (type) {
      case 'crypto':
        return '₿';
      case 'etf':
        return '📊';
      case 'stock':
        return '📈';
      default:
        return '💰';
    }
  };

  const getInvestmentColor = (symbol: string) => {
    const colors = {
      'BTC': 'bg-orange-500',
      'TSLA': 'bg-red-500',
      'AAPL': 'bg-gray-500',
      'GOOGL': 'bg-blue-500',
      'SPY': 'bg-green-500',
    };
    return colors[symbol as keyof typeof colors] || 'bg-primary';
  };

  return (
    <div className="space-y-6">
      {/* Popular Choices */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Popular Choices</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {popularInvestments.map((investment) => (
            <Card
              key={investment.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedInvestment?.id === investment.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onSelectInvestment(investment)}
              data-testid={`card-investment-${investment.symbol}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 ${getInvestmentColor(investment.symbol)} rounded-lg flex items-center justify-center text-white font-bold`}>
                    {investment.symbol === 'BTC' ? '₿' : investment.symbol.charAt(0)}
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Search for Specific Investment</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            data-testid="button-toggle-search"
          >
            <Search className="w-4 h-4 mr-2" />
            {showSearch ? "Hide Search" : "Show Search"}
          </Button>
        </div>
        
        {showSearch && (
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
                    onClick={() => onSelectInvestment(investment)}
                    data-testid={`search-result-${investment.symbol}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{investment.symbol}</h4>
                          <p className="text-sm text-muted-foreground">{investment.name}</p>
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
        )}
      </div>
    </div>
  );
}
