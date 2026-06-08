import type { LatLngBounds } from 'leaflet';

export const boundsToString = (bounds: LatLngBounds): string =>
  `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
