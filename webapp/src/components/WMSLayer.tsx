import { WMSTileLayer } from 'react-leaflet';

import { useMapStore } from '../store/useMapStore';

export const WMSLayer: React.FC = () => {
  const showWMS = useMapStore((s) => s.showWMS);

  if (!showWMS) return null;

  return (
    <WMSTileLayer
      url="https://ows.terrestris.de/osm/service"
      params={{
        layers: 'OSM-WMS',
        format: 'image/png',
        transparent: true
      }}
      attribution="&copy; terrestris / OSM"
    />
  );
}
