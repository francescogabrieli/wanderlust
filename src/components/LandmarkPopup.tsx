import React, { useState, useEffect } from "react";
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  ScrollView,
} from "react-native";
import Modal from "react-native-modal";
import { FontAwesome5 } from "@expo/vector-icons";
import ConfirmationLandmarkPopup from "./ConfirmationLandmarkPopup";
import { Landmark } from "@/models/Landmark";
import EndGameSessionPopup from "./EndGameSessionPopup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BullseyeArrowIcon from "@assets/images/bullseye-arrow.png";
import { normalize, wp, hp } from "../utils/dimensions";
import { Dimensions } from "react-native";

const { height: deviceHeight, width: deviceWidth } = Dimensions.get("screen");

type LandmarkPopupProps = {
  isVisible: boolean;
  landmarks: Landmark[];
  setLandmarks: React.Dispatch<React.SetStateAction<Landmark[]>>;
  gameSessionName: string;
  extraChallengeTime: number;
  landmarksFoundStatus: boolean[]; // Passato dal componente padre
  setLandmarksFoundStatus: (status: boolean[]) => void; // Funzione per aggiornare lo stato
  onClose: () => void;
  onUpdateGameSession: (
    gameSessionId: string,
    allLandmarksFound: boolean
  ) => void;
  gameSessionId: string;
  uniqueLandmark: Landmark | null;
  onExperienceGain?: (exp: number) => void;
  userLatitude: number; // Posizione corrente dell'utente
  userLongitude: number; // Posizione corrente dell'utente
  currentLandmarkIndex: number; // Nuova proprietà
  setCurrentLandmarkIndex: (index: number) => void;
  onRemoveCompletedGameSession: (gameSessionId: string) => void;

  lastPopupOpened: string | null;
  setLastPopupOpened: (gameSessionId: string, popupName: string | null) => void;
};

const LandmarkPopup: React.FC<LandmarkPopupProps> = ({
  isVisible,
  landmarks,
  setLandmarks,
  gameSessionName,
  extraChallengeTime,
  onClose,
  onUpdateGameSession,
  gameSessionId,
  uniqueLandmark,
  onExperienceGain,
  userLatitude,
  userLongitude,
  currentLandmarkIndex, // Ricevi dal padre
  setCurrentLandmarkIndex, // Funzione per aggiornare l'indice nel padre
  onRemoveCompletedGameSession,
  lastPopupOpened,
  setLastPopupOpened,
}) => {
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(
    isVisible ? extraChallengeTime * 60 : 0
  ); // Tempo rimanente in secondi
  const currentLandmark = landmarks[currentLandmarkIndex]; // Landmark corrente
  const isLastLandmark = currentLandmarkIndex === landmarks.length - 1; // Controlla se è l'ultimo landmark
  const [isClickedOnce, setIsClickedOnce] = useState(false); // Stato per il primo clic
  const pulseAnimation = new Animated.Value(1); // Animazione per il pulsante extrachallenge
  const [landmarksFoundStatus, setLandmarksFoundStatus] = useState<boolean[]>(
    []
  );
  const [isTimerInitialized, setIsTimerInitialized] = useState(false);

  const [isWithinRange, setIsWithinRange] = useState(false);
  const [progress, setProgress] = useState(new Animated.Value(1)); // Progressione iniziale (100%)
  const [isExtraChallengeVisible, setIsExtraChallengeVisible] = useState(false);
  const [isExtraHintVisible, setIsExtraHintVisible] = useState(false);
  const [isErrorPopupVisible, setErrorPopupVisible] = useState(false); // Stato per il popup di errore
  const [isTimeUpPopupVisible, setTimeUpPopupVisible] = useState(false);

  useEffect(() => {
    if (isVisible && lastPopupOpened === "ConfirmationLandmarkPopup") {
      setConfirmationVisible(true);
    }
  }, [isVisible, lastPopupOpened]);

  // Funzione per salvare l'ultimo popup aperto
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

  useEffect(() => {
    //Funzione per il timer
    const loadTimerState = async () => {
      const savedState = await AsyncStorage.getItem(
        `gameSessionTimer_${gameSessionId}`
      );
      if (savedState) {
        const { timeLeft: savedTime, lastUpdated } = JSON.parse(savedState);
        const timeElapsed = Math.floor((Date.now() - lastUpdated) / 1000); // Calcola il tempo trascorso
        const updatedTimeLeft = savedTime - timeElapsed;

        if (updatedTimeLeft > 0) {
          setTimeLeft(updatedTimeLeft); // Aggiorna il timer con il tempo rimasto
        } else {
          setTimeLeft(0); // Tempo scaduto
        }
      } else {
        setTimeLeft(extraChallengeTime * 60); // Timer predefinito
      }
    };

    if (isVisible) {
      loadTimerState(); // Carica lo stato del timer al riavvio
    }
  }, [isVisible, gameSessionId, extraChallengeTime]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerState = {
        timeLeft,
        lastUpdated: Date.now(), // Salva il timestamp corrente
      };
      AsyncStorage.setItem(
        `gameSessionTimer_${gameSessionId}`,
        JSON.stringify(timerState)
      );
    }
  }, [timeLeft, gameSessionId]);

  // Funzione per calcolare la distanza tra due coordinate geografiche
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371e3; // Raggio della Terra in metri
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distanza in metri
  };

  // Verifica la distanza dall'utente al landmark corrente
  useEffect(() => {
    if (currentLandmark) {
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        currentLandmark.latitude,
        currentLandmark.longitude
      );
      setIsWithinRange(distance <= 10); // Verifica se è entro 20 metri
    }
  }, [userLatitude, userLongitude, currentLandmark]);

  useEffect(() => {
    if (timeLeft > 0) {
      const progressValue = timeLeft / (extraChallengeTime * 60); // Calcola percentuale
      Animated.timing(progress, {
        toValue: progressValue,
        duration: 1000, // Aggiorna ogni secondo
        useNativeDriver: false, // Necessario per animare la larghezza
      }).start();
    }
  }, [timeLeft, extraChallengeTime]);

  const updateLandmarkStatus = (
    index: number,
    status: boolean,
    callback?: (updatedStatus: boolean[]) => void
  ) => {
    setLandmarksFoundStatus((prev) => {
      const updatedStatus = [...prev];
      updatedStatus[index] = status;
      console.log("Updated Landmarks Status:", updatedStatus); // Debug log

      if (callback) {
        callback(updatedStatus); // Esegui il callback con il nuovo valore
      }

      return updatedStatus;
    });

    // Aggiorna anche l'array globale `landmarks`
    setLandmarks((prevLandmarks) =>
      prevLandmarks.map((landmark, i) =>
        i === index ? { ...landmark, found: status } : landmark
      )
    );
  };

  useEffect(() => {
    if (isVisible) {
      //setIsClickedOnce(false); // Resetta il pulsante extra challenge
      startPulseAnimation(); // Riavvia l'animazione
      setTimeLeft(extraChallengeTime * 60); // Inizializza il timer
    }
  }, [isVisible, extraChallengeTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setTimeUpPopupVisible(true); // Mostra il popup invece di un Alert
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer); // Pulisce il timer quando il popup si chiude
  }, [timeLeft, isVisible]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Funzione per avviare l'animazione pulsante
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleExtraHint = () => {
    setIsExtraHintVisible(true); // Mostra il popup "Extra Hint"
  };

  const handleExtraChallenge = () => {
    setIsExtraChallengeVisible(true); // Mostra il popup "Extra Challenge"
  };

  // Funzione per passare al popup di conferma
  const handleNext = () => {
    setConfirmationVisible(true); // Mostra il popup di conferma
  };

  //Funzione per il pulsante Next
  const handleNextPress = () => {
    if (!isWithinRange) {
      setErrorPopupVisible(true);
    } else {
      setLastPopupOpened(gameSessionId, "ConfirmationLandmarkPopup"); // Salva stato
      saveLastPopupState(gameSessionId, "ConfirmationLandmarkPopup"); // Salva in AsyncStorage
      setConfirmationVisible(true);
    }
  };

  //Funzione per chiudere il popup di errore
  const handleCloseErrorPopup = () => {
    setErrorPopupVisible(false);
  };

  // Funzione chiamata quando si conferma nel popup di conferma
  const handleConfirmNext = () => {
    const updatedStatus = [...landmarksFoundStatus];
    updatedStatus[currentLandmarkIndex] = true; // Supponiamo che il landmark sia stato trovato
    setLandmarksFoundStatus(updatedStatus);

    setConfirmationVisible(false); // Chiudi il popup di conferma
    if (!isLastLandmark) {
      setCurrentLandmarkIndex(currentLandmarkIndex + 1); // Passa al prossimo landmark
    } else {
      handleGameSessionComplete(); // Pulizia dello stato del timer
      handleClose(); // Chiudi il popup alla fine
    }
  };

  const handleGameSessionComplete = async () => {
    await AsyncStorage.removeItem(`gameSessionTimer_${gameSessionId}`); // Rimuovi il timer salvato
    setTimeLeft(0); // Resetta il timer
  };

  // Funzione per resettare lo stato e chiudere il popup
  const handleClose = async () => {
    if (timeLeft > 0) {
      const timerState = {
        timeLeft,
        lastUpdated: Date.now(), // Salva il timestamp corrente
      };
      await AsyncStorage.setItem(
        `gameSessionTimer_${gameSessionId}`,
        JSON.stringify(timerState)
      );
    } else {
      await AsyncStorage.removeItem(`gameSessionTimer_${gameSessionId}`); // Rimuovi se il timer è 0
    }

    setLastPopupOpened(
      gameSessionId,
      isConfirmationVisible ? "ConfirmationLandmarkPopup" : "LandmarkPopup"
    );
    setConfirmationVisible(false);
    onClose();
  };

  return (
    <>
      <Modal
        isVisible={isVisible}
        hasBackdrop={true}
        backdropOpacity={0.5}
        statusBarTranslucent={true}
        onBackdropPress={handleClose}
        deviceHeight={deviceHeight} // Usa l'altezza dello schermo
        deviceWidth={deviceWidth} // Usa la larghezza dello schermo
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.modalTitle}>
              {currentLandmarkIndex + 1}/{landmarks.length}
            </Text>
            <FontAwesome5
              name="flag"
              solid
              size={20}
              color="black"
              style={styles.flagIcon}
            />
            <Text style={styles.gameSessionName}>{gameSessionName}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={normalize(24)} color="#DC3545" />
            </TouchableOpacity>
          </View>

          {/* Punto Interrogativo - moved up */}
          <View style={styles.questionContainer}>
            <FontAwesome5 name="question" size={normalize(80)} color="black" />
          </View>

          {/* Feature buttons section */}
          <View style={styles.featureButtonsContainer}>
            <View style={styles.featureButtonWrapper}>
              <TouchableOpacity
                style={[styles.featureButton, styles.challengeButton]}
                onPress={handleExtraChallenge}
              >
                <Image
                  source={BullseyeArrowIcon}
                  style={{
                    width: normalize(28),
                    height: normalize(28),
                    resizeMode: "contain",
                    tintColor: "#FFF",
                  }}
                />
                {timeLeft > 0 && (
                  <View style={styles.timerBadge}>
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.buttonLabel}>Challenge</Text>
            </View>

            <View style={styles.featureButtonWrapper}>
              <TouchableOpacity
                style={[styles.featureButton, styles.hintButton]}
                onPress={handleExtraHint}
              >
                <FontAwesome5
                  name="lightbulb"
                  size={normalize(20)}
                  color="#FFF"
                />
              </TouchableOpacity>
              <Text style={styles.buttonLabel}>Hint</Text>
            </View>
          </View>

          {/* Hint Section with ScrollView */}
          <View style={styles.hintContainer}>
            <View style={styles.hintHeader}>
              <View style={styles.compositeIcon}>
                <FontAwesome5
                  name="search"
                  size={normalize(30)}
                  color="black"
                  style={styles.searchIcon}
                />
                <View style={styles.questionIconContainer}>
                  <FontAwesome5
                    name="question"
                    size={normalize(12)}
                    color="black"
                  />
                </View>
              </View>
              <Text style={styles.hintTitle}>Riddle</Text>
            </View>

            <ScrollView
              style={styles.hintTextContainer}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.hintText}>
                {currentLandmark?.hint || "No hint available"}
              </Text>
            </ScrollView>
          </View>

          {/* Next Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                !isWithinRange && styles.disabledButton,
              ]}
              onPress={handleNextPress}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Extra Challenge Modal */}
      <Modal
        isVisible={isExtraChallengeVisible}
        onBackdropPress={() => setIsExtraChallengeVisible(false)}
        backdropOpacity={0.5}
        statusBarTranslucent={true}
        deviceHeight={deviceHeight} // Usa l'altezza dello schermo
        deviceWidth={deviceWidth} // Usa la larghezza dello schermo
      >
        <View style={styles.extraPopup}>
          <Text style={styles.extraTitle}>Extra Challenge</Text>
          <Text style={styles.extraText}>
            {`Find all landmarks within ${extraChallengeTime} minutes!`}
          </Text>
          <TouchableOpacity
            style={styles.okButton}
            onPress={() => setIsExtraChallengeVisible(false)}
          >
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Extra Hint Modal */}
      <Modal
        isVisible={isExtraHintVisible}
        onBackdropPress={() => setIsExtraHintVisible(false)}
        backdropOpacity={0.5}
        deviceHeight={deviceHeight} // Usa l'altezza dello schermo
      deviceWidth={deviceWidth} // Usa la larghezza dello schermo
      statusBarTranslucent={true}
      >
        <View style={styles.extraPopup}>
          <Text style={styles.extraTitle}>Extra Hint</Text>
          <Text style={styles.extraText}>
            {currentLandmark?.extraHint ||
              "No extra hint available for this landmark!"}
          </Text>
          <TouchableOpacity
            style={styles.okButton}
            onPress={() => setIsExtraHintVisible(false)}
          >
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        isVisible={isErrorPopupVisible}
        onBackdropPress={handleCloseErrorPopup}
        backdropOpacity={0.5}
        deviceHeight={deviceHeight} // Usa l'altezza dello schermo
      deviceWidth={deviceWidth} // Usa la larghezza dello schermo
      >
        <View style={styles.extraPopup}>
          <Text style={styles.errorTitle}>Info</Text>
          <Text style={styles.errorText}>
            Too far from the landmark, you can press the button only when you
            are close to the landmark.
          </Text>
          <TouchableOpacity
            style={styles.okButton}
            onPress={handleCloseErrorPopup}
          >
            <Text style={styles.okButtonText}>Ok</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <ConfirmationLandmarkPopup
        isVisible={isConfirmationVisible}
        landmarkName={currentLandmark?.name || ""}
        landmarkImage={currentLandmark?.picture || ""}
        gameSessionName={gameSessionName}
        currentLandmarkIndex={currentLandmarkIndex}
        totalLandmarks={landmarks.length}
        isLastLandmark={isLastLandmark}
        onClose={handleClose}
        onNext={handleConfirmNext}
        updateLandmarkStatus={updateLandmarkStatus}
        previousSelection={landmarksFoundStatus[currentLandmarkIndex] ?? null}
        landmarks={landmarks}
        landmarksFoundStatus={landmarksFoundStatus}
        onUpdateGameSession={onUpdateGameSession}
        gameSessionId={gameSessionId}
        timeLeft={timeLeft}
        uniqueLandmark={uniqueLandmark}
        onExperienceGain={onExperienceGain}
        onRemoveCompletedGameSession={onRemoveCompletedGameSession}
        setLastPopupOpened={setLastPopupOpened}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    width: wp(90),
    height: hp(60),
    backgroundColor: "white",
    borderRadius: normalize(20),
    padding: normalize(20),
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: hp(2),
    marginTop: hp(0), // Spazio superiore più ampio
  },
  modalTitle: {
    fontSize: normalize(20),
    fontWeight: "bold",
    textAlign: "center", // Mantiene il testo centrato
    //marginRight: wp(1), // Spazio tra il titolo e l'icona
  },
  flagIcon: {
    marginHorizontal: wp(2),
  },
  gameSessionName: {
    fontSize: normalize(20),
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: wp(7), // Sposta il testo con un margine
  },
  closeButton: {
    padding: normalize(5),
  },
  iconsContainer: {
    position: "absolute",
    right: wp(3), // Pulsanti più a destra
    top: hp(10), // Leggermente abbassati
    flexDirection: "column",
    alignItems: "center",
  },
  iconButton: {
    marginVertical: hp(1),
    width: normalize(35),
    height: normalize(35),
    borderRadius: normalize(20),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  animatedIcon: {
    marginRight: wp(2),
  },
  questionContainer: {
    alignItems: "center",
    marginVertical: hp(4.66), // Abbassato il punto interrogativo
  },
  compositeIcon: {
    zIndex: 1,
    position: "relative",
    width: normalize(36),
    height: normalize(36),
    justifyContent: "center",
    alignItems: "center",
    left: wp(-1.3), // Sposta leggermente a sinistra
    top: hp(1), // Sposta leggermente in basso
    transform: [
      { translateY: -hp(1.5) }, // Riduzione trasformazione verticale
      { translateX: -wp(1) }, // Sposta leggermente a sinistra
    ],
  },
  searchIcon: {
    transform: [{ rotate: "80deg" }], // Mantieni la rotazione
  },
  questionIconContainer: {
    position: "absolute",
    top: "35%", // Assicurati che sia centrato
    left: "56%",
    transform: [{ translateX: -normalize(6) }, { translateY: -normalize(6) }], // Valori adattati
  },

  hintHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: -hp(2),
  },
  hintTitle: {
    zIndex: 1,
    fontSize: normalize(22),
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginLeft: wp(-3),
    top: hp(1.4),
    
    transform: [{ translateY: -hp(2) }],
  },

  hintText: {
    fontSize: normalize(18),
    textAlign: "justify",
    color: "black",
    lineHeight: normalize(20),
    marginTop: hp(1.8),
    letterSpacing: -1,
  },

  buttonContainer: {
    position: "absolute",
    bottom: hp(2), // Decreased from hp(5) to move button lower
    width: "100%",
    alignItems: "center",
  },
  nextButton: {
    width: wp(75),
    padding: hp(2),
    borderRadius: normalize(10),
    marginBottom: hp(-0.3),
    backgroundColor: "#007BFF",
    alignItems: "center",
  },

  disabledButton: {
    backgroundColor: "#ccc",
  },
  nextButtonText: {
    fontSize: normalize(18),
    color: "white",
    fontWeight: "bold",
  },
  extraPopup: {
    width: wp(70), // Leggermente più largo per migliorare la leggibilità su schermi piccoli
    maxWidth: wp(90), // Limita la larghezza massima su schermi grandi
    backgroundColor: "#FFFFFF",
    borderRadius: normalize(15),
    padding: normalize(20),
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: normalize(4),
    elevation: 6,
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "black",
  },
  extraTitle: {
    fontSize: normalize(20),
    fontWeight: "700",
    marginBottom: normalize(15),
    textAlign: "center",
    color: "#222222",
  },
  extraText: {
    fontSize: normalize(18), // Testo leggermente più grande
    textAlign: "justify", // Allinea il testo giustificato
    lineHeight: normalize(24), // Migliora la leggibilità aumentando l'interlinea
    marginBottom: normalize(25), // Spazio inferiore più ampio
    color: "#333333", // Colore scuro per migliorare il contrasto
  },

  okButton: {
    backgroundColor: "#007BFF",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: normalize(10),
  },
  okButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalize(16),
  },
  errorTitle: {
    fontSize: normalize(20),
    fontWeight: "bold",
    marginBottom: normalize(10),
    textAlign: "center",
  },
  errorText: {
    fontSize: normalize(18),
    textAlign: "justify",
    lineHeight: 20,
    marginBottom: 20,
    color: "#333",
  },
  featureButtonsContainer: {
    position: "absolute",
    right: wp(4),
    top: hp(11),
    flexDirection: "column",
    alignItems: "center",
    gap: hp(2),
    zIndex: 2,
  },
  featureButtonWrapper: {
    alignItems: "center",
    gap: hp(0.5),
  },
  featureButton: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  challengeButton: {
    backgroundColor: "#FF6B6B",
  },
  hintButton: {
    backgroundColor: "#4CAF50",
  },
  buttonLabel: {
    color: "#2C3E50",
    fontSize: normalize(11),
    fontWeight: "600",
    textAlign: "center",
  },
  timerBadge: {
    position: "absolute",
    top: -hp(1),
    right: -wp(4),
    backgroundColor: "#FFF",
    borderRadius: normalize(12),
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(0.2),
    minWidth: wp(12),
    elevation: 2,
  },
  timerText: {
    color: "#FF6B6B",
    fontSize: normalize(10),
    fontWeight: "bold",
    textAlign: "center",
  },
  hintContainer: {
    width: "100%",
    flex: 1,
    marginTop: hp(4.9), // Increased from hp(4) to move container lower
    marginBottom: hp(8),
    paddingRight: wp(0),
  },
  hintTextContainer: {
    maxHeight: hp(22),
    width: wp(75),
    borderRadius: normalize(12),
    backgroundColor: "#f8f9fa",
    padding: normalize(15),
    marginTop: hp(-2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: "center",
  },
});

export default LandmarkPopup;
