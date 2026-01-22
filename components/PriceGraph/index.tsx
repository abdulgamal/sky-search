"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";
import { useFilteredFlights, useFlightStore } from "@/lib/store/flightStore";
import { TrendingUp, TrendingDown, Minus, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const PriceGraph = () => {
  const { filteredPriceHistory, filters, setFilters, priceHistory } =
    useFlightStore();
  const filteredFlights = useFilteredFlights();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [chartType, setChartType] = useState<"area" | "line">("area");

  // Use filtered price history when filters are active, otherwise use full price history
  const displayData =
    filteredPriceHistory.length >= 0 &&
    (filters.maxPrice < 10000 ||
      filters.stops.length < 4 ||
      filters.airlines.length > 0 ||
      filters.maxDuration < 24)
      ? filteredPriceHistory
      : priceHistory;

  const calculateTrend = () => {
    if (displayData.length < 2) return 0;
    const first = displayData[0].price;
    const last = displayData[displayData.length - 1].price;
    return ((last - first) / first) * 100;
  };

  const trend = calculateTrend();
  const currentPrice =
    filteredFlights.length > 0
      ? Math.min(...filteredFlights.map((f) => f.price.amount))
      : displayData.length > 0
        ? displayData[displayData.length - 1].price
        : 0;

  const filteredData = displayData.slice(
    -(timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90),
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isFiltered =
        filteredPriceHistory.length > 0 && displayData === filteredPriceHistory;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              {new Date(label).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
            {isFiltered && (
              <Badge variant="outline" className="text-xs gap-1">
                <Filter className="h-3 w-3" />
                Filtered
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold">${payload[0].value?.toFixed(2)}</p>
            {payload[1] && (
              <p className="text-sm text-muted-foreground">
                Average:{" "}
                <span className="font-medium">
                  ${payload[1].value?.toFixed(2)}
                </span>
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Based on {filteredFlights.length} available flights
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const isFiltered =
    filteredPriceHistory.length > 0 && displayData === filteredPriceHistory;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Price Analysis</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-bold">
              ${currentPrice.toFixed(2)}
            </span>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                trend > 0
                  ? "text-red-500"
                  : trend < 0
                    ? "text-flight-success"
                    : "text-muted-foreground"
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : trend < 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
              {Math.abs(trend).toFixed(1)}%
              {isFiltered && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Filtered View
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Tabs
          value={timeRange}
          onValueChange={(v: any) => setTimeRange(v)}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="7d">7D</TabsTrigger>
            <TabsTrigger value="30d">30D</TabsTrigger>
            <TabsTrigger value="90d">90D</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-75">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                className="text-xs"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tickFormatter={(value) => `$${value}`}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#colorPrice)"
                dot={{
                  r: 4,
                  fill: "var(--color-primary)",
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                }}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </AreaChart>
          ) : (
            <LineChart data={filteredData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                className="text-xs"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tickFormatter={(value) => `$${value}`}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "var(--color-primary)",
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                }}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">
              Current Best
            </div>
            <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {filteredFlights.length} flights
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">
              Filter Impact
            </div>
            <div
              className={`text-2xl font-bold ${
                trend > 0
                  ? "text-red-500"
                  : trend < 0
                    ? "text-flight-success"
                    : ""
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isFiltered ? "With filters" : "All flights"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">
              Price Range
            </div>
            <div className="text-2xl font-bold">
              $
              {filteredData.length > 0 &&
                Math.min(...filteredData.map((d) => d.price)).toFixed(0)}
              -$
              {filteredData.length > 0 &&
                Math.max(...filteredData.map((d) => d.price)).toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Last {timeRange}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border p-1">
          <Button
            variant={chartType === "area" ? "default" : "ghost"}
            size="sm"
            onClick={() => setChartType("area")}
          >
            Area
          </Button>
          <Button
            variant={chartType === "line" ? "default" : "ghost"}
            size="sm"
            onClick={() => setChartType("line")}
          >
            Line
          </Button>
        </div>
      </div>

      {isFiltered && (
        <div className="text-center text-sm text-muted-foreground">
          <p>📊 Graph shows prices for flights matching your current filters</p>
        </div>
      )}
    </div>
  );
};

export default PriceGraph;
