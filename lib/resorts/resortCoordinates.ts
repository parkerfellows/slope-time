/**
 * Approximate coordinates for each resort's base lodge / summit area.
 * Used when calling weather APIs that require lat/lng rather than an address.
 */
export const RESORT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "deer-valley": { lat: 40.6374, lng: -111.4783 },
  "park-city": { lat: 40.6514, lng: -111.5080 },
  snowbird: { lat: 40.5831, lng: -111.6556 },
  brighton: { lat: 40.5986, lng: -111.5833 },
  solitude: { lat: 40.6199, lng: -111.5920 },
};
