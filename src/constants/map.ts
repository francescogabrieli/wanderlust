export const MAP_CONFIG = {
  INITIAL_ZOOM: 50 as number,
  INITIAL_PITCH: 90 as number,
  INITIAL_HEADING: 0 as number,
  INITIAL_ALTITUDE: 30 as number,
  DELTA: {
    LATITUDE: 0.01 ,
    LONGITUDE: 0.01 ,
  },
  PADDING: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
} as const;