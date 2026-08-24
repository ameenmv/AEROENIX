import type MapboxDraw from '@mapbox/mapbox-gl-draw'
// @ts-expect-error - mapboxgl is used in type definitions below
import type mapboxgl from 'mapbox-gl'
import type { Ref } from 'vue'
// Re-export for use in other modules
export type { default as MapboxGL } from 'mapbox-gl'
export interface MapboxConfig {
  accessToken: string
  style?: string
  center?: [number, number]
  zoom?: number
  pitch?: number
  bearing?: number
}
export interface MapboxComposable {
  map: Ref<mapboxgl.Map | null>
  draw: Ref<MapboxDraw | null>
  isMapLoaded: Ref<boolean>
  isLoading: Ref<boolean>
  isFullscreen: Ref<boolean>
  initMap: (container: HTMLElement, config: MapboxConfig) => Promise<void>
  initDraw: (options?: any) => void
  addMarker: (lngLat: [number, number], element?: HTMLElement) => mapboxgl.Marker | undefined
  clearMarkers: (markersMap: Map<any, mapboxgl.Marker>) => void
  addLayer: (layer: mapboxgl.AnyLayer) => void
  addSource: (sourceId: string, source: mapboxgl.AnySourceData) => void
  getSource: (sourceId: string) => mapboxgl.AnySourceImpl | undefined
  updateSourceData: (sourceId: string, data: GeoJSON.FeatureCollection) => void
  fitBounds: (bounds: mapboxgl.LngLatBoundsLike, options?: mapboxgl.FitBoundsOptions) => void
  fitToFeatureCollection: (
    data: GeoJSON.FeatureCollection,
    options?: mapboxgl.FitBoundsOptions,
  ) => void
  addControl: (
    control: mapboxgl.IControl,
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  ) => void
  removeLayer: (layerId: string) => void
  removeSource: (sourceId: string) => void
  getBounds: () => mapboxgl.LngLatBounds | undefined
  getCenter: () => mapboxgl.LngLat | undefined
  setStyle: (style: string) => void
  setPitch: (pitch: number) => void
  setBearing: (bearing: number) => void
  toggleFullscreen: (container?: any) => void
  takeSnapshot: () => string | null
  flyTo: (options: any) => void
  destroy: () => void
}
