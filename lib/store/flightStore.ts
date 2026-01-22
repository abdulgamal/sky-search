import { create } from "zustand";
import {
  FlightOffer,
  SearchFilters,
  SearchParams,
  PriceDataPoint,
} from "@/types/flight";
import { useMemo } from "react";

interface FlightState {
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;

  flights: FlightOffer[];
  isLoading: boolean;
  error: string | null;
  apiError: boolean;

  searchFlights: () => Promise<void>;
  setFlights: (flights: FlightOffer[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;

  priceHistory: PriceDataPoint[];
  filteredPriceHistory: PriceDataPoint[];
  generatePriceHistory: (flights: FlightOffer[]) => PriceDataPoint[];
}

const initialSearchParams: SearchParams = {
  origin: "JFK",
  destination: "LAX",
  departureDate: new Date().toISOString().split("T")[0],
  passengers: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  tripType: "one-way",
};

const initialFilters: SearchFilters = {
  maxPrice: 10000,
  stops: [0, 1, 2, 3],
  airlines: [],
  minDuration: 0,
  maxDuration: 24,
  fareTypes: ["economy", "premium", "business", "first"],
};

export const useFlightStore = create<FlightState>((set, get) => ({
  searchParams: initialSearchParams,
  flights: [],
  isLoading: false,
  error: null,
  apiError: false,

  filters: initialFilters,

  priceHistory: [],
  filteredPriceHistory: [],

  setSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),

  setFlights: (flights) => {
    const priceHistory = get().generatePriceHistory(flights);

    set({
      flights,
      priceHistory,
      filteredPriceHistory: priceHistory,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  searchFlights: async () => {
    const { searchParams } = get();

    set({ isLoading: true, error: null, apiError: false });

    try {
      const params = new URLSearchParams({
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        adults: searchParams.passengers.adults.toString(),
        children: searchParams.passengers.children.toString(),
        infants: searchParams.passengers.infants.toString(),
      });

      if (searchParams.returnDate) {
        params.append("returnDate", searchParams.returnDate);
      }

      const response = await fetch(`/api/flights?${params}`);
      const result = await response.json();

      set({
        flights: result.data,
        priceHistory: result.priceHistory,
        filteredPriceHistory: result.priceHistory,
        isLoading: false,
        apiError: result.fallback || false,
      });
    } catch (err) {
      console.error("Search error:", err);

      const { mockFlights } = await import("@/lib/utils/flightData");
      const mockData = mockFlights();

      const priceHistory = get().generatePriceHistory(mockData);

      set({
        flights: mockData,
        priceHistory,
        filteredPriceHistory: priceHistory,
        isLoading: false,
        error: "Using mock data. API unavailable.",
        apiError: true,
      });
    }
  },

  setFilters: (partial) => {
    const { flights, filters } = get();
    const nextFilters = { ...filters, ...partial };

    const filteredFlights = filterFlights(flights, nextFilters);
    const filteredPriceHistory = get().generatePriceHistory(filteredFlights);

    set({
      filters: nextFilters,
      filteredPriceHistory,
    });
  },

  resetFilters: () => {
    const { flights } = get();
    const priceHistory = get().generatePriceHistory(flights);

    set({
      filters: initialFilters,
      filteredPriceHistory: priceHistory,
    });
  },

  generatePriceHistory: (flights) => {
    if (!flights.length) return [];

    const prices = flights.map((f) => f.price.amount);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    const today = new Date();
    const history: PriceDataPoint[] = [];

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const weeklyPattern = [1.05, 1.02, 1, 0.98, 1.03, 1.08, 1.1];
      const trend = Math.sin(i * 0.2) * 0.1 + 1;
      const volatility = 0.15;

      const price =
        avgPrice *
        weeklyPattern[date.getDay()] *
        trend *
        (1 + (Math.random() - 0.5) * volatility);

      history.push({
        date: date.toISOString().split("T")[0],
        price: Math.round(price),
        average: Math.round(avgPrice),
        low: Math.round(price * 0.9),
        high: Math.round(price * 1.1),
      });
    }

    return history;
  },
}));

const filterFlights = (flights: FlightOffer[], filters: SearchFilters) => {
  return flights.filter((flight) => {
    if (flight.price.amount > filters.maxPrice) return false;
    if (!filters.stops.includes(flight.stops)) return false;

    if (
      filters.airlines.length &&
      !flight.carriers.some((c) => filters.airlines.includes(c))
    )
      return false;

    const hours = flight.duration / 60;
    if (hours < filters.minDuration || hours > filters.maxDuration)
      return false;

    if (
      filters.fareTypes.length &&
      flight.fareType &&
      !filters.fareTypes.includes(flight.fareType)
    )
      return false;

    return true;
  });
};

export const useFilteredFlights = () => {
  const flights = useFlightStore((s) => s.flights);
  const filters = useFlightStore((s) => s.filters);

  return useMemo(() => filterFlights(flights, filters), [flights, filters]);
};

export const useUniqueAirlines = () => {
  const flights = useFlightStore((s) => s.flights);

  return useMemo(() => {
    const set = new Set<string>();
    flights.forEach((f) => f.carriers.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [flights]);
};
