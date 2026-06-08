import { useCollectionQuery } from './useCollectionQuery'

export function useAllCollections() {
  const stops = useCollectionQuery('transit-stops')
  const routes = useCollectionQuery('transit-routes')
  const towers = useCollectionQuery('power-towers')
  const lines = useCollectionQuery('power-lines')
  const subs = useCollectionQuery('substations')
  const landmarks = useCollectionQuery('landmarks')
  const buildings = useCollectionQuery('buildings')

  return { stops, routes, towers, lines, subs, landmarks, buildings }
}