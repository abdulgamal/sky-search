"use client";

import { useState } from "react";
import { Calendar, Users, Search, ArrowLeftRight, MapPin } from "lucide-react";
import { useFlightStore } from "@/lib/store/flightStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AirportSelect from "./components/AirportSelect";
import DatePicker from "./components/DatePicker";
import PassengerSelector from "./components/PassengerSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SearchForm = () => {
  const { searchParams, setSearchParams, isLoading, searchFlights, apiError } =
    useFlightStore();
  const [tripType, setTripType] = useState<
    "one-way" | "round-trip" | "multi-city"
  >("round-trip");
  const [cabinClass, setCabinClass] = useState("ECONOMY");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSearchParams({
      tripType: tripType === "round-trip" ? "round-trip" : "one-way",
    });

    // Trigger flight search
    await searchFlights();
  };

  const swapAirports = () => {
    setSearchParams({
      origin: searchParams.destination,
      destination: searchParams.origin,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-2 shadow-lg z-10">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {(["one-way", "round-trip", "multi-city"] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant={tripType === type ? "default" : "outline"}
                className="capitalize"
                onClick={() => setTripType(type)}
              >
                {type.replace("-", " ")}
              </Button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  From
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <AirportSelect
                    value={searchParams.origin}
                    onChange={(value) => setSearchParams({ origin: value })}
                    placeholder="Origin"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={swapAirports}
                  className="h-10 w-10 rounded-full border hover:bg-primary/10"
                  title="Swap airports"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  To
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <AirportSelect
                    value={searchParams.destination}
                    onChange={(value) =>
                      setSearchParams({ destination: value })
                    }
                    placeholder="Destination"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Departure
                </label>
                <DatePicker
                  value={searchParams.departureDate}
                  onChange={(date) => setSearchParams({ departureDate: date })}
                />
              </div>

              {tripType === "round-trip" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Return
                  </label>
                  <DatePicker
                    value={searchParams.returnDate || ""}
                    onChange={(date) => setSearchParams({ returnDate: date })}
                    minDate={searchParams.departureDate}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Passengers
                </label>
                <PassengerSelector />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Cabin Class
                </label>
                <Select value={cabinClass} onValueChange={setCabinClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ECONOMY">Economy</SelectItem>
                    <SelectItem value="PREMIUM_ECONOMY">
                      Premium Economy
                    </SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="FIRST">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-flight-success"></div>
          <span>
            💡
            {apiError
              ? "Pricing from Mock API"
              : "Real-time pricing from Amadeus API"}
          </span>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="min-w-50 gap-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Searching Flights...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Search Real Flights
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default SearchForm;
