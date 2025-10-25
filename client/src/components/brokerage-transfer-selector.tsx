import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Building2 } from "lucide-react";
import type { Investment } from "@shared/schema";
import { getStockLogoUrl, getFallbackLogoUrl } from "@/lib/stock-logo";

interface BrokerageHolding {
  investment: Investment;
  availableShares: number;
  averageCost: string;
  currentValue: string;
}

interface BrokerageTransferSelectorProps {
  selectedInvestment: Investment | null;
  selectedShares: string;
  onSelectInvestment: (investment: Investment) => void;
  onSharesChange: (shares: string) => void;
}

export default function BrokerageTransferSelector({
  selectedInvestment,
  selectedShares,
  onSelectInvestment,
  onSharesChange
}: BrokerageTransferSelectorProps) {
  // Simulated brokerage account holdings
  const brokerageHoldings: BrokerageHolding[] = [
    {
      investment: {
        id: "temp-AAPL",
        symbol: "AAPL",
        name: "Apple Inc.",
        type: "stock",
        currentPrice: "175.23",
        ytdReturn: "45.2"
      },
      availableShares: 10.5,
      averageCost: "152.30",
      currentValue: "1839.92"
    },
    {
      investment: {
        id: "temp-TSLA",
        symbol: "TSLA",
        name: "Tesla, Inc.",
        type: "stock",
        currentPrice: "242.15",
        ytdReturn: "32.8"
      },
      availableShares: 5,
      averageShares: 3.2,
      averageCost: "198.50",
      currentValue: "1210.75"
    },
    {
      investment: {
        id: "temp-VTI",
        symbol: "VTI",
        name: "Vanguard Total Stock Market ETF",
        type: "etf",
        currentPrice: "248.67",
        ytdReturn: "28.5"
      },
      availableShares: 25,
      averageCost: "220.15",
      currentValue: "6216.75"
    },
    {
      investment: {
        id: "temp-GOOGL",
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        type: "stock",
        currentPrice: "142.85",
        ytdReturn: "38.9"
      },
      availableShares: 7.25,
      averageCost: "125.40",
      currentValue: "1035.66"
    },
    {
      investment: {
        id: "temp-SPY",
        symbol: "SPY",
        name: "SPDR S&P 500 ETF Trust",
        type: "etf",
        currentPrice: "455.82",
        ytdReturn: "26.3"
      },
      availableShares: 12,
      averageCost: "425.90",
      currentValue: "5469.84"
    }
  ];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, symbol: string) => {
    const target = e.currentTarget;
    if (!target.src.startsWith('data:')) {
      target.src = getFallbackLogoUrl(symbol);
    }
  };

  const selectedHolding = brokerageHoldings.find(
    h => h.investment.id === selectedInvestment?.id
  );

  const handleSharesInputChange = (newShares: string) => {
    // Allow empty string for clearing
    if (newShares === "") {
      onSharesChange("");
      return;
    }

    const sharesNum = parseFloat(newShares);

    // Validate against available shares
    if (selectedHolding && sharesNum > selectedHolding.availableShares) {
      // Clamp to maximum available
      onSharesChange(selectedHolding.availableShares.toString());
      return;
    }

    onSharesChange(newShares);
  };

  return (
    <div className="space-y-6">
      {/* Brokerage Account Info */}
      <div className="flex items-center space-x-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Building2 className="w-6 h-6 text-primary" />
        <div>
          <h4 className="font-semibold text-foreground">Connected Brokerage Account</h4>
          <p className="text-sm text-muted-foreground">Fidelity Investments ••••1234 (Simulated)</p>
        </div>
      </div>

      {/* Holdings List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Holdings</h3>
        <div className="space-y-3">
          {brokerageHoldings.map((holding) => (
            <Card
              key={holding.investment.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedInvestment?.id === holding.investment.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onSelectInvestment(holding.investment)}
              data-testid={`brokerage-holding-${holding.investment.symbol}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Logo */}
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={getStockLogoUrl(holding.investment.symbol, holding.investment.name)}
                      alt={`${holding.investment.symbol} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => handleImageError(e, holding.investment.symbol)}
                    />
                  </div>

                  {/* Investment Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-foreground">{holding.investment.symbol}</h4>
                        <p className="text-sm text-muted-foreground truncate">{holding.investment.name}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize text-xs ml-2">
                        {holding.investment.type}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Available Shares</p>
                        <p className="font-semibold text-foreground">{holding.availableShares}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Price</p>
                        <p className="font-semibold text-foreground">${parseFloat(holding.investment.currentPrice).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Current Value</p>
                        <p className="font-semibold text-foreground">${holding.currentValue}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-success" />
                        <p className="text-sm font-semibold text-success">
                          +{holding.investment.ytdReturn}% YTD
                        </p>
                      </div>
                    </div>

                    {selectedInvestment?.id === holding.investment.id && (
                      <div className="mt-3 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-primary text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Share Selection */}
      {selectedInvestment && selectedHolding && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-6">
            <h4 className="font-semibold text-foreground mb-4">Transfer Amount</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Number of Shares to Transfer
                </label>
                <Input
                  type="number"
                  value={selectedShares}
                  onChange={(e) => handleSharesInputChange(e.target.value)}
                  className="text-2xl font-bold h-12"
                  min="0.0001"
                  max={selectedHolding.availableShares}
                  step="0.0001"
                  placeholder="0.0000"
                  data-testid="input-transfer-shares"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Maximum: {selectedHolding.availableShares} shares available
                </p>
              </div>

              {selectedShares && parseFloat(selectedShares) > 0 && (
                <div className="p-4 bg-background rounded-lg border border-border">
                  <h5 className="font-semibold text-foreground mb-2">Transfer Summary</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shares to Transfer:</span>
                      <span className="font-semibold text-foreground">{selectedShares}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Value:</span>
                      <span className="font-semibold text-foreground">
                        ${(parseFloat(selectedShares) * parseFloat(selectedInvestment.currentPrice)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remaining Shares:</span>
                      <span className="font-semibold text-foreground">
                        {(selectedHolding.availableShares - parseFloat(selectedShares)).toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
