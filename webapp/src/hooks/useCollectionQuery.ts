import { useQuery } from '@tanstack/react-query';

import { fetchCollection } from '../lib/api';
import { useMapStore } from '../store/useMapStore';
import type { CollectionName } from '../types/geojson';

export const useCollectionQuery = (
  collection: CollectionName,
  extraParams: Record<string, string | number> = {}
) => {
  const bbox = useMapStore((s) => s.bbox);
  const zoom = useMapStore((s) => s.zoom);
  const isActive = useMapStore((s) => s.activeLayers[collection]);

  const limit = zoom >= 14 ? 2000 : zoom >= 12 ? 1000 : zoom >= 10 ? 500 : 200;

  return useQuery({
    queryKey: ['collection', collection, bbox, limit, extraParams],
    queryFn: () =>
      fetchCollection(collection, {
        bbox: bbox ?? undefined,
        limit,
        ...extraParams
      }),
    enabled: !!bbox && isActive,
    staleTime: 30_000,
    placeholderData: (prev) => prev
  });
};
