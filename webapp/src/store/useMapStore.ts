import type { Feature } from 'geojson';
import { create } from 'zustand';

import type { CollectionName } from '../types/geojson';

export type QueryMode = 'none' | 'bbox' | 'nearby' | 'filter' | 'points-in-polygons';

export interface QueryResult {
  features: Feature[];
  total: number;
  summary?: { collection: string; count: number }[];
}

interface MapState {
  // Layer visibility
  activeLayers: Record<CollectionName, boolean>;
  toggleLayer: (name: CollectionName) => void;

  // Current map bounds as "west,south,east,north" string
  bbox: string | null;
  setBbox: (bbox: string) => void;

  // Current zoom level
  zoom: number;
  setZoom: (z: number) => void;

  // Spatial query controls
  queryMode: QueryMode;
  setQueryMode: (mode: QueryMode) => void;

  // Click point for "nearby" query — [lng, lat]
  clickPoint: [number, number] | null;
  setClickPoint: (point: [number, number] | null) => void;

  // Radius for nearby query (meters)
  searchRadius: number;
  setSearchRadius: (r: number) => void;

  // Stop type for filter query
  stopTypeFilter: string;
  setStopTypeFilter: (t: string) => void;

  // Query results (displayed as highlighted layer)
  queryResult: QueryResult | null;
  setQueryResult: (result: QueryResult | null) => void;

  // Selected feature (for detailed popup or sidebar display)
  selectedFeature: Feature | null;
  setSelectedFeature: (f: Feature | null) => void;

  // WMS raster layer toggle
  showWMS: boolean;
  toggleWMS: () => void;

  // Clear all query state
  clearQuery: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  activeLayers: {
    'transit-stops': true,
    'transit-routes': true,
    'power-towers': false,
    'power-lines': false,
    substations: true,
    landmarks: true,
    buildings: true
  },
  toggleLayer: (name) =>
    set((state) => ({
      activeLayers: {
        ...state.activeLayers,
        [name]: !state.activeLayers[name]
      }
    })),

  bbox: null,
  setBbox: (bbox) => set({ bbox }),

  zoom: 7,
  setZoom: (z) => set({ zoom: z }),

  queryMode: 'bbox',
  setQueryMode: (mode) => set({ queryMode: mode }),

  clickPoint: null,
  setClickPoint: (point) => set({ clickPoint: point }),

  searchRadius: 500,
  setSearchRadius: (r) => set({ searchRadius: r }),

  stopTypeFilter: 'bus_stop',
  setStopTypeFilter: (t) => set({ stopTypeFilter: t }),

  queryResult: null,
  setQueryResult: (result) => set({ queryResult: result }),

  selectedFeature: null,
  setSelectedFeature: (f) => set({ selectedFeature: f }),

  showWMS: false,
  toggleWMS: () => set((state) => ({ showWMS: !state.showWMS })),

  clearQuery: () =>
    set({
      queryMode: 'bbox',
      clickPoint: null,
      queryResult: null,
      selectedFeature: null
    })
}));
