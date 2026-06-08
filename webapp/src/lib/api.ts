import toast from 'react-hot-toast';

import { PYGEOAPI_URL } from '../config/constants';
import { FeatureCollectionSchema, type FeatureCollection } from '../types/geojson';

interface FetchParams {
  bbox?: string;
  limit?: number;
  offset?: number;
  [key: string]: string | number | undefined;
}

export async function fetchCollection(
  collection: string,
  params: FetchParams = {}
): Promise<FeatureCollection> {
  const searchParams = new URLSearchParams()
  searchParams.set('f', 'json')

  if (!params.limit) params.limit = 1000

  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined) searchParams.set(key, String(val))
  }

  const url = `${PYGEOAPI_URL}/collections/${collection}/items?${searchParams.toString()}`

  const res = await fetch(url)
  if (!res.ok) {
    toast.error(`Failed to fetch ${collection} (HTTP ${res.status})`)
    throw new Error(`Failed to fetch ${collection}: ${res.status}`)
  }

  const json = await res.json()

  const result = FeatureCollectionSchema.safeParse(json)

  if (!result.success) {
    console.error(`Validation failed for ${collection}:`, result.error.issues)
    toast.error(`Invalid data from ${collection}`)
    return { type: 'FeatureCollection', features: [] }
  }

  return result.data
}