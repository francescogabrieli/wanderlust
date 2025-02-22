import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { Coordinates } from "@/types/map";

interface UseLocationReturn {
  location: Coordinates | null;
  heading: number;
  speed: number | null;
  accuracy: number | null;
  loading: boolean;
}

export const useLocation = (simulate: boolean = false): UseLocationReturn => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [speed, setSpeed] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let headingSubscription: Location.LocationSubscription;
    let intervalId: NodeJS.Timeout | null = null;

    const requestLocationPermission = async () => {
      try {
        if (!simulate) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission denied", "Location access permission denied.");
            setLoading(false);
            return;
          }

          await Location.enableNetworkProviderAsync();
          // Avvia l'ascolto della posizione reale
          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.BestForNavigation, // Precisione elevata
              timeInterval: 1000, // Aggiorna ogni 1 secondo
              distanceInterval: 1, // Aggiorna ogni metro
            },
            (currentLocation) => {
              setLocation({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
              });
              setHeading(currentLocation.coords.heading || 0);
              setSpeed(currentLocation.coords.speed);
              setAccuracy(currentLocation.coords.accuracy);
            }
          );
          // Start watching heading specifically
          headingSubscription = await Location.watchHeadingAsync((headingData) => {
            setHeading(headingData.trueHeading || headingData.magHeading || 0);
          });



        } else {
          // Ottieni la posizione attuale come punto di partenza per la simulazione
          const currentPosition = await Location.getCurrentPositionAsync({});
          const initialLocation = {
            latitude: currentPosition.coords.latitude,
            longitude: currentPosition.coords.longitude,
          };

          setLocation(initialLocation); // Imposta la posizione iniziale

          // Simula il movimento partendo dalla posizione attuale
          intervalId = setInterval(() => {
            setLocation((prevLocation) => {
              if (!prevLocation) return initialLocation;
              return {
                latitude: prevLocation.latitude + 0.0001, // Movimento verso nord
                longitude: prevLocation.longitude + 0.0001, // Movimento verso est
              };
            });
          }, 3000); // Cambia posizione ogni 3 secondi
        }
      } catch (error) {
        Alert.alert("Error", "Unable to get location updates.");
      } finally {
        setLoading(false);
      }
    };

    requestLocationPermission();

    // Cleanup per interrompere l'ascolto quando il componente viene smontato
    return () => {
      locationSubscription?.remove();
      headingSubscription?.remove();
      if (intervalId) clearInterval(intervalId);
    };
  }, [simulate]);

return { location, heading, speed, accuracy, loading };
};