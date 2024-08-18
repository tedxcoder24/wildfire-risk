interface GeocodeResult {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface GeocodeResponse {
  results: GeocodeResult[];
  status: string;
}
