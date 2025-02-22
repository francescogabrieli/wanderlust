import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions that we use for design (you can adjust these based on your design)
const baseWidth = 375;
const baseHeight = 812;

const widthScale = SCREEN_WIDTH / baseWidth;
const heightScale = SCREEN_HEIGHT / baseHeight;

export const normalize = (size: number) => {
  const newSize = size * widthScale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

export const wp = (percentage: number) => {
  return (SCREEN_WIDTH * percentage) / 100;
};

export const hp = (percentage: number) => {
  return (SCREEN_HEIGHT * percentage) / 100;
};
