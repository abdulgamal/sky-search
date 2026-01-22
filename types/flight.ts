export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightSegment {
  departure: {
    airport: string;
    time: string;
    iata: string;
  };
  arrival: {
    airport: string;
    time: string;
    iata: string;
  };
  carrier: string;
  carrierCode: string;
  flightNumber: string;
  duration: number;
  aircraft?: string;
}

export interface FlightOffer {
  id: string;
  price: {
    amount: number;
    currency: string;
  };
  segments: FlightSegment[][];
  stops: number;
  duration: number;
  carriers: string[];
  isBestPrice: boolean;
  isBestDuration: boolean;
  fareType?: "economy" | "premium" | "business" | "first";
  baggage?: {
    carryOn: boolean;
    checked: number;
  };
}

export interface SearchFilters {
  maxPrice: number;
  stops: number[];
  airlines: string[];
  minDuration: number;
  maxDuration: number;
  fareTypes: string[];
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  tripType: "one-way" | "round-trip";
}

export interface PriceDataPoint {
  date: string;
  price: number;
  average: number;
  low: number;
  high: number;
}

export interface PriceAlert {
  id: string;
  route: {
    origin: string;
    destination: string;
  };
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
}
