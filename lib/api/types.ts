export interface AmadeusFlightOffer {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  lastTicketingDateTime: string;
  numberOfBookableSeats: number;
  itineraries: {
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      operating?: {
        carrierCode: string;
      };
      duration: string;
      id: string;
      numberOfStops: number;
      blacklistedInEU: boolean;
    }>;
  }[];
  price: {
    currency: string;
    total: string;
    base: string;
    fees: Array<{
      amount: string;
      type: string;
    }>;
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      fareBasis: string;
      brandedFare?: string;
      class: string;
      includedCheckedBags: {
        quantity: number;
      };
    }>;
  }>;
}

export interface AmadeusLocation {
  type: string;
  subType: string;
  name: string;
  detailedName: string;
  id: string;
  self: {
    href: string;
    methods: string[];
  };
  timeZoneOffset: string;
  iataCode: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  address: {
    cityName: string;
    cityCode: string;
    countryName: string;
    countryCode: string;
    regionCode: string;
  };
  analytics?: {
    travelers: {
      score: number;
    };
  };
}

export interface AmadeusFlightDate {
  type: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  price: {
    total: string;
  };
  links: {
    flightDates: string;
    flightOffers: string;
  };
}

export interface AmadeusResponse<T> {
  meta: {
    count: number;
    links: {
      self: string;
    };
  };
  data: T[];
  dictionaries?: {
    locations?: Record<string, AmadeusLocation>;
    aircraft?: Record<string, string>;
    currencies?: Record<string, string>;
    carriers?: Record<string, string>;
  };
}

// Convert Amadeus types to our app types
export function convertAmadeusToFlightOffer(
  amadeusOffer: AmadeusFlightOffer,
  dictionaries?: any,
) {
  const firstItinerary = amadeusOffer.itineraries[0];
  const segments = firstItinerary.segments;

  const stops = segments.length - 1;

  const carriers = segments.map((segment) => {
    const carrierCode = segment.operating?.carrierCode || segment.carrierCode;
    return dictionaries?.carriers?.[carrierCode] || carrierCode;
  });
  const uniqueCarriers = [...new Set(carriers)];

  const durationMatch = firstItinerary.duration.match(/PT(\d+H)?(\d+M)?/);
  let durationMinutes = 0;
  if (durationMatch) {
    const hours = durationMatch[1]
      ? parseInt(durationMatch[1].replace("H", ""))
      : 0;
    const minutes = durationMatch[2]
      ? parseInt(durationMatch[2].replace("M", ""))
      : 0;
    durationMinutes = hours * 60 + minutes;
  }

  const fareType =
    amadeusOffer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin ||
    "ECONOMY";

  return {
    id: amadeusOffer.id,
    price: {
      amount: parseFloat(amadeusOffer.price.total),
      currency: amadeusOffer.price.currency,
    },
    segments: segments.map((segment) => [
      {
        departure: {
          airport:
            dictionaries?.locations?.[segment.departure.iataCode]?.name ||
            segment.departure.iataCode,
          time: segment.departure.at,
          iata: segment.departure.iataCode,
        },
        arrival: {
          airport:
            dictionaries?.locations?.[segment.arrival.iataCode]?.name ||
            segment.arrival.iataCode,
          time: segment.arrival.at,
          iata: segment.arrival.iataCode,
        },
        carrier:
          dictionaries?.carriers?.[segment.carrierCode] || segment.carrierCode,
        carrierCode: segment.carrierCode,
        flightNumber: segment.number,
        duration:
          parseInt(segment.duration.replace("PT", "").replace("H", "")) * 60 ||
          0,
        aircraft:
          dictionaries?.aircraft?.[segment.aircraft.code] ||
          segment.aircraft.code,
      },
    ]),
    stops,
    duration: durationMinutes,
    carriers: uniqueCarriers,
    isBestPrice: false, // Will be calculated after all flights are loaded
    isBestDuration: false, // Will be calculated after all flights are loaded
    fareType: fareType.toLowerCase() as any,
    baggage: {
      carryOn:
        amadeusOffer.travelerPricings[0]?.fareDetailsBySegment[0]
          ?.includedCheckedBags?.quantity > 0,
      checked:
        amadeusOffer.travelerPricings[0]?.fareDetailsBySegment[0]
          ?.includedCheckedBags?.quantity || 0,
    },
    rawData: amadeusOffer, // Keep original data for debugging
  };
}
