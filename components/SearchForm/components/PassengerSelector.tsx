"use client";

import { useState } from "react";
import { Users, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFlightStore } from "@/lib/store/flightStore";

const PassengerSelector = () => {
  const { searchParams, setSearchParams } = useFlightStore();
  const [isOpen, setIsOpen] = useState(false);

  const updatePassengers = (
    type: "adults" | "children" | "infants",
    value: number,
  ) => {
    const newValue = Math.max(0, value);
    setSearchParams({
      passengers: {
        ...searchParams.passengers,
        [type]: newValue,
      },
    });
  };

  const totalPassengers =
    searchParams.passengers.adults +
    searchParams.passengers.children +
    searchParams.passengers.infants;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>
            {totalPassengers} Passenger{totalPassengers !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-muted-foreground text-sm">
          {searchParams.passengers.adults}A, {searchParams.passengers.children}
          C, {searchParams.passengers.infants}I
        </span>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute bottom-full left-0 right-0 z-50 mt-1 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Adults</div>
                    <div className="text-sm text-muted-foreground">
                      12+ years
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updatePassengers(
                          "adults",
                          searchParams.passengers.adults - 1,
                        )
                      }
                      disabled={searchParams.passengers.adults <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">
                      {searchParams.passengers.adults}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updatePassengers(
                          "adults",
                          searchParams.passengers.adults + 1,
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Children</div>
                    <div className="text-sm text-muted-foreground">
                      2-11 years
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updatePassengers(
                          "children",
                          searchParams.passengers.children - 1,
                        )
                      }
                      disabled={searchParams.passengers.children <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">
                      {searchParams.passengers.children}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updatePassengers(
                          "children",
                          searchParams.passengers.children + 1,
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Infants</div>
                    <div className="text-sm text-muted-foreground">
                      Under 2 years
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updatePassengers(
                          "infants",
                          searchParams.passengers.infants - 1,
                        )
                      }
                      disabled={searchParams.passengers.infants <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">
                      {searchParams.passengers.infants}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updatePassengers(
                          "infants",
                          searchParams.passengers.infants + 1,
                        )
                      }
                      disabled={
                        searchParams.passengers.infants >=
                        searchParams.passengers.adults
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default PassengerSelector;
