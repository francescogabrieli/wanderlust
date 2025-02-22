export interface ModelDebug {
  loading: boolean;
  progress: number;
  position?: { x: number; z: number };
  scale?: number;
  error?: string;
  tilt?: number;  // Add this to show tilt angle in debug
}