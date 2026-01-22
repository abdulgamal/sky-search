import { NextRequest, NextResponse } from "next/server";
import { amadeus } from "@/lib/api/amadeus";
import {
  AmadeusFlightOffer,
  AmadeusResponse,
  convertAmadeusToFlightOffer,
} from "@/lib/api/types";
import { FlightOffer } from "@/types/flight";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const origin = searchParams.get("origin") || "JFK";
    const destination = searchParams.get("destination") || "LAX";
    const departureDate =
      searchParams.get("departureDate") ||
      new Date().toISOString().split("T")[0];
    const returnDate = searchParams.get("returnDate");
    const adults = parseInt(searchParams.get("adults") || "1");
    const children = parseInt(searchParams.get("children") || "0");
    const infants = parseInt(searchParams.get("infants") || "0");
    const travelClass = searchParams.get("travelClass") || "ECONOMY";
    const currency = searchParams.get("currency") || "USD";

    // Call Amadeus API
    const response: AmadeusResponse<AmadeusFlightOffer> =
      await amadeus.searchFlights({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        returnDate: returnDate || undefined,
        adults,
        children: children > 0 ? children : undefined,
        infants: infants > 0 ? infants : undefined,
        travelClass,
        currencyCode: currency,
        maxPrice: 10000,
      });

    // Convert Amadeus response to our app format
    const flightOffers: FlightOffer[] =
      response.data?.map((offer) =>
        convertAmadeusToFlightOffer(offer, response.dictionaries),
      ) || [];

    // Calculate best price and best duration
    if (flightOffers.length > 0) {
      const minPrice = Math.min(...flightOffers.map((f) => f.price.amount));
      const minDuration = Math.min(...flightOffers.map((f) => f.duration));

      flightOffers.forEach((flight) => {
        flight.isBestPrice = flight.price.amount === minPrice;
        flight.isBestDuration = flight.duration === minDuration;
      });
    }

    // Sort by price
    flightOffers.sort((a, b) => a.price.amount - b.price.amount);

    // Generate price history
    const generatePriceHistory = (flights: FlightOffer[]) => {
      if (flights.length === 0) return [];

      const prices = flights.map((f) => f.price.amount);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const today = new Date();
      const history = [];

      for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const volatility = 0.15;
        const dayOfWeek = date.getDay();
        const weeklyPattern = [1.05, 1.02, 1.0, 0.98, 1.03, 1.08, 1.1];
        const trend = Math.sin(i * 0.2) * 0.1 + 1;

        const price =
          avgPrice *
          weeklyPattern[dayOfWeek] *
          trend *
          (1 + (Math.random() - 0.5) * volatility);
        const low = price * (0.9 + Math.random() * 0.05);
        const high = price * (1.05 + Math.random() * 0.05);

        history.push({
          date: date.toISOString().split("T")[0],
          price: Math.round(price),
          average: Math.round(avgPrice),
          low: Math.round(low),
          high: Math.round(high),
        });
      }

      return history;
    };

    const priceHistory = generatePriceHistory(flightOffers);

    return NextResponse.json({
      success: true,
      data: flightOffers,
      priceHistory,
      meta: {
        count: flightOffers.length,
        origin,
        destination,
        departureDate,
        priceRange: {
          min: Math.min(...flightOffers.map((f) => f.price.amount)),
          max: Math.max(...flightOffers.map((f) => f.price.amount)),
        },
      },
    });
  } catch (error: any) {
    console.error("API Error:", error);

    // Fallback to mock data if API fails
    const { mockFlights, generatePriceHistory } =
      await import("@/lib/utils/flightData");
    const mockData = mockFlights();
    const mockPriceHistory = generatePriceHistory();

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch flights",
        fallback: true,
        data: mockData,
        priceHistory: mockPriceHistory,
        message: "Using mock data due to API error",
      },
      { status: 200 },
    );
  }
}
