import type { Feature, FeatureCollection } from 'geojson';

export const toFeatureCollection = (features: Feature[]): FeatureCollection => {
  return { features: features, type: 'FeatureCollection' };
};
