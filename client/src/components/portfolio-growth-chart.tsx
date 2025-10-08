import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from "@/components/ui/button";

interface PortfolioGrowthChartProps {
  currentValue: number;
  ytdReturn: number;
}

type Period = "1D" | "1W" | "1M" | "3M" | "YTD" | "1Y" | "All";

export default function PortfolioGrowthChart({ currentValue, ytdReturn }: PortfolioGrowthChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("All");

  const periods: Period[] = ["1D", "1W", "1M", "3M", "YTD", "1Y", "All"];

  const chartData = useMemo(() => {
    const dataPoints: { date: string; value: number }[] = [];
    let numPoints = 30;
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case "1D":
        numPoints = 24;
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case "1W":
        numPoints = 7;
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "1M":
        numPoints = 30;
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "3M":
        numPoints = 90;
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "YTD":
        const yearStart = new Date(new Date().getFullYear(), 0, 1);
        const daysSinceYearStart = Math.floor((Date.now() - yearStart.getTime()) / (24 * 60 * 60 * 1000));
        numPoints = daysSinceYearStart;
        startDate = yearStart;
        break;
      case "1Y":
        numPoints = 365;
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      case "All":
        numPoints = 365;
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const totalGrowthFactor = 1 + (ytdReturn / 100);
    
    for (let i = 0; i <= numPoints; i++) {
      const progressRatio = i / numPoints;
      const timeMs = startDate.getTime() + (Date.now() - startDate.getTime()) * progressRatio;
      const date = new Date(timeMs);
      
      const baseValue = currentValue / totalGrowthFactor;
      const growthValue = baseValue * (1 + (ytdReturn / 100) * progressRatio);
      const volatility = (Math.random() - 0.5) * 0.02;
      const value = growthValue * (1 + volatility);
      
      let dateStr: string;
      if (selectedPeriod === "1D") {
        dateStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (["1W", "1M"].includes(selectedPeriod)) {
        dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      dataPoints.push({
        date: dateStr,
        value: Math.max(0, value),
      });
    }

    return dataPoints;
  }, [currentValue, ytdReturn, selectedPeriod]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <p className="text-sm font-semibold">
            ${payload[0].value.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
        </div>
      );
    }
    return null;
  };

  const values = chartData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1;

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6">
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={[minValue - padding, maxValue + padding]}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(158, 64%, 52%)" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-2">
          {periods.map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={`text-xs font-medium ${
                selectedPeriod === period 
                  ? "bg-foreground text-background" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
