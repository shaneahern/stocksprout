import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { aggregateHoldingsByCategory } from "@/lib/investment-categories";
import type { Child } from "@shared/schema";

interface PortfolioChartProps {
  holdings: any[];
  child?: Child;
}

export default function PortfolioChart({ holdings, child }: PortfolioChartProps) {
  if (!holdings || holdings.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No portfolio data to display</p>
      </div>
    );
  }

  const categoryData = aggregateHoldingsByCategory(holdings);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <p className="font-semibold">{data.category}</p>
          <p className="text-sm text-muted-foreground">
            ${data.value.toFixed(2)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6">
        <div className="relative h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              {child?.profileImageUrl ? (
                <AvatarImage src={child.profileImageUrl} alt={child.name} />
              ) : (
                <AvatarFallback className="bg-muted">
                  <User className="w-16 h-16 text-muted-foreground" />
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {categoryData.map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.category}</span>
                <span className="text-sm text-muted-foreground">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
              <span className="text-sm font-semibold">
                ${item.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
