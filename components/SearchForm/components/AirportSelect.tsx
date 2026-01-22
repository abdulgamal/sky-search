"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Plane, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { amadeus } from "@/lib/api/amadeus";

interface AirportSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface Airport {
  iataCode: string;
  name: string;
  cityName: string;
  countryName: string;
}

const AirportSelect = ({
  value,
  onChange,
  placeholder,
  className,
}: AirportSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Refs for cleanup
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const [popularAirports] = useState<Airport[]>([
    {
      iataCode: "JFK",
      name: "John F Kennedy Intl",
      cityName: "New York",
      countryName: "United States",
    },
    {
      iataCode: "LAX",
      name: "Los Angeles Intl",
      cityName: "Los Angeles",
      countryName: "United States",
    },
    {
      iataCode: "LHR",
      name: "Heathrow",
      cityName: "London",
      countryName: "United Kingdom",
    },
    {
      iataCode: "CDG",
      name: "Charles De Gaulle",
      cityName: "Paris",
      countryName: "France",
    },
    {
      iataCode: "DXB",
      name: "Dubai Intl",
      cityName: "Dubai",
      countryName: "United Arab Emirates",
    },
    {
      iataCode: "HND",
      name: "Haneda",
      cityName: "Tokyo",
      countryName: "Japan",
    },
    {
      iataCode: "SYD",
      name: "Sydney Kingsford Smith",
      cityName: "Sydney",
      countryName: "Australia",
    },
    {
      iataCode: "SIN",
      name: "Changi",
      cityName: "Singapore",
      countryName: "Singapore",
    },
  ]);

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't debounce if search is cleared
    if (search === "") {
      setDebouncedSearch("");
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Handle search when debounced value changes
  useEffect(() => {
    if (!isMountedRef.current) return;

    if (debouncedSearch.length >= 2 && isOpen) {
      searchAirports(debouncedSearch);
    } else if (!debouncedSearch && isOpen) {
      setAirports(popularAirports);
    }
  }, [debouncedSearch, isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const searchAirports = useCallback(
    async (searchTerm: string) => {
      if (!isMountedRef.current) return;

      setLoading(true);
      try {
        const response = await amadeus.searchAirports(searchTerm);

        const airportData =
          response.data?.map((item: any) => ({
            iataCode: item.iataCode,
            name: item.name,
            cityName: item.address?.cityName || "",
            countryName: item.address?.countryName || "",
          })) || [];

        // Only update if component is still mounted and search hasn't changed
        if (isMountedRef.current && searchTerm === debouncedSearch) {
          setAirports(airportData.slice(0, 10));
        }
      } catch (error) {
        console.error("Failed to search airports:", error);
        // Fallback to filtered popular airports
        if (isMountedRef.current && searchTerm === debouncedSearch) {
          setAirports(
            popularAirports.filter(
              (a) =>
                a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.iataCode.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
          );
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [debouncedSearch],
  );

  const selectedAirport = [...popularAirports, ...airports].find(
    (a) => a.iataCode === value,
  );

  return (
    <div className="relative">
      <div
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-pointer ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {selectedAirport
              ? `${selectedAirport.iataCode} - ${selectedAirport.cityName}`
              : placeholder || "Select airport"}
          </span>
        </div>
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto shadow-lg">
            <div className="p-2 border-b">
              <Input
                placeholder="Search airports (e.g., JFK, London, Tokyo)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 focus-visible:ring-0"
                autoFocus
              />
              {loading && (
                <div className="text-xs text-muted-foreground mt-1">
                  Searching...
                </div>
              )}
            </div>
            <div className="py-1">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-2 w-24" />
                    </div>
                  </div>
                ))
              ) : airports.length > 0 ? (
                airports.map((airport) => (
                  <div
                    key={airport.iataCode}
                    className={`flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-accent ${
                      value === airport.iataCode ? "bg-accent" : ""
                    }`}
                    onClick={() => {
                      onChange(airport.iataCode);
                      setIsOpen(false);
                      setSearch("");
                    }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Plane className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{airport.cityName}</div>
                      <div className="text-xs text-muted-foreground">
                        {airport.name}
                      </div>
                    </div>
                    <div className="text-xs font-mono font-medium bg-muted px-2 py-1 rounded">
                      {airport.iataCode}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  {debouncedSearch.length >= 2
                    ? "No airports found. Try a different search."
                    : "Start typing to search airports..."}
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AirportSelect;
