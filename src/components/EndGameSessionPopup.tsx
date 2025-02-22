import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import { FontAwesome5 } from "@expo/vector-icons";
import UniqueLandmarkPopup from "./UniqueLandmarkPopup";
import { Landmark } from "@/models/Landmark";
import { Experience } from "../models/Experience";
import { useLocation } from "@/hooks/useLocation";
import { normalize, wp, hp } from "../utils/dimensions";
import { Dimensions } from "react-native";

const { height: deviceHeight, width: deviceWidth } = Dimensions.get("screen");

type EndGameSessionPopupProps = {
  isVisible: boolean;
  gameSessionName: string;
  gameSessionId: string;
  updateGameSessionCompletion: (
    gameSessionId: string,
    allLandmarksFound: boolean
  ) => void; // Funzione per aggiornare la sessione
  landmarksFoundStatus: boolean[];
  extraChallengeCompleted: boolean; // Stato della challenge extra
  uniqueLandmark: Landmark | null;
  onEnd: () => void; // Chiusura del popup e ritorno al flusso delle GameSessions
  onExperienceGain?: (exp: number) => void;
  onRemoveCompletedGameSession: (gameSessionId: string) => void;
  setLastPopupOpened: (gameSessionId: string, popupName: string | null) => void;
};

const EndGameSessionPopup: React.FC<EndGameSessionPopupProps> = ({
  isVisible,
  gameSessionName,
  gameSessionId,
  landmarksFoundStatus,
  updateGameSessionCompletion,
  extraChallengeCompleted,
  uniqueLandmark,
  onEnd,
  onExperienceGain,
  onRemoveCompletedGameSession,
  setLastPopupOpened,
}) => {
  const [isClosing, setIsClosing] = React.useState(false);
  const [isUniquePopupVisible, setUniquePopupVisible] = useState(false);
  const [isConfirmExitVisible, setIsConfirmExitVisible] = useState(false);
  const [showUniqueLandmarkWarning, setShowUniqueLandmarkWarning] =
    useState(false);
  const { location, loading } = useLocation(); // Ottieni la posizione attuale

  const allLandmarksFound =
    landmarksFoundStatus.length > 0 &&
    landmarksFoundStatus.every((status) => status);
  useEffect(() => {
    console.log("Final Landmarks Found Status:", landmarksFoundStatus);
    console.log("All Landmarks Found?", allLandmarksFound);

    if (isVisible && allLandmarksFound && onExperienceGain && !isClosing) {
      onExperienceGain(Experience.EXP_PER_COMPLETED_SESSION);
    }
  }, [isVisible, landmarksFoundStatus, isClosing]);

  const handleEndPress = () => {
    if (extraChallengeCompleted && allLandmarksFound) {
      // Se la sfida extra è completata e tutti i landmark sono trovati, mostra l'avviso
      setShowUniqueLandmarkWarning(true);
    } else {
      // Se il landmark unico NON è sbloccato, chiudi direttamente
      handleConfirmExit();
    }
  };

  const handleConfirmExit = () => {
    setIsClosing(true);
    setTimeout(() => {
      updateGameSessionCompletion(gameSessionId, allLandmarksFound);
      onRemoveCompletedGameSession(gameSessionId);
      onEnd();
      setIsClosing(false);
    }, 100);
    setIsConfirmExitVisible(false);
    setShowUniqueLandmarkWarning(false);
  };

  const handleContinuePress = () => {
    setIsClosing(false);
    setUniquePopupVisible(true); // Mostra UniqueLandmarkPopup
    onRemoveCompletedGameSession(gameSessionId);
  };

  const handleCloseUniquePopup = () => {
    setUniquePopupVisible(false);
    onEnd(); // Ritorna al flusso principale
  };

  useEffect(() => {
    if (isVisible && allLandmarksFound && onExperienceGain && !isClosing) {
      // Award bonus experience for completing the entire session
      onExperienceGain(Experience.EXP_PER_COMPLETED_SESSION);
    }
  }, [isVisible, allLandmarksFound, isClosing]);

  if (!isVisible && !isClosing) return null; // Non renderizzare se non visibile e non in chiusura

  return (
    <>
      <Modal
        isVisible={isVisible}
        hasBackdrop={false}
        backdropColor="black"
        backdropOpacity={0.5}
        statusBarTranslucent={true}
        deviceHeight={deviceHeight} // Usa l'altezza dello schermo
        deviceWidth={deviceWidth} // Usa la larghezza dello schermo
        coverScreen={true}
        onBackdropPress={handleEndPress} // Chiudi cliccando sullo sfondo
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.gameSessionName}>{gameSessionName}</Text>
            <TouchableOpacity
              onPress={handleEndPress}
              style={styles.closeButton}
            >
              <FontAwesome5 name="times" size={normalize(24)} color="#DC3545" />
            </TouchableOpacity>
          </View>

          {/* Trophy Icon */}
          <View style={styles.trophyContainer}>
            <FontAwesome5
              name="trophy"
              size={normalize(90)}
              color={allLandmarksFound ? "gold" : "gray"}
            />
          </View>

          {/* Completion Message */}
          <Text style={styles.message}>
            {allLandmarksFound
              ? "Congratulations! You found all the landmarks!"
              : "Good effort! Try again to find all the landmarks!"}
          </Text>

          {/* Stato Challenge Extra */}
          <View style={styles.challengeOverviewContainer}>
            <Text style={styles.challengeOverviewTitle}>
              Challenge Overview
            </Text>
            <View style={styles.challengeRow}>
              <Text style={styles.challengeName}>Challenge 1</Text>
              <FontAwesome5
                name={
                  extraChallengeCompleted && allLandmarksFound
                    ? "check-circle"
                    : "times-circle"
                }
                size={normalize(20)}
                color={
                  extraChallengeCompleted && allLandmarksFound
                    ? "#007BFF"
                    : "red"
                }
                style={styles.challengeIcon}
              />
            </View>
            {extraChallengeCompleted && allLandmarksFound ? (
              <Text style={styles.unlockedMessage}>
                Unique Landmark Unlocked!
              </Text>
            ) : null}
          </View>

          {/* Bottoni Continue ed End */}
          <View
            style={[
              styles.buttonRow,
              extraChallengeCompleted && allLandmarksFound
                ? null // Se entrambi i pulsanti sono visibili, NON applicare singleButtonRow
                : styles.singleButtonRow,
            ]}
          >
            {extraChallengeCompleted && allLandmarksFound && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleContinuePress}
              >
                <Text style={styles.actionButtonText}>Discover</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.endButton,
                extraChallengeCompleted && allLandmarksFound
                  ? null // Non applicare singleEndButton se entrambi i pulsanti sono presenti
                  : styles.singleEndButton,
              ]}
              onPress={handleEndPress}
            >
              <Text style={styles.endButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* UniqueLandmarkPopup */}
      <UniqueLandmarkPopup
        isVisible={isUniquePopupVisible}
        uniqueLandmark={uniqueLandmark}
        gameSessionName={gameSessionName}
        onClose={handleCloseUniquePopup}
        userLatitude={location?.latitude || 0} // Usa un valore di fallback (es. 0)
        userLongitude={location?.longitude || 0} // Usa un valore di fallback (es. 0)
      />

      {/* Popup di conferma uscita SENZA avviso Landmark Unico */}
      <Modal
        isVisible={isConfirmExitVisible}
        onBackdropPress={() => setIsConfirmExitVisible(false)}
      >
        <View style={styles.confirmModal}>
          <Text style={styles.confirmTitle}>
            Are you sure you want to exit?
          </Text>
          <View style={styles.confirmButtons}>
            <TouchableOpacity
              style={styles.confirmButtonNo}
              onPress={() => setIsConfirmExitVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Go Back!</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButtonYes}
              onPress={handleConfirmExit}
            >
              <Text style={styles.confirmButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Popup di conferma uscita CON avviso Landmark Unico */}
      <Modal
        isVisible={showUniqueLandmarkWarning}
        onBackdropPress={() => setShowUniqueLandmarkWarning(false)}
      >
        <View style={styles.confirmModal}>
          <Text style={styles.confirmTitle}>
            Are you sure you want to exit?
          </Text>
          <Text style={styles.warningText}>
            If you leave now, you won't be able to find the Unique Landmark.
          </Text>
          <View style={styles.confirmButtons}>
            <TouchableOpacity
              style={styles.confirmButtonNo}
              onPress={() => setShowUniqueLandmarkWarning(false)}
            >
              <Text style={styles.confirmButtonText}>Go Back!</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButtonYes}
              onPress={handleConfirmExit}
            >
              <Text style={styles.confirmButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  gameSessionName: {
    fontSize: normalize(20),
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: wp(-5), // Sposta il testo con un margine
  },
  closeButton: {
    padding: normalize(5),
  },
  trophyContainer: {
    width: normalize(100),
    height: normalize(100),
    marginVertical: hp(3),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: normalize(50),
  },
  message: {
    marginTop: hp(2),
    fontSize: normalize(18),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp(1.5),
    color: "#555",
    width: wp(75),
    alignSelf: "center",
    transform: [{ translateY: -hp(1) }],
  },
  extraChallengeContainer: {
    marginTop: hp(1.5),
    alignItems: "center",
  },
  extraChallengeTitle: {
    fontSize: normalize(18),
    fontWeight: "bold",
    color: "#333",
  },
  extraChallengeResult: {
    fontSize: normalize(16),
    marginTop: hp(0.5),
    color: "#555",
  },
  challengeOverviewContainer: {
    marginTop: hp(1),
    alignItems: "flex-start",
    width: "93%",
  },
  challengeOverviewTitle: {
    fontSize: normalize(18),
    fontWeight: "bold",
    marginBottom: hp(1),
    textAlign: "left",
    color: "#333",
    transform: [{ translateY: -hp(1) }],
  },
  challengeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1),
    transform: [{ translateY: -hp(1) }],
  },
  challengeName: {
    fontSize: normalize(16),
    marginRight: wp(2),
    color: "#555",
  },
  challengeIcon: {
    marginLeft: wp(1),
  },
  unlockedMessage: {
    fontSize: normalize(18),
    color: "#007BFF",
    textAlign: "left",
    transform: [{ translateY: -hp(1) }],
  },
  buttonContainer: {
    position: "absolute",
    bottom: hp(4),
    width: "100%",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: hp(5.5),
  },
  singleButtonRow: {
    justifyContent: "center", // Centra il pulsante quando è unico
    marginTop: hp(6.2), // Aumenta il margine superiore per abbassarlo
  },
  endButton: {
    backgroundColor: "#DC3545",
    paddingVertical: hp(2),
    marginHorizontal: wp(1.5),
    borderRadius: normalize(10),
    alignItems: "center",
  },
  singleEndButton: {
    marginTop: hp(2), // Aggiungi un margine superiore extra solo quando è singolo
  },

  endButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalize(18),
  },

  actionButton: {
    flex: 1,
    backgroundColor: "#007BFF",
    paddingVertical: hp(2),
    marginHorizontal: wp(1.5),
    borderRadius: normalize(10),
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalize(18),
  },

  confirmModal: {
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
  confirmTitle: {
    fontSize: normalize(18),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp(1),
    color: "#333",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: hp(2),
    marginHorizontal: wp(2),
    backgroundColor: "#DC3545",
    borderRadius: normalize(10),
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalize(16),
  },
  warningText: {
    fontSize: normalize(16), // Leggermente più piccolo
    textAlign: "center", // Testo centrato
    lineHeight: normalize(22), // Spazio tra le righe ridotto
    marginBottom: normalize(15), // Meno spazio sotto il testo
    color: "#333333", // Colore leggermente più scuro per migliorare il contrasto
    width: "85%", // Restringe il contenitore del testo
    alignSelf: "center", // Centra il testo all'interno del popup
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmButtonNo: {
    flex: 1,
    paddingVertical: hp(2),
    marginHorizontal: wp(2),
    backgroundColor: "#007BFF",
    borderRadius: normalize(10),
    alignItems: "center",
  },
  confirmButtonYes: {
    flex: 1,
    paddingVertical: hp(2),
    marginHorizontal: wp(2),
    backgroundColor: "#DC3545",
    borderRadius: normalize(10),
    alignItems: "center",
  },
});

export default EndGameSessionPopup;
