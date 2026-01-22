"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";

import SearchForm from "@/components/SearchForm";
import {
  useFilteredFlights,
  useFlightStore,
  useUniqueAirlines,
} from "@/lib/store/flightStore";
import { formatCurrency } from "@/lib/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import PriceGraph from "@/components/PriceGraph";

export default function Home() {
  const {
    searchFlights,
    flights,
    isLoading,
    filters,
    setFilters,
    resetFilters,
  } = useFlightStore();
  const uniqueAirlines = useUniqueAirlines();
  const filteredFlights = useFilteredFlights();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    searchFlights();
  }, []);

  // Get active filter count
  const activeFilterCount =
    (filters.maxPrice < 10000 ? 1 : 0) +
    (filters.stops.length < 4 ? 1 : 0) +
    filters.airlines.length +
    (filters.maxDuration < 24 ? 1 : 0);

  const featuredFlights = filteredFlights.slice(0, 6);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Plane className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient">
            SkySearch
          </h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Find your perfect flight with real-time pricing from 500+ airlines
        </p>
      </div>

      <Card className="border-2 shadow-xl overflow-hidden">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl md:text-3xl">Search Flights</CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <SearchForm />
        </CardContent>
      </Card>

      {flights.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {filteredFlights.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Available Flights
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-flight-success">
                  $
                  {filteredFlights.length > 0
                    ? Math.min(
                        ...filteredFlights.map((f) => f.price.amount),
                      ).toFixed(0)
                    : "0"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Lowest Price
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-flight-secondary">
                  {uniqueAirlines.length}
                </div>
                <div className="text-sm text-muted-foreground">Airlines</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-flight-accent">
                  {filteredFlights.filter((f) => f.isBestPrice).length}
                </div>
                <div className="text-sm text-muted-foreground">Best Deals</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Available Flights</h2>
            <p className="text-muted-foreground">
              {isLoading
                ? "Loading flights..."
                : filteredFlights.length === 0
                  ? "No flights found for your search"
                  : `Showing ${filteredFlights.length} flights`}
            </p>
          </div>

          {filteredFlights.length > 0 && (
            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="gap-2 hidden sm:flex"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          )}
        </div>

        {showFilters && filteredFlights.length > 0 && (
          <Card className="animate-slide-up">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filter Flights</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-auto p-0 text-sm"
                  >
                    Reset all
                  </Button>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Price Range</div>
                  <div className="flex flex-wrap gap-2">
                    {[300, 500, 750, 1000].map((price) => (
                      <Badge
                        key={price}
                        variant={
                          filters.maxPrice <= price ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => setFilters({ maxPrice: price })}
                      >
                        Under ${price}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Stops</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 0, label: "Non-stop" },
                      { value: 1, label: "1 stop" },
                      { value: 2, label: "2 stops" },
                    ].map((stop) => (
                      <Badge
                        key={stop.value}
                        variant={
                          filters.stops.includes(stop.value)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          const newStops = filters.stops.includes(stop.value)
                            ? filters.stops.filter((s) => s !== stop.value)
                            : [...filters.stops, stop.value];
                          setFilters({ stops: newStops });
                        }}
                      >
                        {stop.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {uniqueAirlines.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Airlines</div>
                    <div className="flex flex-wrap gap-2">
                      {uniqueAirlines.slice(0, 5).map((airline) => (
                        <Badge
                          key={airline}
                          variant={
                            filters.airlines.includes(airline)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => {
                            const newAirlines = filters.airlines.includes(
                              airline,
                            )
                              ? filters.airlines.filter((a) => a !== airline)
                              : [...filters.airlines, airline];
                            setFilters({ airlines: newAirlines });
                          }}
                        >
                          {airline}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.maxPrice < 10000 && (
              <Badge variant="secondary" className="gap-1">
                Under ${filters.maxPrice}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters({ maxPrice: 10000 })}
                />
              </Badge>
            )}
            {filters.stops.length < 4 && (
              <Badge variant="secondary" className="gap-1">
                {filters.stops.length} stop types
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters({ stops: [0, 1, 2, 3] })}
                />
              </Badge>
            )}
            {filters.airlines.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                {filters.airlines.length} airlines
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters({ airlines: [] })}
                />
              </Badge>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : featuredFlights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFlights.map((flight) => (
              <FlightGridCard key={flight.id} flight={flight} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No flights found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search for different dates
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={resetFilters}>Reset Filters</Button>
                <Button variant="outline" onClick={() => searchFlights()}>
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredFlights.length > 6 && (
          <div className="text-center">
            <Button variant="outline" className="gap-2">
              View All {filteredFlights.length} Flights
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {flights.length > 0 && (
        <>
          <Separator className="my-8" />

          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Price Trends
                </CardTitle>
                <CardDescription>
                  Real-time price analysis for your searched route
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* <div className="h-64"> */}
                <PriceGraph />
                {/* </div> */}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function FlightGridCard({ flight }: { flight: any }) {
  const firstSegment = flight.segments[0][0];
  const lastSegment = flight.segments[flight.segments.length - 1].slice(-1)[0];

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg truncate">
              {flight.carriers[0]}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {flight.isBestPrice && (
                <Badge variant="default" className="gap-1 text-xs">
                  <Sparkles className="h-3 w-3" />
                  Best Price
                </Badge>
              )}
              {flight.fareType && (
                <Badge variant="outline" className="text-xs capitalize">
                  {flight.fareType}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(flight.price.amount, flight.price.currency)}
            </div>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-center flex-1">
              <div className="text-lg font-bold">
                {firstSegment.departure.iata}
              </div>
            </div>

            <div className="flex-1 px-2">
              <div className="relative">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-primary to-flight-secondary"
                    style={{ width: `${(flight.stops + 1) * 33}%` }}
                  />
                </div>
                <div className="text-center text-xs text-muted-foreground mt-1">
                  {flight.stops === 0
                    ? "Direct"
                    : `${flight.stops} stop${flight.stops !== 1 ? "s" : ""}`}
                </div>
              </div>
            </div>

            <div className="text-center flex-1">
              <div className="text-lg font-bold">
                {lastSegment.arrival.iata}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{firstSegment.departure.time.slice(11, 16)}</span>
            <span className="font-medium">
              {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
            </span>
            <span>{lastSegment.arrival.time.slice(11, 16)}</span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center justify-between">
            <span>Aircraft</span>
            <span className="font-medium">
              {firstSegment.aircraft || "737"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Flight</span>
            <span className="font-medium">
              {flight.carriers[0]} {firstSegment.flightNumber}
            </span>
          </div>
        </div>

        <Button className="w-full gap-2 group-hover:bg-primary/90">
          Select Flight
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
