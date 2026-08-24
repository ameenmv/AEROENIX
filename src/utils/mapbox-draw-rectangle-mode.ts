interface DrawRectangleModeState {
  rectangle?: any
  startPoint?: [number, number]
  endPoint?: [number, number]
}
interface DrawRectangleModeThis {
  newFeature: (geojson: any) => any
  addFeature: (feature: any) => void
  clearSelectedFeatures: () => void
  updateUIClasses: (options: object) => void
  setActionableState: (options: object) => void
  activateUIButton: () => void
  getFeature: (id: string) => any
  deleteFeature: (ids: string[], options?: object) => void
  changeMode: (mode: string, options?: object, eventOptions?: object) => void
  map: any
  _doubleClickZoom: {
    enable: (ctx: any) => void
    disable: (ctx: any) => void
  }
  [key: string]: any
}
const DrawRectangleMode: any = {
  _doubleClickZoom: {
    enable(ctx: any) {
      setTimeout(() => {
        if (
          !ctx.map
          || !ctx.map.doubleClickZoom
          || !ctx._ctx
          || !ctx._ctx.store
          || !ctx._ctx.store.getInitialConfigValue
        ) {
          return
        }
        if (!ctx._ctx.store.getInitialConfigValue('doubleClickZoom'))
          return
        ctx.map.doubleClickZoom.enable()
      }, 0)
    },
    disable(ctx: any) {
      setTimeout(() => {
        if (!ctx.map || !ctx.map.doubleClickZoom)
          return
        ctx.map.doubleClickZoom.disable()
      }, 0)
    },
  },
  onSetup(this: DrawRectangleModeThis) {
    const rectangle = this.newFeature({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[]],
      },
    })
    this.addFeature(rectangle)
    this.clearSelectedFeatures()
    DrawRectangleMode._doubleClickZoom.disable(this)
    this.updateUIClasses({ mouse: 'add' })
    this.setActionableState({ trash: true })
    return { rectangle }
  },
  onTap(this: DrawRectangleModeThis, state: DrawRectangleModeState, e: any) {
    if (state.startPoint)
      this.onMouseMove(state, e)
    this.onClick(state, e)
  },
  onClick(this: DrawRectangleModeThis, state: DrawRectangleModeState, e: any) {
    if (
      state.startPoint
      && state.rectangle
      && (state.startPoint[0] !== e.lngLat.lng || state.startPoint[1] !== e.lngLat.lat)
    ) {
      this.updateUIClasses({ mouse: 'pointer' })
      state.endPoint = [e.lngLat.lng, e.lngLat.lat]
      this.changeMode('simple_select', { featuresId: state.rectangle.id })
      return
    }
    state.startPoint = [e.lngLat.lng, e.lngLat.lat]
  },
  onMouseMove(this: DrawRectangleModeThis, state: DrawRectangleModeState, e: any) {
    if (state.startPoint && state.rectangle) {
      state.rectangle.updateCoordinate('0.0', state.startPoint[0], state.startPoint[1])
      state.rectangle.updateCoordinate('0.1', e.lngLat.lng, state.startPoint[1])
      state.rectangle.updateCoordinate('0.2', e.lngLat.lng, e.lngLat.lat)
      state.rectangle.updateCoordinate('0.3', state.startPoint[0], e.lngLat.lat)
      state.rectangle.updateCoordinate('0.4', state.startPoint[0], state.startPoint[1])
    }
  },
  onKeyUp(this: DrawRectangleModeThis, _state: DrawRectangleModeState, e: any) {
    if (e.keyCode === 27)
      return this.changeMode('simple_select')
  },
  onStop(this: DrawRectangleModeThis, state: DrawRectangleModeState) {
    DrawRectangleMode._doubleClickZoom.enable(this)
    this.updateUIClasses({ mouse: 'none' })
    this.activateUIButton()
    if (!state.rectangle || this.getFeature(state.rectangle.id) === undefined)
      return
    state.rectangle.removeCoordinate('0.4')
    if (state.rectangle.isValid()) {
      this.map.fire('draw.create', {
        features: [state.rectangle.toGeoJSON()],
      })
    }
    else {
      this.deleteFeature([state.rectangle.id], { silent: true })
      this.changeMode('simple_select', {}, { silent: true })
    }
  },
  toDisplayFeatures(
    this: DrawRectangleModeThis,
    state: DrawRectangleModeState,
    geojson: any,
    display: any,
  ) {
    if (!state.rectangle)
      return
    const isActivePolygon = geojson.properties.id === state.rectangle.id
    geojson.properties.active = isActivePolygon ? 'true' : 'false'
    if (!isActivePolygon)
      return display(geojson)
    if (!state.startPoint)
      return
    return display(geojson)
  },
  onTrash(this: DrawRectangleModeThis, state: DrawRectangleModeState) {
    if (state.rectangle) {
      this.deleteFeature([state.rectangle.id], { silent: true })
    }
    this.changeMode('simple_select')
  },
}
export default DrawRectangleMode
