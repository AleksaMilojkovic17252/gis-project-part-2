import type { CircleMarkerOptions, PathOptions } from 'leaflet';

import type { CollectionName } from '../types/geojson';

export const layerStyles: Record<CollectionName | 'queryResult', LayerStyle> = {
  'transit-stops': {
    point: {
      radius: 5,
      fillColor: '#2563eb',
      color: '#1e40af',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }
  },
  'transit-routes': {
    path: {
      color: '#dc2626',
      weight: 3,
      opacity: 0.8
    }
  },
  'power-towers': {
    point: {
      radius: 4,
      fillColor: '#6b7280',
      color: '#374151',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.7
    }
  },
  'power-lines': {
    path: {
      color: '#f59e0b',
      weight: 2,
      opacity: 0.7
    }
  },
  substations: {
    path: {
      fillColor: '#8b5cf6',
      color: '#7c3aed',
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.3,
      dashArray: '5,5'
    }
  },
  landmarks: {
    point: {
      radius: 6,
      fillColor: '#eab308',
      color: '#a16207',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.9
    }
  },
  buildings: {
    path: {
      fillColor: '#6b7280',
      color: '#6b7280',
      weight: 1,
      opacity: 0.6,
      fillOpacity: 0.3
    }
  },
  queryResult: {
    point: {
      radius: 7,
      fillColor: '#10b981',
      color: '#047857',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    },
    path: {
      fillColor: '#10b981',
      color: '#047857',
      weight: 3,
      opacity: 0.9,
      fillOpacity: 0.2
    }
  }
};

export const layerMeta: Record<
  CollectionName,
  { label: string; color: string; type: 'point' | 'line' | 'polygon' }
> = {
  'transit-stops': { label: 'Transit Stops', color: '#2563eb', type: 'point' },
  'transit-routes': { label: 'Transit Routes', color: '#dc2626', type: 'line' },
  'power-towers': { label: 'Power Towers', color: '#6b7280', type: 'point' },
  'power-lines': { label: 'Power Lines', color: '#f59e0b', type: 'line' },
  substations: { label: 'Substations', color: '#8b5cf6', type: 'polygon' },
  landmarks: { label: 'Landmarks', color: '#eab308', type: 'point' },
  buildings: { label: 'Buildings', color: '#6b7280', type: 'polygon' }
};

interface LayerStyle {
  point?: CircleMarkerOptions;
  path?: PathOptions;
}
