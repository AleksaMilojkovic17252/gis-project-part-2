import * as turf from '@turf/turf';
import type { Feature, Position } from 'geojson';

/**
 * Find all point features within a given radius (meters) of a center point.
 * @param features - Array of GeoJSON features to filter
 * @param center - [lng, lat] coordinate of the search center
 * @param radiusMeters - Search radius in meters
 */
export const featuresWithinRadius = (
  features: Feature[],
  center: [number, number],
  radiusMeters: number
): Feature[] => {
  const point = turf.point(center);

  return features.filter((f) => {
    if (f.geometry.type != 'Point') return false;
    const coords = f.geometry.coordinates;
    const dist = turf.distance(point, turf.point(coords), { units: 'meters' });
    return dist <= radiusMeters;
  });
};

/**
 * Find all point features that fall inside any of the given polygon features.
 */
export const pointsInPolygons = (points: Feature[], polygons: Feature[]): Feature[] => {
  return points.filter((p) => {
    if (p.geometry.type !== 'Point') return false;
    const pt = turf.point(p.geometry.coordinates);

    return polygons.some((poly) => {
      const gType = poly.geometry.type;
      if (gType != 'Polygon' && gType != 'MultiPolygon') return false;
      return turf.booleanPointInPolygon(pt, poly.geometry);
    });
  });
};

/**
 * Create a GeoJSON circle polygon.
 */
export const createBufferCircle = (center: Position, radiusMeters: number): Feature => {
  return turf.circle(center, radiusMeters, {
    units: 'meters',
    steps: 64
  })
}

/**
 * Calculate the distance between two points in meters.
 */
export const distanceMeters = (a: Position, b: Position): number => {
  return turf.distance(turf.point(a), turf.point(b), { units: 'meters' });
}
