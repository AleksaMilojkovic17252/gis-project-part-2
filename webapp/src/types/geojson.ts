import { z } from 'zod'

const PointGeometry = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
})

const LineStringGeometry = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(z.tuple([z.number(), z.number()])),
})

const PolygonGeometry = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
})

const MultiPolygonGeometry = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(z.array(z.tuple([z.number(), z.number()])))),
})

const AnyGeometry = z.discriminatedUnion('type', [
  PointGeometry,
  LineStringGeometry,
  PolygonGeometry,
  MultiPolygonGeometry,
])

const FeatureSchema = z.object({
  type: z.literal('Feature'),
  id: z.union([z.string(), z.number()]).optional(),
  geometry: AnyGeometry,
  properties: z.record(z.string(), z.unknown()),
})

export const FeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(FeatureSchema),
  numberReturned: z.number().optional(),
  numberMatched: z.number().optional(),
})

export type CollectionName =
  | 'transit-stops'
  | 'transit-routes'
  | 'power-towers'
  | 'power-lines'
  | 'substations'
  | 'landmarks'
  | 'buildings'

export type Feature = z.infer<typeof FeatureSchema>
export type FeatureCollection = z.infer<typeof FeatureCollectionSchema>