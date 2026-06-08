import type React from 'react';

import { Eye, EyeOff, Map as MapIcon } from 'lucide-react';

import { layerMeta } from '../config/styles';
import { useMapStore } from '../store/useMapStore';
import type { CollectionName } from '../types/geojson';

const collectionOrder: CollectionName[] = [
  'transit-stops',
  'transit-routes',
  'power-towers',
  'power-lines',
  'substations',
  'landmarks',
  'buildings'
];

type LayerSymbolProps = { color: string; type: 'point' | 'line' | 'polygon' };

const LayerSymbol = ({ color, type }: LayerSymbolProps) => {
  if (type == 'point')
    return (
      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
    );

  if (type == 'line')
    return <div className="w-4 h-1 rounded flex-shrink-0" style={{ backgroundColor: color }} />;

  return (
    <div
      className="w-4 h-4 rounded-sm flex-shrink-0 border"
      style={{
        backgroundColor: `${color}33`,
        borderColor: color
      }}
    />
  );
};

export const Legend: React.FC = () => {
  const activeLayers = useMapStore((s) => s.activeLayers);
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const showWMS = useMapStore((s) => s.showWMS);
  const toggleWMS = useMapStore((s) => s.toggleWMS);

  return (
    <div className="absolute bottom-8 right-3 z-[1000] bg-white rounded-lg shadow-lg p-3 max-h-[60vh] overflow-y-auto w-52">
      <h4 className="text-sm font-semibold text-slate-700 mb-2 pb-1 border-b border-slate-200">
        Layers
      </h4>

      {collectionOrder.map((name) => {
        const meta = layerMeta[name];
        const active = activeLayers[name];

        return (
          <button
            key={name}
            onClick={() => toggleLayer(name)}
            className={`flex items-center gap-2 w-full py-1.5 px-1 rounded text-left text-xs transition-opacity hover:bg-slate-50 ${
              active ? 'opacity-100' : 'opacity-40'
            }`}>
            <LayerSymbol color={meta.color} type={meta.type} />
            <span className="flex-1 text-slate-700">{meta.label}</span>
            {active ? (
              <Eye className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-300" />
            )}
          </button>
        );
      })}

      <div className="border-t border-slate-200 mt-1 pt-1">
        <button
          onClick={toggleWMS}
          className={`flex items-center gap-2 w-full py-1.5 px-1 rounded text-left text-xs transition-opacity hover:bg-slate-50 ${
            showWMS ? 'opacity-100' : 'opacity-40'
          }`}>
          <MapIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="flex-1 text-slate-700">WMS Basemap</span>
          {showWMS ? (
            <Eye className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-slate-300" />
          )}
        </button>
      </div>
    </div>
  );
};
