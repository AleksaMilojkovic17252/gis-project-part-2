// hooks/useSpatialQuery.ts
import { useQuery } from '@tanstack/react-query'

import { fetchCollection } from '../lib/api'
import {
  createBufferCircle,
  featuresWithinRadius,
  pointsInPolygons,
} from '../lib/spatial'
import { useMapStore } from '../store/useMapStore'

/**
 * "Nearby stops" — user clicks a point on the map,
 * fetch transit stops in the current view and Turf.js filters
 * for the search radius.
 */
export function useNearbyStopsQuery() {
  const clickPoint = useMapStore((s) => s.clickPoint)
  const radius = useMapStore((s) => s.searchRadius)
  const bbox = useMapStore((s) => s.bbox)
  const queryMode = useMapStore((s) => s.queryMode)
  const setQueryResult = useMapStore((s) => s.setQueryResult)

  return useQuery({
    queryKey: ['nearby-stops', clickPoint, radius, bbox],
    queryFn: async () => {
      if (!clickPoint || !bbox) return null

      const data = await fetchCollection('transit-stops', { bbox, limit: 5000 })
      const nearby = featuresWithinRadius(
        data.features,
        clickPoint,
        radius
      )

      const result = { features: nearby, total: nearby.length }
      setQueryResult(result)

      return {
        ...result,
        buffer: createBufferCircle(clickPoint, radius),
      }
    },
    enabled: queryMode === 'nearby' && !!clickPoint,
  })
}

/**
 * "Filter by type" — fetch only transit stops matching a specific stop_type.
 */
export function useFilterByTypeQuery() {
  const bbox = useMapStore((s) => s.bbox)
  const queryMode = useMapStore((s) => s.queryMode)
  const stopTypeFilter = useMapStore((s) => s.stopTypeFilter)
  const setQueryResult = useMapStore((s) => s.setQueryResult)

  return useQuery({
    queryKey: ['filter-stops', stopTypeFilter, bbox],
    queryFn: async () => {
      if (!bbox) return null

      const data = await fetchCollection('transit-stops', {
        bbox,
        limit: 2000,
        stop_type: stopTypeFilter,
      })

      const result = {
        features: data.features,
        total: data.features.length,
      }
      setQueryResult(result)
      return result
    },
    enabled: queryMode === 'filter' && !!bbox,
  })
}

/**
 * "Points in polygons" — fetch landmarks (points) and buildings (polygons)
 * in the current view, then find which landmarks fall inside a building.
 */
export function usePointsInPolygonsQuery() {
  const bbox = useMapStore((s) => s.bbox)
  const queryMode = useMapStore((s) => s.queryMode)
  const setQueryResult = useMapStore((s) => s.setQueryResult)

  return useQuery({
    queryKey: ['points-in-polygons', bbox],
    queryFn: async () => {
      if (!bbox) return null

      const [landmarksData, buildingsData] = await Promise.all([
        fetchCollection('landmarks', { bbox, limit: 2000 }),
        fetchCollection('buildings', { bbox, limit: 2000 }),
      ])

      const inside = pointsInPolygons(
        landmarksData.features,
        buildingsData.features
      )

      const result = { features: inside, total: inside.length }
      setQueryResult(result)
      return result
    },
    enabled: queryMode === 'points-in-polygons' && !!bbox,
  })
}

/**
 * "Bounding box" — fetch all transit stops.
 */
export function useBboxQuery() {
  const bbox = useMapStore((s) => s.bbox)
  const queryMode = useMapStore((s) => s.queryMode)
  const setQueryResult = useMapStore((s) => s.setQueryResult)

  return useQuery({
    queryKey: ['bbox-stops', bbox],
    queryFn: async () => {
      if (!bbox) return null

      const data = await fetchCollection('transit-stops', {
        bbox,
        limit: 2000,
      })

      const result = {
        features: data.features,
        total: data.features.length,
      }
      setQueryResult(result)
      return result
    },
    enabled: queryMode === 'bbox' && !!bbox,
  })
}