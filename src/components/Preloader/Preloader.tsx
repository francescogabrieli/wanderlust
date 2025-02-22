import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, InteractionManager } from 'react-native';
import { normalize, wp, hp } from "@/utils/dimensions";

interface PreloaderProps {
  progress: number;
  onLoadComplete?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ progress, onLoadComplete }) => {
  useEffect(() => {
    // Ensure UI thread priority
    InteractionManager.runAfterInteractions(() => {
      if (progress >= 1 && onLoadComplete) {
        onLoadComplete();
      }
    });
  }, [progress, onLoadComplete]);

  // Add console log for debugging
  useEffect(() => {
    console.log('Preloader Progress:', progress);
  }, [progress]);

  return (
    <View style={styles.preloaderOverlay}>
      <Text style={styles.preloaderTitle}>Wanderlust</Text>
      {/* ActivityIndicator already runs on UI thread */}
      <ActivityIndicator 
        size="large" 
        color="#FFFFFF" 
        style={styles.preloaderSpinner}
        renderToHardwareTextureAndroid // Optimization for Android
      />
      <Text style={styles.preloaderText}>Waking up the digital world...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  preloaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999, // Increased zIndex to be above all other elements
    elevation: 1000, // High elevation for Android
  },
  preloaderTitle: {
    color: '#FFFFFF',
    fontSize: normalize(32),
    fontWeight: 'bold',
    marginBottom: hp(5),
  },
  preloaderSpinner: {
    transform: [{ scale: 1.5 }],
    marginBottom: hp(3),
  },
  preloaderText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: '600',
    marginBottom: hp(2),
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: normalize(20),
    fontWeight: 'bold',
  },
});

export default Preloader;
