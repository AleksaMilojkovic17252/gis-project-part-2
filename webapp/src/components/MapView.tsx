import { createRoot } from 'react-dom/client';

import type { Feature } from 'geojson';
import L from 'leaflet';
import { Circle, GeoJSON, MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../config/constants';
import { layerStyles } from '../config/styles';
import { useAllCollections } from '../hooks/useAllCollections';
import { useMapStore } from '../store/useMapStore';
import type { CollectionName } from '../types/geojson';
import { toFeatureCollection } from '../utils/toFeatureCollection';
import { FeaturePopup } from './FeaturePopup';
import { WMSLayer } from './WMSLayer';

export const MapView: React.FC = () => {
  const { stops, routes, towers, lines, subs, landmarks, buildings } = useAllCollections();

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      />

      <WMSLayer />

      <MapEventHandler />

      <FeatureLayer data={buildings.data?.features} collection="buildings" />
      <FeatureLayer data={subs.data?.features} collection="substations" />
      <FeatureLayer data={routes.data?.features} collection="transit-routes" />
      <FeatureLayer data={lines.data?.features} collection="power-lines" />
      <FeatureLayer data={stops.data?.features} collection="transit-stops" />
      <FeatureLayer data={towers.data?.features} collection="power-towers" />
      <FeatureLayer data={landmarks.data?.features} collection="landmarks" />

      <QueryResultLayer />
      <NearbyQueryVisuals />
    </MapContainer>
  );
};

const MapEventHandler = () => {
  const setBbox = useMapStore((s) => s.setBbox);
  const setZoom = useMapStore((s) => s.setZoom);
  const queryMode = useMapStore((s) => s.queryMode);
  const setClickPoint = useMapStore((s) => s.setClickPoint);

  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const bounds = map.getBounds();
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      setBbox(bbox);
      setZoom(map.getZoom());
    },
    click: (e) => {
      if (queryMode === 'nearby') {
        setClickPoint([e.latlng.lng, e.latlng.lat]);
      }
    }
  });

  return null;
};

const FeatureLayer: React.FC<{
  data: Feature[] | undefined;
  collection: CollectionName;
}> = ({ data, collection }) => {
  const isActive = useMapStore((s) => s.activeLayers[collection]);
  const setSelectedFeature = useMapStore((s) => s.setSelectedFeature);

  if (!isActive || !data || data.length === 0) return null;

  const style = layerStyles[collection];

  return (
    <GeoJSON
      key={`${collection}-${data.length}-${data[0]?.id}`}
      data={toFeatureCollection(data)}
      pointToLayer={(_feature, latlng) => {
        if (style.point) {
          return L.circleMarker(latlng, style.point);
        }
        return L.marker(latlng);
      }}
      style={() => style.path ?? {}}
      onEachFeature={(feature, layer) => {
        // Create a DOM container for the React popup
        const container = document.createElement('div');
        layer.bindPopup(container, { minWidth: 500 });

        layer.on('popupopen', () => {
          const root = createRoot(container);
          root.render(<FeaturePopup properties={feature.properties} layerName={collection} />);
        });

        layer.on('click', () => {
          setSelectedFeature(feature);
        });
      }}
    />
  );
};

const QueryResultLayer: React.FC = () => {
  const queryResult = useMapStore((s) => s.queryResult);

  if (!queryResult || queryResult.features.length === 0) return null;

  const style = layerStyles.queryResult;

  return (
    <GeoJSON
      key={`query-${queryResult.total}-${Date.now()}`}
      data={toFeatureCollection(queryResult.features)}
      pointToLayer={(_feature, latlng) => {
        return L.circleMarker(latlng, style.point ?? { radius: 7 });
      }}
      style={() => style.path ?? {}}
      onEachFeature={(feature, layer) => {
        const container = document.createElement('div');
        layer.bindPopup(container, { minWidth: 500 });

        layer.on('popupopen', () => {
          const root = createRoot(container);
          root.render(<FeaturePopup properties={feature.properties} layerName="Query Result" />);
        });
      }}
    />
  );
};

const NearbyQueryVisuals: React.FC = () => {
  const clickPoint = useMapStore((s) => s.clickPoint);
  const searchRadius = useMapStore((s) => s.searchRadius);
  const queryMode = useMapStore((s) => s.queryMode);

  if (queryMode !== 'nearby' || !clickPoint) return null;

  const position: [number, number] = [clickPoint[1], clickPoint[0]];

  return (
    <>
      <Marker position={position} />
      <Circle
        center={position}
        radius={searchRadius}
        pathOptions={{
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '5,5'
        }}
      />
    </>
  );
};
