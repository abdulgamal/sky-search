import { FlightOffer, PriceDataPoint } from "@/types/flight";

export const mockFlights = (): FlightOffer[] => {
  const airlines = [
    "Delta Airlines",
    "American Airlines",
    "United Airlines",
    "JetBlue Airways",
    "Southwest Airlines",
    "Alaska Airlines",
    "Spirit Airlines",
    "Frontier Airlines",
    "Hawaiian Airlines",
    "Emirates",
    "Qatar Airways",
    "British Airways",
  ];

  const cities = [
    { code: "JFK", city: "New York", name: "John F. Kennedy" },
    { code: "LAX", city: "Los Angeles", name: "Los Angeles International" },
    { code: "ORD", city: "Chicago", name: "O'Hare International" },
    { code: "DFW", city: "Dallas", name: "Dallas/Fort Worth" },
    { code: "MIA", city: "Miami", name: "Miami International" },
    { code: "SEA", city: "Seattle", name: "Seattle-Tacoma International" },
    { code: "SFO", city: "San Francisco", name: "San Francisco International" },
    { code: "ATL", city: "Atlanta", name: "Hartsfield-Jackson Atlanta" },
    { code: "DEN", city: "Denver", name: "Denver International" },
    { code: "BOS", city: "Boston", name: "Logan International" },
  ];

  const flights: FlightOffer[] = [];
  const basePrice = 350;

  for (let i = 0; i < 20; i++) {
    const stops = Math.floor(Math.random() * 3);
    const segments: any[] = [];
    let totalDuration = 0;

    // Create segments based on stops
    for (let j = 0; j <= stops; j++) {
      const segmentDuration = Math.floor(Math.random() * 6) * 60 + 180;
      totalDuration += segmentDuration;

      segments.push([
        {
          departure: {
            airport:
              j === 0
                ? "JFK"
                : cities[Math.floor(Math.random() * cities.length)].code,
            time: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}T${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00`,
            iata: j === 0 ? "JFK" : "CON",
          },
          arrival: {
            airport:
              j === stops
                ? "LAX"
                : cities[Math.floor(Math.random() * cities.length)].code,
            time: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}T${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00`,
            iata: j === stops ? "LAX" : "CON",
          },
          carrier: airlines[Math.floor(Math.random() * airlines.length)],
          carrierCode: "DL",
          flightNumber: `${Math.floor(Math.random() * 9000) + 1000}`,
          duration: segmentDuration,
          aircraft: ["Boeing 737", "Airbus A320", "Boeing 787", "Airbus A350"][
            Math.floor(Math.random() * 4)
          ],
        },
      ]);
    }

    const priceMultiplier = 1 + stops * 0.1 - Math.random() * 0.2;
    const price = Math.round(basePrice * priceMultiplier * 100) / 100;

    const carriers = [...new Set(segments.map((seg) => seg[0].carrier))];
    const fareTypes = ["economy", "premium", "business", "first"];

    flights.push({
      id: `flight-${i}-${Date.now()}`,
      price: {
        amount: price,
        currency: "USD",
      },
      segments,
      stops,
      duration: totalDuration,
      carriers,
      isBestPrice: i === 0,
      isBestDuration: i === 3,
      fareType: fareTypes[Math.floor(Math.random() * fareTypes.length)] as any,
      baggage: {
        carryOn: Math.random() > 0.2,
        checked: Math.floor(Math.random() * 3),
      },
    });
  }

  // Sort by price and duration
  return flights.sort((a, b) => {
    if (a.isBestPrice) return -1;
    if (b.isBestPrice) return 1;
    return a.price.amount - b.price.amount;
  });
};

export const generatePriceHistory = (): PriceDataPoint[] => {
  const data: PriceDataPoint[] = [];
  const basePrice = 350;
  const today = new Date();
  const volatility = 0.15;

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic price fluctuations with weekly patterns
    const dayOfWeek = date.getDay();
    const weeklyPattern = [1.05, 1.02, 1.0, 0.98, 1.03, 1.08, 1.1];
    const trend = Math.sin(i * 0.2) * 0.1 + 1;

    const price =
      basePrice *
      weeklyPattern[dayOfWeek] *
      trend *
      (1 + (Math.random() - 0.5) * volatility);
    const average = basePrice * trend;
    const low = price * (0.9 + Math.random() * 0.05);
    const high = price * (1.05 + Math.random() * 0.05);

    data.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price),
      average: Math.round(average),
      low: Math.round(low),
      high: Math.round(high),
    });
  }

  return data;
};

export const popularAirports = [
  {
    iata: "JFK",
    name: "John F. Kennedy International",
    city: "New York",
    country: "USA",
  },
  {
    iata: "LAX",
    name: "Los Angeles International",
    city: "Los Angeles",
    country: "USA",
  },
  { iata: "LHR", name: "Heathrow Airport", city: "London", country: "UK" },
  {
    iata: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
  },
  { iata: "DXB", name: "Dubai International", city: "Dubai", country: "UAE" },
  { iata: "HND", name: "Haneda Airport", city: "Tokyo", country: "Japan" },
  { iata: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia" },
  {
    iata: "SIN",
    name: "Changi Airport",
    city: "Singapore",
    country: "Singapore",
  },
  {
    iata: "FRA",
    name: "Frankfurt Airport",
    city: "Frankfurt",
    country: "Germany",
  },
  {
    iata: "AMS",
    name: "Amsterdam Schiphol",
    city: "Amsterdam",
    country: "Netherlands",
  },
];

export const airlineLogos: Record<string, string> = {
  "Delta Airlines": "DL",
  "American Airlines": "AA",
  "United Airlines": "UA",
  "JetBlue Airways": "B6",
  "Southwest Airlines": "WN",
  "Alaska Airlines": "AS",
  "Spirit Airlines": "NK",
  "Frontier Airlines": "F9",
  "Hawaiian Airlines": "HA",
  Emirates: "EK",
  "Qatar Airways": "QR",
  "British Airways": "BA",
};
