const AMADEUS_BASE_URL_V2 = "https://test.api.amadeus.com/v2";
const AMADEUS_BASE_URL_V1 = "https://test.api.amadeus.com/v1";

interface AmadeusToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

class AmadeusAPI {
  private clientId: string;
  private clientSecret: string;
  private token: AmadeusToken | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.clientId =
      process.env.AMADEUS_CLIENT_ID ||
      process.env.NEXT_PUBLIC_AMADEUS_CLIENT_ID ||
      "";
    this.clientSecret =
      process.env.AMADEUS_CLIENT_SECRET ||
      process.env.NEXT_PUBLIC_AMADEUS_CLIENT_SECRET ||
      "";

    if (!this.clientId || !this.clientSecret) {
      console.warn(
        "Amadeus API credentials not found. Please set them in environment variables.",
      );
    }
  }

  private async getAccessToken(): Promise<string> {
    // Check if token is still valid (with 60-second buffer)
    if (
      this.token &&
      this.tokenExpiry &&
      Date.now() < this.tokenExpiry - 60000
    ) {
      return this.token.access_token;
    }

    try {
      const response = await fetch(
        `https://test.api.amadeus.com/v1/security/oauth2/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.clientId,
            client_secret: this.clientSecret,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status}`);
      }

      const tokenData: AmadeusToken = await response.json();

      this.token = tokenData;
      this.tokenExpiry = Date.now() + tokenData.expires_in * 1000;

      return tokenData.access_token;
    } catch (error) {
      console.error("Error getting Amadeus token:", error);
      throw error;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any> = {},
    version: "v1" | "v2" = "v2",
  ): Promise<T> {
    try {
      const token = await this.getAccessToken();
      const queryString = new URLSearchParams(params).toString();
      const AMADEUS_BASE_URL =
        version === "v2" ? AMADEUS_BASE_URL_V2 : AMADEUS_BASE_URL_V1;
      const url = `${AMADEUS_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("responseAmadeus", response);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Amadeus API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Flight Offers Search
  async searchFlights(params: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    travelClass?: string;
    nonStop?: boolean;
    currencyCode?: string;
    maxPrice?: number;
  }) {
    const queryParams: Record<string, any> = {
      originLocationCode: params.originLocationCode,
      destinationLocationCode: params.destinationLocationCode,
      departureDate: params.departureDate,
      adults: params.adults,
      currencyCode: params.currencyCode || "USD",
      max: 25,
    };

    if (params.returnDate) {
      queryParams.returnDate = params.returnDate;
    }

    if (params.children) {
      queryParams.children = params.children;
    }

    if (params.infants) {
      queryParams.infants = params.infants;
    }

    if (params.travelClass) {
      queryParams.travelClass = params.travelClass;
    }

    if (params.nonStop !== undefined) {
      queryParams.nonStop = params.nonStop;
    }

    if (params.maxPrice) {
      queryParams.maxPrice = params.maxPrice;
    }

    return this.makeRequest<any>("/shopping/flight-offers", queryParams, "v2");
  }

  // Airport & City Search
  async searchAirports(keyword: string) {
    return this.makeRequest<any>(
      "/reference-data/locations",
      {
        subType: "CITY,AIRPORT",
        keyword,
      },
      "v1",
    );
  }
}

// Singleton instance
export const amadeus = new AmadeusAPI();
