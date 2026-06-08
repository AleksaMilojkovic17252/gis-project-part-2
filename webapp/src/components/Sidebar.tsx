import { useMutation } from '@tanstack/react-query';
import { Filter, Layers, MapPin, MousePointerClick, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { fetchCollection } from '../lib/api';
import { featuresWithinRadius, pointsInPolygons } from '../lib/spatial';
import { useMapStore, type QueryMode } from '../store/useMapStore';

export const Sidebar: React.FC = () => {
  const queryMode = useMapStore((s) => s.queryMode);
  const setQueryMode = useMapStore((s) => s.setQueryMode);
  const searchRadius = useMapStore((s) => s.searchRadius);
  const setSearchRadius = useMapStore((s) => s.setSearchRadius);
  const stopTypeFilter = useMapStore((s) => s.stopTypeFilter);
  const setStopTypeFilter = useMapStore((s) => s.setStopTypeFilter);
  const queryResult = useMapStore((s) => s.queryResult);
  const setQueryResult = useMapStore((s) => s.setQueryResult);
  const clearQuery = useMapStore((s) => s.clearQuery);
  const clickPoint = useMapStore((s) => s.clickPoint);

  const queryMutation = useMutation({
    mutationFn: async () => {
      const bbox = useMapStore.getState().bbox;
      if (!bbox) throw new Error('No map bounds available');

      const mode = useMapStore.getState().queryMode;

      if (mode === 'bbox') {
        const collections = [
          'transit-stops',
          'transit-routes',
          'power-towers',
          'power-lines',
          'substations',
          'landmarks',
          'buildings'
        ] as const;

        const results = await Promise.all(
          collections.map(async (c) => {
            const data = await fetchCollection(c, { bbox, limit: 1 });
            return {
              collection: c,
              count: data.numberMatched ?? data.features.length
            };
          })
        );

        return {
          features: [],
          total: results.reduce((sum, r) => sum + r.count, 0),
          summary: results
        };
      }

      if (mode === 'nearby') {
        const clickPt = useMapStore.getState().clickPoint;
        if (!clickPt) throw new Error('Click on the map to set search center');
        const data = await fetchCollection('transit-stops', { bbox, limit: 5000 });
        const nearby = featuresWithinRadius(data.features, clickPt, searchRadius);
        return { features: nearby, total: nearby.length };
      }

      if (mode === 'filter') {
        const data = await fetchCollection('transit-stops', {
          bbox,
          limit: 2000,
          stop_type: stopTypeFilter
        });
        return { features: data.features, total: data.features.length };
      }

      if (mode === 'points-in-polygons') {
        const [landmarksData, buildingsData] = await Promise.all([
          fetchCollection('landmarks', { bbox, limit: 2000 }),
          fetchCollection('buildings', { bbox, limit: 2000 })
        ]);
        const inside = pointsInPolygons(landmarksData.features, buildingsData.features);
        return { features: inside, total: inside.length };
      }

      throw new Error('Unknown query mode');
    },
    onSuccess: (result) => {
      setQueryResult(result);
      if (result.summary) {
        toast.success(`Counted ${result.total} features in view`);
      } else {
        toast.success(`Found ${result.total} features`);
      }
    },
    onError: (err) => {
      toast.error(`Query failed: ${err.message}`);
    }
  });

  return (
    <div className="absolute top-3 left-3 z-[1000] bg-white rounded-lg shadow-lg p-4 w-80 max-h-[90vh] overflow-y-auto">
      <h3 className="text-base font-semibold text-slate-800 mb-3">Spatial Queries</h3>

      {/* Query type selector */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-600 mb-1">Query Type</label>
        <select
          value={queryMode}
          onChange={(e) => setQueryMode(e.target.value as QueryMode)}
          className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          {queryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {queryMode === 'nearby' && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Search Radius (meters)
          </label>
          <input
            type="number"
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            min={50}
            max={10000}
            step={50}
            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!clickPoint && (
            <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
              <MousePointerClick className="w-3 h-3" />
              Click on the map to set search center
            </p>
          )}
        </div>
      )}

      {queryMode === 'filter' && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-600 mb-1">Stop Type</label>
          <select
            value={stopTypeFilter}
            onChange={(e) => setStopTypeFilter(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {stopTypes.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {queryMode === 'points-in-polygons' && (
        <p className="mb-3 text-xs text-slate-500">
          Finds landmark points that fall inside building footprints (churches, museums, etc.) in
          the current map view. Zoom into a city for best results.
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => queryMutation.mutate()}
          disabled={queryMutation.isPending || (queryMode === 'nearby' && !clickPoint)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <Search className="w-4 h-4" />
          {queryMutation.isPending ? 'Loading...' : 'Run Query'}
        </button>

        <button
          onClick={clearQuery}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors">
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>

      {queryResult && queryResult.summary ? (
        <div className="mt-3 text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-700 mb-1">Features in current view:</p>
          {queryResult.summary.map((s) => (
            <div key={s.collection} className="flex justify-between">
              <span>{s.collection}</span>
              <span className="font-semibold text-emerald-600">{s.count}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
            <span className="font-semibold">Total</span>
            <span className="font-semibold text-emerald-600">{queryResult.total}</span>
          </div>
        </div>
      ) : queryResult ? (
        <p className="mt-2 text-xs text-slate-600">
          Found <span className="font-semibold text-emerald-600">{queryResult.total}</span> features
        </p>
      ) : null}
    </div>
  );
};

const queryOptions: { value: QueryMode; label: string; icon: React.ReactNode }[] = [
  { value: 'bbox', label: 'Count all features in view', icon: <Layers className="w-4 h-4" /> },
  { value: 'nearby', label: 'Stops near click point', icon: <MapPin className="w-4 h-4" /> },
  { value: 'filter', label: 'Filter stops by type', icon: <Filter className="w-4 h-4" /> },
  {
    value: 'points-in-polygons',
    label: 'Landmarks inside buildings',
    icon: <Search className="w-4 h-4" />
  }
];

const stopTypes = [
  { value: 'bus_stop', label: 'Bus Stop' },
  { value: 'tram_stop', label: 'Tram Stop' },
  { value: 'station', label: 'Railway Station' },
  { value: 'halt', label: 'Halt' },
  { value: 'stop_position', label: 'Stop Position' }
];
