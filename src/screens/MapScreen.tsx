import Map from "@components/Map/Map";
import DebugOverlay, {
  styles as debugstyle,
} from "@components/Debug/DebugOverlay";
import MinigameMarker from "@components/Minigame/MinigameMarker";
import { useLocation } from "@hooks/useLocation";
import { globalStyles } from "@styles/globalStyles";
import { Coordinates, StaticMinigameLocation } from "@/types/map";
import { Player3D } from "@components/Player3D/Player3DOverlay";
import MapView, { Region } from "react-native-maps";
import { ModelDebug } from "@/types/debug";
import { useSmoothHeading } from "@/hooks/useSmoothHeading";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
const { height: deviceHeight, width: deviceWidth } = Dimensions.get("screen");
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Image,
  Alert,
  Easing,
  ActivityIndicator,
} from "react-native";
import { generateDynamicGameSessions } from "@/constants/data";
import GameSessionPopup from "../components/GameSessionPopup";
import LandmarkPopup from "../components/LandmarkPopup";
import AddLandmarkPopup from "@/components/AddLandmarkPopup";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { GameSession } from "@/models/GameSession";
import { Landmark } from "@/models/Landmark";
import { Experience } from "../models/Experience";
import { loadExperience, saveExperience } from "../utils/experienceStorage";
import Modal from "react-native-modal";
import { assets } from "@/constants/assets";
import { SvgXml } from "react-native-svg";
import { normalize, wp, hp } from "../utils/dimensions";
import SelectGameSessionPopup from "@/components/SelectGameSessionPopup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Preloader from "@/components/Preloader/Preloader";
const sonarIcon = `<?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 117.79" style="enable-background:new 0 0 122.88 117.79" xml:space="preserve"><g><path d="M58.9,0c12.68,0,24.43,4.01,34.04,10.83l-3.74,3.95C80.58,8.85,70.14,5.38,58.9,5.38c-14.78,0-28.16,5.99-37.84,15.67 C11.37,30.74,5.38,44.12,5.38,58.9c0,14.78,5.99,28.16,15.67,37.84c9.68,9.68,23.06,15.67,37.84,15.67 c14.78,0,28.16-5.99,37.84-15.67c6.56-6.56,11.42-14.82,13.88-24.05c-2.44-1.41-4.08-4.05-4.08-7.08c0-3.71,2.48-6.85,5.87-7.84 c-0.24-11.63-4.19-22.34-10.72-31.01l3.75-3.96c7.58,9.76,12.16,21.97,12.35,35.24c2.99,1.22,5.09,4.15,5.09,7.57 c0,4.1-3.02,7.5-6.96,8.08c-2.67,10.32-8.07,19.55-15.38,26.86c-10.66,10.66-25.38,17.25-41.65,17.25 c-16.26,0-30.99-6.59-41.65-17.25C6.59,89.89,0,75.16,0,58.9c0-16.26,6.59-30.99,17.25-41.65C27.91,6.59,42.63,0,58.9,0L58.9,0z M58.9,48.6c1.77,0,3.44,0.45,4.9,1.24c0.07-0.1,0.15-0.19,0.23-0.27l33.74-35.49c1.02-1.07,2.72-1.12,3.79-0.09 c1.07,1.02,1.12,2.72,0.09,3.79L67.92,53.26c-0.08,0.08-0.16,0.16-0.25,0.23c0.97,1.57,1.53,3.42,1.53,5.4 c0,5.69-4.61,10.3-10.3,10.3c-5.69,0-10.3-4.61-10.3-10.3C48.6,53.21,53.21,48.6,58.9,48.6L58.9,48.6z M62.47,90.92 c3.02,0,5.66,1.64,7.08,4.08c6.11-1.8,11.57-5.11,15.96-9.49c6.81-6.81,11.02-16.22,11.02-26.61c0-7.51-2.2-14.51-5.99-20.38 l3.84-4.05c4.79,6.94,7.6,15.36,7.6,24.43c0,11.89-4.82,22.66-12.62,30.46c-5.15,5.15-11.6,9-18.81,11.02 c-0.62,3.9-3.99,6.89-8.07,6.89c-3.58,0-6.61-2.3-7.72-5.49c-10.24-0.98-19.43-5.54-26.31-12.42 c-7.79-7.79-12.62-18.56-12.62-30.46c0-9.77,3.25-18.77,8.73-26c-0.48-1.04-0.74-2.19-0.74-3.41c0-4.51,3.66-8.17,8.17-8.17 c1.47,0,2.86,0.39,4.05,1.07c6.63-4.16,14.46-6.56,22.86-6.56c8.46,0,16.34,2.44,23,6.65l-3.83,4.04 c-5.61-3.33-12.17-5.24-19.17-5.24c-7.04,0-13.64,1.94-19.28,5.3c0.35,0.91,0.54,1.89,0.54,2.92c0,4.51-3.66,8.17-8.17,8.17 c-1.28,0-2.5-0.3-3.58-0.82c-4.49,6.2-7.14,13.82-7.14,22.06c0,10.39,4.21,19.8,11.02,26.61c5.9,5.9,13.75,9.85,22.5,10.8 C55.93,93.16,58.94,90.92,62.47,90.92L62.47,90.92z M58.9,31.58c4.23,0,8.24,0.96,11.82,2.68l-3.63,3.83 c-0.12,0.12-0.23,0.25-0.34,0.38c-2.44-0.94-5.08-1.45-7.85-1.45c-6.04,0-11.51,2.45-15.47,6.41c-3.96,3.96-6.41,9.43-6.41,15.47 c0,6.04,2.45,11.51,6.41,15.47c3.96,3.96,9.43,6.41,15.47,6.41c6.04,0,11.51-2.45,15.47-6.41c3.96-3.96,6.41-9.43,6.41-15.47 c0-2.97-0.59-5.79-1.66-8.37c0.18-0.16,0.35-0.32,0.52-0.5l3.52-3.71c1.96,3.77,3.07,8.05,3.07,12.58c0,7.54-3.06,14.37-8,19.31 c-4.94,4.94-11.77,8-19.31,8c-7.54,0-14.37-3.06-19.31-8c-4.94-4.94-8-11.77-8-19.31c0-7.54,3.06-14.37,8-19.31 C44.53,34.64,51.35,31.58,58.9,31.58L58.9,31.58z"/></g></svg>`;

const MINIGAME_LOCATIONS: StaticMinigameLocation[] = [
  { offset: [0.0002, 0.0001], gameId: 1 },
  { offset: [0.0001, -0.0002], gameId: 2 },
  { offset: [-0.0001, 0.0002], gameId: 3 },
];

const MapScreen: React.FC = () => {
  // State declarations
  const [acceptedGameSessions, setAcceptedGameSessions] = useState<
    GameSession[]
  >([]);
  const [isGameSessionPopupVisible, setGameSessionPopupVisible] =
    useState(false);
  const [showGameSessionAddedMessage, setShowGameSessionAddedMessage] =
    useState(false);
  const [selectedLandmarks, setSelectedLandmarks] = useState<Landmark[]>([]);
  const [isLandmarkPopupVisible, setLandmarkPopupVisible] = useState(false);
  const [selectedGameSessionName, setSelectedGameSessionName] =
    useState<string>("");
  const [selectedExtraChallenge, setSelectedExtraChallenge] =
    useState<number>(0);
  const [selectedGameSessionId, setSelectedGameSessionId] =
    useState<string>("");
  const [landmarksFoundStatus, setLandmarksFoundStatus] = useState<{
    [key: string]: boolean[];
  }>({}); // Stato per i landmark trovati
  const [selectedUniqueLandmark, setSelectedUniqueLandmark] =
    useState<Landmark | null>(null);
  const [flagPopupOpen, setFlagPopupOpen] = useState(false);
  const [experience, setExperience] = useState<Experience>(new Experience());
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [isLevelUpVisible, setIsLevelUpVisible] = useState(false);
  const [newLevelReached, setNewLevelReached] = useState(0);
  const [showSonarMessage, setShowSonarMessage] = useState(false);
  const [dots, setDots] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSonarButtonDisabled, setIsSonarButtonDisabled] = useState(false);
  const [isGameSession3Visible, setIsGameSession3Visible] = useState(false);
  const [hasFoundInitialSession, setHasFoundInitialSession] = useState(false);
  const [showNoSessionFound, setShowNoSessionFound] = useState(false);
  const [isSelectPopupVisible, setSelectPopupVisible] = useState(false);
  const [selectedGameSession, setSelectedGameSession] =
    useState<GameSession | null>(null);
  const [currentLandmarkIndexes, setCurrentLandmarkIndexes] = useState<{
    [key: string]: number;
  }>({});
  const [isAddPopupVisible, setAddPopupVisible] = useState(false);
  const [customLandmarks, setCustomLandmarks] = useState<Landmark[]>([]);
  const [completedGameSessions, setCompletedGameSessions] = useState<
    GameSession[]
  >([]);

  const [disabledGameSessions, setDisabledGameSessions] = useState<Set<string>>(
    new Set()
  );
  const [dynamicGameSessions, setDynamicGameSessions] = useState<GameSession[]>(
    []
  ); // Stato per le GameSession
  const [dynamicLandmarks, setDynamicLandmarks] = useState<Landmark[]>([]); // Stato Landmark generati dinamicamente
  const [userLocation, setUserLocation] = useState({
    latitude: 0,
    longitude: 0,
  }); // Stato per il marker dell'utente
  const [showLandmarkAddedMessage, setShowLandmarkAddedMessage] =
    useState(false);

  const [showDiscoveryMessage, setShowDiscoveryMessage] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);

  const [lastPopupOpenedState, setLastPopupOpenedState] = useState<{
    [key: string]: string | null;
  }>({});
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);

  // Refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const {
    location: rawLocation,
    heading: rawHeading,
    speed,
    accuracy,
    loading,
  } = useLocation();

  // Create a safe location object that falls back to default values
  const location = rawLocation;

  useEffect(() => {
    if (location) {
      //console.log("User location updated:", location);
      setUserLocation(location);
    }
  }, [location]);

  // Genera GameSession dinamiche quando la posizione è disponibile
  useEffect(() => {
    if (!loading && location && dynamicGameSessions.length === 0) {
      const { gameSessions, landmarks } = generateDynamicGameSessions(location);
      setDynamicGameSessions(gameSessions);
      setDynamicLandmarks(landmarks);
    }
  }, [loading, location]);

  // Add these new state declarations after other state declarations
  const [mapTarget, setMapTarget] = useState<Coordinates | null>(null);

  // Add gameSession3 coordinates object (put this after state declarations)
  const gameSession3 = dynamicGameSessions.find(
    (session) => session.id === "3"
  ) || {
    latitude: location?.latitude || 0,
    longitude: location?.longitude || 0,
  };

  const smoothHeading = useSmoothHeading(rawHeading);
  const [showDebug, setShowDebug] = useState(true);
  const [modelDebug, setModelDebug] = useState<ModelDebug>({
    loading: false,
    progress: 0,
  });

  const [region, setRegion] = useState<Region | null>(null);
  const mapRef = useRef<MapView>(null);

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
    // console.debug("[Map] Region changed:", newRegion);
  };

  // Add this new animation function
  const startSpinAnimation = () => {
    // First, stop any existing animation
    if (spinAnimation.current) {
      spinAnimation.current.stop();
    }

    // Reset the spin value
    spinValue.setValue(0);

    // Create and store the new animation
    spinAnimation.current = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );

    // Start the new animation
    spinAnimation.current.start();
  };

  // Modify animation effect
  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation;

    if (acceptedGameSessions.length > 0) {
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);

      animationLoop = Animated.loop(pulse);
      animationLoop.start();
    } else {
      // Reset animation when there are no game sessions
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [acceptedGameSessions.length]);

  //info button press
  const toggleInfoModal = () => {
    setInfoModalVisible(!isInfoModalVisible);
  };

  // Salva lo stato in AsyncStorage
  const saveGameState = async () => {
    try {
      const state = {
        acceptedGameSessions,
        completedGameSessions,
        currentLandmarkIndexes,
        landmarksFoundStatus,
      };
      await AsyncStorage.setItem("gameState", JSON.stringify(state));
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  };

  // Carica lo stato da AsyncStorage
  const loadGameState = async () => {
    try {
      const savedState = await AsyncStorage.getItem("gameState");
      if (savedState) {
        const {
          acceptedGameSessions,
          completedGameSessions,
          currentLandmarkIndexes,
          landmarksFoundStatus,
        } = JSON.parse(savedState);
        setAcceptedGameSessions(acceptedGameSessions || []);
        setCompletedGameSessions(completedGameSessions || []);
        setCurrentLandmarkIndexes(currentLandmarkIndexes || {});
        setLandmarksFoundStatus(landmarksFoundStatus || {});
      }
    } catch (error) {
      console.error("Error loading game state:", error);
    }
  };

  // Load saved experience when component mounts
  useEffect(() => {
    const loadSavedExperience = async () => {
      const savedExperience = await loadExperience();
      setExperience(savedExperience);
    };
    loadSavedExperience();
  }, []);

  useEffect(() => {
    loadGameState();
  }, []);

  useEffect(() => {
    saveGameState();
  }, [acceptedGameSessions, currentLandmarkIndexes, landmarksFoundStatus]);

  const handleMarkerPress = (gameSession: GameSession) => {
    if (disabledGameSessions.has(gameSession.id)) {
      return; // Non fare nulla se la sessione è disabilitata
    }

    setSelectedGameSession(gameSession);
    setSelectPopupVisible(true);
  };

  const handleAddGameSession = async () => {
    if (selectedGameSession) {
      // Aggiungi la Game Session alla lista delle accettate
      setAcceptedGameSessions((prev) => [...prev, selectedGameSession]);

      // Aggiungi l'ID della sessione disabilitata
      setDisabledGameSessions((prev) => {
        const updatedSet = new Set(prev).add(selectedGameSession.id);

        // Salva lo stato aggiornato in AsyncStorage
        AsyncStorage.setItem(
          "disabledGameSessions",
          JSON.stringify(Array.from(updatedSet))
        );

        return updatedSet;
      });

      // Chiudi il popup di selezione
      setSelectPopupVisible(false);

      // Mostra il messaggio di conferma
      setTimeout(() => {
        setShowGameSessionAddedMessage(true);
        setTimeout(() => setShowGameSessionAddedMessage(false), 5000); // Nasconde dopo 5 secondi
      }, 500);
    }
  };

  //animazione punti esclamativi
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    // Reset animation value
    fadeAnim.setValue(1);

    let animationLoop: Animated.CompositeAnimation;

    if (acceptedGameSessions.length > 0 && !flagPopupOpen) {
      const fadeIn = Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      });

      const fadeOut = Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 1000,
        useNativeDriver: true,
      });

      animationLoop = Animated.loop(Animated.sequence([fadeOut, fadeIn]));

      animationLoop.start();
    }

    // Cleanup on unmount or when acceptedGameSessions changes
    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [fadeAnim, acceptedGameSessions, flagPopupOpen]);

  // Gestisce il clic sulla bandierina
  const handleFlagPress = () => {
    //if (acceptedGameSessions.length > 0) {
    setFlagPopupOpen(true);
    setGameSessionPopupVisible(true);
    //}
  };

  // Chiude il popup GameSession
  const closeGameSessionPopup = () => {
    setGameSessionPopupVisible(false);
    setFlagPopupOpen(false);
  };

  const resetGameSessionTimer = async (gameSessionId: string) => {
    await AsyncStorage.removeItem(`gameSessionTimer_${gameSessionId}`);
  };

  // Gestisce la rimozione di una GameSession
  const handleRemoveGameSession = async (gameSession: GameSession) => {
    await resetGameSessionTimer(gameSession.id);

    setAcceptedGameSessions((prevSessions) =>
      prevSessions.filter((session) => session.id !== gameSession.id)
    );

    setCurrentLandmarkIndexes((prev) => {
      const { [gameSession.id]: _, ...remaining } = prev;
      return remaining;
    });

    setLandmarksFoundStatus((prev) => {
      const { [gameSession.id]: _, ...remaining } = prev;
      return remaining;
    });

    // Riabilita il marker nella mappa
    setDisabledGameSessions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(gameSession.id);
      return newSet;
    });

    // 🔹 RESETTA `lastPopupOpenedState` per forzare LandmarkPopup alla riapertura
    setLastPopupOpenedState((prev) => ({
      ...prev,
      [gameSession.id]: null, // Imposta a null per LandmarkPopup di default
    }));

    // Salva lo stato aggiornato
    saveGameState();
  };

  //  Salva l'ultimo popup aperto per una game session
  const saveLastPopupState = async (
    gameSessionId: string,
    popupName: string | null
  ) => {
    try {
      const lastPopupState = await AsyncStorage.getItem("lastPopupState");
      const updatedState = lastPopupState ? JSON.parse(lastPopupState) : {};
      updatedState[gameSessionId] = popupName;
      await AsyncStorage.setItem(
        "lastPopupState",
        JSON.stringify(updatedState)
      );
    } catch (error) {
      console.error("Error saving last popup state:", error);
    }
  };

  //  Carica lo stato dell'ultimo popup salvato
  const loadLastPopupState = async () => {
    try {
      const lastPopupState = await AsyncStorage.getItem("lastPopupState");
      if (lastPopupState) {
        setLastPopupOpenedState(JSON.parse(lastPopupState));
      }
    } catch (error) {
      console.error("Error loading last popup state:", error);
    }
  };

  // Eseguiamo il caricamento dello stato all'avvio dell'app
  useEffect(() => {
    loadLastPopupState();
  }, []);

  // Gestisce il clic su una Game Session nel popup
  const handleGameSessionClick = (gameSession: GameSession) => {
    const currentIndex = currentLandmarkIndexes[gameSession.id] || 0;

    setSelectedLandmarks(gameSession.landmarks);
    setSelectedGameSessionName(gameSession.name);
    setSelectedExtraChallenge(gameSession.extrachallengeTime);
    setSelectedGameSessionId(gameSession.id);
    setSelectedUniqueLandmark(gameSession.uniqueLandmark);

    setGameSessionPopupVisible(false);

    // 🔹 Controlla quale popup riaprire per la GameSession corrente
    if (lastPopupOpenedState[gameSession.id] === "ConfirmationLandmarkPopup") {
      setLandmarkPopupVisible(true);
    } else {
      setLandmarkPopupVisible(true);
    }

    const lastPopup = lastPopupOpenedState[gameSession.id];
    if (lastPopup === "ConfirmationLandmarkPopup") {
      setConfirmationVisible(true); // Apri direttamente il popup di conferma
    } else {
      setLandmarkPopupVisible(true); // Apri il popup Landmark come default
    }

    setCurrentLandmarkIndexes((prev) => ({
      ...prev,
      [gameSession.id]: currentIndex,
    }));
  };

  // Chiude LandmarkPopup
  const closeLandmarkPopup = () => {
    setLandmarkPopupVisible(false);
    setSelectedLandmarks([]); // Resetta i Landmark selezionati
  };

  const updateGameSessionCompletion = (
    gameSessionId: string,
    allLandmarksFound: boolean
  ) => {
    setAcceptedGameSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === gameSessionId
          ? { ...session, completed: true, allLandmarksFound }
          : session
      )
    );
  };

  // Gestisce l'aggiunta di un nuovo Landmark
  const handleAddLandmark = (newLandmark: Landmark) => {
    setCustomLandmarks((prev) => [...prev, newLandmark]);

    setAddPopupVisible(false);

    setTimeout(() => {
      setShowLandmarkAddedMessage(true);
      setTimeout(() => setShowLandmarkAddedMessage(false), 5000); // Nasconde dopo 5s
    }, 500);
  };

  // Replace the handleExperienceGain function
  const handleExperienceGain = async (expGained: number) => {
    const result = experience.addExperience(expGained);
    const newExperience = new Experience(result.newExp, result.newLevel);
    setExperience(newExperience);
    await saveExperience(newExperience);

    if (result.didLevelUp) {
      setNewLevelReached(result.newLevel);
      setIsLevelUpVisible(true);
    }
  };

  // Add new state after other state declarations
  const [modelVisible, setModelVisible] = useState(true);

  // Modify the handleSonarPress function
  const handleSonarPress = () => {
    if (isSonarButtonDisabled) return;

    setIsSonarButtonDisabled(true);
    setIsSearching(true);
    startSpinAnimation();

    const currentPosition = {
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
    };

    setTimeout(() => {
      if (spinAnimation.current) {
        spinAnimation.current.stop();
      }
      spinValue.setValue(0);
      setIsSearching(false);

      if (!hasFoundInitialSession) {
        setShowDiscoveryMessage(true);
        setHasFoundInitialSession(true);
        setModelVisible(false); // Hide model only when showing discovery message

        setTimeout(() => {
          setShowDiscoveryMessage(false);
          setIsGameSession3Visible(true);
          // Save the state to AsyncStorage
          AsyncStorage.setItem("isGameSession3Visible", "true");

          setMapTarget({
            latitude: gameSession3.latitude,
            longitude: gameSession3.longitude,
          });

          setTimeout(() => {
            setMapTarget(currentPosition);
            setTimeout(() => {
              setModelVisible(true); // Show model again after camera returns
              setIsSonarButtonDisabled(false);
              setMapTarget(null);
            }, 1000);
          }, 2000);
        }, 1500);
      } else {
        setShowNoSessionFound(true);
        setTimeout(() => {
          setShowNoSessionFound(false);
          setIsSonarButtonDisabled(false);
        }, 1500);
      }
    }, 3000);
  };

  // Add cleanup for animation when component unmounts
  useEffect(() => {
    return () => {
      if (spinAnimation.current) {
        spinAnimation.current.stop();
      }
      spinValue.setValue(0);
    };
  }, []);

  // Calculate rotation for the animation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const removeCompletedGameSession = async (gameSessionId: string) => {
    const completedSession = acceptedGameSessions.find(
      (session) => session.id === gameSessionId
    );

    if (completedSession) {
      setCompletedGameSessions((prev) => [
        ...prev,
        { ...completedSession, completed: true },
      ]);
      setAcceptedGameSessions((prev) =>
        prev.filter((session) => session.id !== gameSessionId)
      );
      setCurrentLandmarkIndexes((prev) => {
        const { [gameSessionId]: _, ...remaining } = prev;
        return remaining;
      });
      setLandmarksFoundStatus((prev) => {
        const { [gameSessionId]: _, ...remaining } = prev;
        return remaining;
      });

      // Riabilita il marker nella mappa
      setDisabledGameSessions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(gameSessionId); // Rimuove l'ID dal set disabilitato
        return newSet;
      });

      // 🔹 Reset dell'ultimo popup aperto per questa sessione
      setLastPopupOpenedState((prev) => ({
        ...prev,
        [gameSessionId]: null,
      }));
      await saveLastPopupState(gameSessionId, null); // ✅ Reset in AsyncStorage

      // Salva lo stato aggiornato
      await saveGameState();
    }
  };

  // Update the model loading state
  useEffect(() => {
    if (!modelDebug.loading && modelDebug.progress === 1) {
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        setIsModelReady(true);
      }, 500);
    }
  }, [modelDebug]);

  // Update the model loading state handler
  useEffect(() => {
    if (modelDebug.progress >= 1) {
      // Only hide preloader when progress is complete
      setTimeout(() => {
        setIsModelReady(true);
      }, 500);
    }
  }, [modelDebug.progress]);

  // Add console logs for debugging
  useEffect(() => {
    console.log("Model Debug:", modelDebug);
    console.log("Is Model Ready:", isModelReady);
  }, [isModelReady]);

  // Load isGameSession3Visible state from AsyncStorage on component mount
  useEffect(() => {
    const loadGameSession3State = async () => {
      try {
        const savedState = await AsyncStorage.getItem("isGameSession3Visible");
        if (savedState !== null) {
          setIsGameSession3Visible(JSON.parse(savedState));
          if (JSON.parse(savedState)) {
            setHasFoundInitialSession(true);
          }
        }
      } catch (error) {
        console.error("Error loading game session 3 state:", error);
      }
    };
    loadGameSession3State();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Mappa con i marker dinamici */}
        <Map
          location={location || { latitude: 0, longitude: 0 }}
          mapRef={mapRef}
          onRegionChange={handleRegionChange}
          heading={smoothHeading}
          target={mapTarget || undefined} // Add this prop
        >
          {dynamicGameSessions.map(
            (session) =>
              (session.id !== "3" || isGameSession3Visible) && (
                <MinigameMarker
                  key={`marker-${session.id}`}
                  coordinate={{
                    latitude: session.latitude,
                    longitude: session.longitude,
                  }}
                  gameId={session.id}
                  onPress={() => handleMarkerPress(session)}
                  isDisabled={disabledGameSessions.has(session.id)}
                  isCompleted={completedGameSessions.some(
                    (s) => s.id === session.id
                  )}
                />
              )
          )}
        </Map>

        {showLandmarkAddedMessage && (
          <View style={styles.searchOverlay}>
            <View
              style={[styles.pillContainer, { backgroundColor: "#4CAF50" }]}
            >
              <View style={[styles.pillContent, { justifyContent: "center" }]}>
                <View
                  style={[
                    styles.spinnerContainer,
                    { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                  ]}
                >
                  <FontAwesome5
                    name="check-circle"
                    size={normalize(24)}
                    color="white"
                  />
                </View>
                <Text
                  style={[
                    styles.searchText,
                    styles.discoveryText,
                    { textAlign: "center", flex: 1, marginRight: wp(6) },
                  ]}
                >
                  Landmark Added Successfully!
                </Text>
              </View>
            </View>
          </View>
        )}

        <Player3D
          location={userLocation}
          heading={smoothHeading}
          mapRef={mapRef}
          region={region}
          onDebugUpdate={setModelDebug}
          modelVisible={modelVisible} // This will control the model's visibility
        />

        {showDiscoveryMessage && (
          <View style={styles.searchOverlay}>
            <View
              style={[styles.pillContainer, { backgroundColor: "#4CAF50" }]}
            >
              <View style={[styles.pillContent, { justifyContent: "center" }]}>
                <View
                  style={[
                    styles.spinnerContainer,
                    { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                  ]}
                >
                  <FontAwesome5
                    name="map-marker-alt"
                    size={normalize(24)}
                    color="white"
                  />
                </View>
                <Text
                  style={[
                    styles.searchText,
                    styles.discoveryText,
                    { textAlign: "center", flex: 1, marginRight: wp(6) },
                  ]}
                >
                  New Game Session Found!
                </Text>
              </View>
            </View>
          </View>
        )}

        {showNoSessionFound && (
          <View style={styles.searchOverlay}>
            <View
              style={[styles.pillContainer, { backgroundColor: "#FF6B6B" }]}
            >
              <View style={[styles.pillContent, { justifyContent: "center" }]}>
                <View
                  style={[
                    styles.spinnerContainer,
                    { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                  ]}
                >
                  <FontAwesome5
                    name="times-circle"
                    size={normalize(24)}
                    color="white"
                  />
                </View>
                <Text
                  style={[
                    styles.searchText,
                    styles.discoveryText,
                    { textAlign: "center", flex: 1, marginRight: wp(6) },
                  ]}
                >
                  No New Game Sessions Found
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 3 bottoni in alto a destra */}
        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.mapButton,
                acceptedGameSessions.length > 0 && styles.activeMapButton,
              ]}
              onPress={handleFlagPress}
            >
              <FontAwesome5
                name="flag"
                size={normalize(24)}
                color={acceptedGameSessions.length > 0 ? "#FFF" : "white"}
              />
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => setAddPopupVisible(true)}
          >
            <FontAwesome5 name="camera" size={normalize(24)} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapButton}
            onPress={handleSonarPress}
            disabled={isSonarButtonDisabled}
          >
            <SvgXml
              xml={sonarIcon}
              width={normalize(24)}
              height={normalize(24)}
              fill="#FFFFFF"
              style={{ transform: [{ scale: 1.5 }] }}
            />
          </TouchableOpacity>
        </View>

        {/* Replace the search animation view */}
        {isSearching && (
          <View style={styles.searchOverlay}>
            <View style={styles.pillContainer}>
              <View style={[styles.pillContent, { justifyContent: "center" }]}>
                <Animated.View
                  style={[
                    styles.spinnerContainer,
                    { transform: [{ rotate: spin }] },
                  ]}
                >
                  {/* Wrap SvgXml in a Text component */}
                  <Text>
                    <SvgXml
                      xml={sonarIcon}
                      width={normalize(38)}
                      height={normalize(38)}
                      fill="#007BFF"
                    />
                  </Text>
                </Animated.View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.searchText,
                    {
                      textAlign: "center",
                      flex: 1,
                      marginRight: wp(6),
                      color: "#2c3e50",
                      fontWeight: "600",
                      fontSize: normalize(16),
                    },
                  ]}
                >
                  Searching for new game sessions
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.leftButtonContainer}>
          <TouchableOpacity
            style={[
              styles.mapButton,
              {
                width: normalize(50),
                height: normalize(50),
              },
            ]}
            onPress={toggleInfoModal}
          >
            <FontAwesome5
              name="info"
              size={normalize(20)}
              justifyContent="center"
              color="white"
            />
          </TouchableOpacity>
        </View>

        {showGameSessionAddedMessage && (
          <View style={styles.searchOverlay}>
            <View
              style={[styles.pillContainer, { backgroundColor: "#4CAF50" }]}
            >
              <View style={[styles.pillContent, { justifyContent: "center" }]}>
                <View
                  style={[
                    styles.spinnerContainer,
                    { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                  ]}
                >
                  <FontAwesome5
                    name="check-circle"
                    size={normalize(24)}
                    color="white"
                  />
                </View>
                <Text
                  style={[
                    styles.searchText,
                    styles.discoveryText,
                    { textAlign: "center", flex: 1, marginRight: wp(6) },
                  ]}
                >
                  Game Session added to the list of accepted sessions!
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Popup per selezionare una sessione di gioco */}
        <SelectGameSessionPopup
          isVisible={isSelectPopupVisible}
          gameSessionName={selectedGameSession?.name || ""}
          landmarksCount={selectedGameSession?.landmarks.length || 0}
          gameSessionPicture={selectedGameSession?.picture || ""}
          onClose={() => setSelectPopupVisible(false)}
          onAdd={handleAddGameSession}
        />

        {/* Popup per le GameSession accettate */}
        <GameSessionPopup
          isVisible={isGameSessionPopupVisible}
          gameSessions={acceptedGameSessions}
          onClose={closeGameSessionPopup}
          onRemove={handleRemoveGameSession}
          onGameSessionPress={handleGameSessionClick}
        />

        {/* Popup Landmark */}
        <LandmarkPopup
          isVisible={isLandmarkPopupVisible}
          landmarks={selectedLandmarks}
          setLandmarks={setSelectedLandmarks}
          gameSessionName={selectedGameSessionName}
          extraChallengeTime={selectedExtraChallenge}
          landmarksFoundStatus={
            landmarksFoundStatus[selectedGameSessionId] || []
          }
          setLandmarksFoundStatus={(status) =>
            setLandmarksFoundStatus((prev) => ({
              ...prev,
              [selectedGameSessionId]: status,
            }))
          }
          onClose={closeLandmarkPopup}
          onUpdateGameSession={updateGameSessionCompletion}
          gameSessionId={selectedGameSessionId}
          uniqueLandmark={selectedUniqueLandmark}
          userLatitude={location?.latitude || 0}
          userLongitude={location?.longitude || 0}
          currentLandmarkIndex={
            currentLandmarkIndexes[selectedGameSessionId] || 0
          }
          setCurrentLandmarkIndex={(index) => {
            setCurrentLandmarkIndexes((prev) => ({
              ...prev,
              [selectedGameSessionId]: index,
            }));
          }}
          onExperienceGain={handleExperienceGain}
          onRemoveCompletedGameSession={removeCompletedGameSession}
          lastPopupOpened={lastPopupOpenedState[selectedGameSessionId] || null}
          setLastPopupOpened={(gameSessionId, popupName) =>
            setLastPopupOpenedState((prev) => ({
              ...prev,
              [gameSessionId]: popupName,
            }))
          }
        />

        {/* Popup per aggiungere landmark */}
        <AddLandmarkPopup
          isVisible={isAddPopupVisible}
          onClose={() => setAddPopupVisible(false)}
          onAdd={handleAddLandmark}
          currentLatitude={location?.latitude || 0}
          currentLongitude={location?.longitude || 0}
          onExperienceGain={handleExperienceGain}
          onLandmarkAdded={() => {
            setShowLandmarkAddedMessage(true);
            setTimeout(() => setShowLandmarkAddedMessage(false), 3000);
          }}
        />

        {/* Level Bar Component */}
        <View style={styles.levelBarContainer}>
          {/* User Avatar */}
          <View style={styles.userAvatarContainer}>
            <View style={styles.userAvatar}>
              <View>
                <FontAwesome5
                  name="user-alt"
                  size={normalize(35)}
                  color="#007BFF"
                />
              </View>
            </View>
          </View>

          {/* User Info */}
          <View style={styles.userInfoContainer}>
            <Text style={styles.userNickname}>Expert User</Text>
            {/* The current Level should be moved on the right part of the progression bar */}
            <View style={{ flex: 1, alignItems: "flex-end", marginRight: 35 }}>
              <Text style={styles.userLevel}>
                Lvl {experience.currentLevel}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${
                    (experience.currentExp /
                      Experience.calculateRequiredExp(
                        experience.currentLevel
                      )) *
                    100
                  }%`,
                },
              ]}
            />
          </View>

          {/* Info Modal */}
          <Modal
            isVisible={isInfoModalVisible}
            onBackdropPress={toggleInfoModal}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            style={styles.modal}
            backdropOpacity={0.5}
            deviceHeight={deviceHeight} // Usa l'altezza dello schermo
            deviceWidth={deviceWidth} // Usa la larghezza dello schermo
            useNativeDriver={true}
            statusBarTranslucent={true}
            coverScreen={true}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <FontAwesome5
                  name="map-marked-alt"
                  size={normalize(40)}
                  color="#007BFF"
                />
                <Text style={styles.modalTitle}>Welcome to Wanderlust!</Text>
                <Text style={styles.modalSubtitle}>
                  Discover the world around you
                </Text>
              </View>

              <View style={styles.modalDivider} />

              <View style={styles.modalFeatures}>
                <View style={styles.modalItemContainer}>
                  <View style={styles.iconContainer}>
                    <FontAwesome5
                      name="flag"
                      size={normalize(20)}
                      color="#007BFF"
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.featureTitle}>Game Sessions</Text>
                    <Text style={styles.modalText}>
                      View and manage your active game sessions
                    </Text>
                  </View>
                </View>

                <View style={styles.modalItemContainer}>
                  <View style={styles.iconContainer}>
                    <FontAwesome5
                      name="camera"
                      size={normalize(20)}
                      color="#007BFF"
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.featureTitle}>Add Landmarks</Text>
                    <Text style={styles.modalText}>
                      Create and share new landmarks on the map
                    </Text>
                  </View>
                </View>

                <View style={styles.modalItemContainer}>
                  <View style={styles.iconContainer}>
                    <SvgXml
                      xml={sonarIcon}
                      width={normalize(24)}
                      height={normalize(24)}
                      fill="#007BFF"
                      style={{ transform: [{ scale: 1.0 }] }}
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.featureTitle}>Explore</Text>
                    <Text style={styles.modalText}>
                      Discover new game sessions around you
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={toggleInfoModal}
              >
                <Text style={styles.closeButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>

        {/* Add this JSX before the closing SafeAreaView */}
        <Modal
          isVisible={isLevelUpVisible}
          animationIn="bounceIn"
          animationOut="fadeOut"
          backdropOpacity={0.5}
          onBackdropPress={() => setIsLevelUpVisible(false)}
          style={styles.levelUpModal}
        >
          <View style={styles.levelUpContent}>
            <View style={styles.levelUpIconContainer}>
              <FontAwesome5 name="star" size={normalize(50)} color="#FFD700" />
            </View>
            <Text style={styles.levelUpTitle}>Level Up!</Text>
            <View style={styles.levelUpDetails}>
              <Text style={styles.newLevelText}>Level {newLevelReached}</Text>
              <Text style={styles.congratsText}>
                Congratulations! You've reached a new level!
              </Text>
            </View>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => setIsLevelUpVisible(false)}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Place the preloader at the very end */}
        {!isModelReady && (
          <Preloader
            progress={modelDebug.progress}
            onLoadComplete={() => setIsModelReady(true)}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    top: hp(25),
    right: wp(-4),
    gap: wp(2.5),
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: normalize(30),
    paddingRight: wp(6),
    padding: wp(2.5),
    elevation: 3,
  },

  mapButton: {
    backgroundColor: "#007BFF",
    padding: normalize(15),
    borderRadius: normalize(35),
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  activeMapButton: {
    backgroundColor: "#FF7B00",
    shadowColor: "#FF8C00",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },

  leftButtonContainer: {
    position: "absolute",
    top: hp(25),
    left: wp(-4),
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: normalize(30),
    paddingLeft: wp(6),
    padding: wp(2.5),
    elevation: 3,
  },

  levelBarContainer: {
    position: "absolute",
    bottom: hp(5),
    left: wp(5),
    right: wp(5),
    height: hp(5.5),
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: normalize(20),
    elevation: 3,
    paddingVertical: hp(1),
  },

  userAvatarContainer: {
    position: "absolute",
    top: hp(-6),
    alignSelf: "center",
    zIndex: 2,
  },

  userAvatar: {
    width: normalize(70),
    height: normalize(70),
    borderRadius: normalize(35),
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: normalize(2) },
    shadowOpacity: 0.25,
    shadowRadius: normalize(3.84),
  },

  userInfoContainer: {
    position: "absolute",
    left: wp(5),
    top: hp(0.6),
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1.5),
    width: "100%",
  },

  userNickname: {
    color: "#007BFF",
    fontWeight: "bold",
    fontSize: normalize(16),
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: normalize(1) },
    textShadowRadius: normalize(2),
  },

  userLevel: {
    color: "#666",
    fontSize: normalize(14),
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.25),
    borderRadius: normalize(10),
  },

  progressBarBackground: {
    position: "absolute",
    bottom: hp(1.2),
    left: wp(3.75),
    right: wp(3.75),
    height: hp(0.75),
    backgroundColor: "rgba(0, 123, 255, 0.2)",
    borderRadius: normalize(3),
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#007BFF",
    borderRadius: normalize(4),
  },

  modal: {
    margin: 0,
    flex: 1,
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "white",
    padding: wp(6),
    paddingTop: hp(3),
    paddingBottom: hp(4),
    borderTopLeftRadius: normalize(30),
    borderTopRightRadius: normalize(30),
    alignItems: "center",
    //maxHeight: hp(50), // Changed from hp(20) to hp(24) to fit all content while staying below buttons
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: normalize(-4),
    },
    shadowOpacity: 0.25,
    shadowRadius: normalize(4),
    elevation: 5,
  },

  modalHeader: {
    alignItems: "center",
    marginBottom: hp(2.5),
  },

  modalTitle: {
    fontSize: normalize(24),
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: hp(1.9),
  },

  modalSubtitle: {
    fontSize: normalize(16),
    color: "#7f8c8d",
    marginTop: hp(0.6),
  },

  modalDivider: {
    height: hp(0.1),
    backgroundColor: "#e0e0e0",
    width: "100%",
    marginVertical: hp(1.9),
  },

  modalFeatures: {
    width: "100%",
    marginTop: hp(1.2),
  },

  modalItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2.5),
    width: "100%",
  },

  iconContainer: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: "#f0f9ff",
    borderRadius: normalize(12),
    justifyContent: "center",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    marginLeft: wp(3.75),
  },

  featureTitle: {
    fontSize: normalize(18),
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: hp(0.5),
  },

  modalText: {
    fontSize: normalize(14),
    color: "#7f8c8d",
    lineHeight: normalize(20),
  },

  closeButton: {
    backgroundColor: "#007BFF",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(7.5),
    borderRadius: normalize(25),
    marginTop: hp(2.5),
    width: "100%",
  },

  closeButtonText: {
    color: "white",
    fontSize: normalize(16),
    fontWeight: "bold",
    textAlign: "center",
  },

  levelUpModal: {
    margin: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },

  levelUpContent: {
    backgroundColor: "white",
    padding: wp(7.5),
    borderRadius: normalize(25),
    alignItems: "center",
    width: "100%",
    maxWidth: wp(85),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: normalize(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: normalize(3.84),
    elevation: 5,
  },

  levelUpIconContainer: {
    width: normalize(100),
    height: normalize(100),
    backgroundColor: "#FFF9E6",
    borderRadius: normalize(50),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2.5),
    shadowColor: "#FFD700",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: normalize(10),
    elevation: 5,
  },

  levelUpTitle: {
    fontSize: normalize(32),
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: hp(1.9),
    textTransform: "uppercase",
  },

  levelUpDetails: {
    alignItems: "center",
    marginBottom: hp(3.1),
  },

  newLevelText: {
    fontSize: normalize(24),
    fontWeight: "600",
    color: "#007BFF",
    marginBottom: hp(1.2),
  },

  congratsText: {
    fontSize: normalize(18),
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: hp(0.6),
  },

  continueButton: {
    backgroundColor: "#007BFF",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(7.5),
    borderRadius: normalize(25),
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: normalize(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: normalize(3.84),
    elevation: 5,
  },

  continueButtonText: {
    color: "white",
    fontSize: normalize(18),
    fontWeight: "bold",
    textAlign: "center",
  },

  sonarMessageContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -wp(37.5) }, { translateY: -hp(3.125) }], // Converted from fixed -150px, -25px
    backgroundColor: "white",
    borderRadius: normalize(25),
    width: wp(75), // Converted from fixed 300px
    height: hp(8.75), // Converted from fixed 70px
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: normalize(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: normalize(3.84),
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(0, 123, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  messageWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  sonarMessageText: {
    color: "#2c3e50",
    fontSize: normalize(16),
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
    paddingLeft: wp(7), // Converted from fixed 28px
  },

  dotsContainer: {
    width: wp(6), // Converted from fixed 24px
    alignItems: "flex-start",
    marginLeft: wp(0.5), // Converted from fixed 2px
  },

  dotsText: {
    color: "#2c3e50",
    fontSize: normalize(16),
    fontWeight: "600",
  },

  searchOverlay: {
    position: "absolute",
    top: "55%",
    left: wp(5),
    right: wp(5),
    alignItems: "center",
    justifyContent: "center",
  },

  pillContainer: {
    width: "100%",
    minHeight: hp(7),
    backgroundColor: "white",
    borderRadius: normalize(30),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: normalize(2),
    },
    shadowOpacity: 0.2,
    shadowRadius: normalize(4),
    elevation: 5,
  },

  pillContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    justifyContent: "center",
    minHeight: hp(7),
  },

  spinnerContainer: {
    width: normalize(45),
    height: normalize(45),
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    borderRadius: normalize(23),
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginRight: wp(3),
  },

  searchText: {
    color: "#2c3e50",
    fontSize: normalize(16),
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },

  discoveryText: {
    color: "white",
    fontWeight: "600",
    fontSize: normalize(16),
    flexShrink: 1,
    flexWrap: "wrap",
    textAlign: "center", // Added this
  },
  bottomOverlay: {
    position: "absolute",
    bottom: hp(5),
    left: wp(5),
    right: wp(5),
    alignItems: "center",
    justifyContent: "center",
  },
  messageContainer: {
    position: "absolute",
    bottom: 50, // Posiziona sopra il bordo inferiore
    left: 20, // Margine sinistro
    right: 20, // Margine destro
    backgroundColor: "rgba(0, 123, 255, 0.9)",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    zIndex: 1000, // Assicurati che appaia sopra altri elementi
  },
  messageText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default MapScreen;
