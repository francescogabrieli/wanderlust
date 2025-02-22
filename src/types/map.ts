export interface Coordinates {
    latitude: number;
    longitude: number;
}

export type Offset = [number, number];

export interface StaticMinigameLocation {
    offset: Offset;
    gameId: number;
}

export interface MinigameLocation {
    coordinate: Coordinates;
    gameId: number;
}

export type MinigameMarkerProps = MinigameLocation;

export interface MapConfig {
    INITIAL_PITCH: number;
    INITIAL_ZOOM: number;
    INITIAL_ALTITUDE: number;
    PADDING: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    DELTA: {
        LATITUDE: number;
        LONGITUDE: number;
    };
}