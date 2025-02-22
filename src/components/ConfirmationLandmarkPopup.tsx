import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import { FontAwesome5 } from "@expo/vector-icons";
import EndGameSessionPopup from "./EndGameSessionPopup";
import { Landmark } from "@/models/Landmark";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalize, wp, hp } from "../utils/dimensions";
import { Dimensions } from "react-native";

const { height: deviceHeight, width: deviceWidth } = Dimensions.get("screen");

type ConfirmationLandmarkPopupProps = {
  isVisible: boolean;
  landmarkName: string;
  landmarkImage: any;
  gameSessionName: string;
  currentLandmarkIndex: number;
  totalLandmarks: number;
  isLastLandmark: boolean;
  onNext: () => void;
  onClose: () => void;
  updateLandmarkStatus: (
    index: number,
    status: boolean,
    callback?: (updatedStatus: boolean[]) => void
  ) => void;
  previousSelection: boolean | null;
  landmarks: Landmark[];
  landmarksFoundStatus: boolean[];
  onUpdateGameSession: (
    gameSessionId: string,
    allLandmarksFound: boolean
  ) => void;
  gameSessionId: string;
  timeLeft: number;
  uniqueLandmark: Landmark | null;
  onExperienceGain?: (exp: number) => void;
  onRemoveCompletedGameSession: (gameSessionId: string) => void;
  setLastPopupOpened: (gameSessionId: string, popupName: string | null) => void;
};

const ConfirmationLandmarkPopup: React.FC<ConfirmationLandmarkPopupProps> = ({
  isVisible,
  landmarkName,
  landmarkImage,
  gameSessionName,
  currentLandmarkIndex,
  totalLandmarks,
  isLastLandmark,
  onNext,
  onClose,
  updateLandmarkStatus,
  previousSelection,
  landmarks,
  landmarksFoundStatus,
  onUpdateGameSession,
  gameSessionId,
  timeLeft,
  uniqueLandmark,
  onExperienceGain,
  onRemoveCompletedGameSession,
  setLastPopupOpened,
}) => {
  const [selection, setSelection] = useState<boolean | null>(previousSelection);
  const [isEndGameVisible, setIsEndGameVisible] = useState(false);
  const [hasUpdatedSession, setHasUpdatedSession] = useState(false);

  //Funzione per salvare l'ultimo popup aperto
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
    if (isVisible) {
      setSelection(null); // Resetta la selezione ogni volta che il popup viene mostrato
      setHasUpdatedSession(false); // Reset flag on opening the popup
    }
  }, [isVisible]);

  const handleSelection = (choice: boolean) => {
    setSelection(choice);
    updateLandmarkStatus(currentLandmarkIndex, choice);
  };

  const handleNextPress = () => {
    if (selection === null) {
      Alert.alert("No Selection", "Please select Yes or No before proceeding.");
      return;
    }

    if (selection && onExperienceGain) {
      onExperienceGain(50); // Award exp for finding a landmark
    }

    updateLandmarkStatus(
      currentLandmarkIndex,
      selection,
      (updatedLandmarksStatus) => {
        console.log(
          "🔸 Landmarks Found Status prima del cambio pagina:",
          updatedLandmarksStatus
        );

        const allLandmarksFound = updatedLandmarksStatus.every(
          (status) => status
        );

        if (isLastLandmark) {
          setIsEndGameVisible(true);
          onUpdateGameSession(gameSessionId, allLandmarksFound);
        } else {
          setLastPopupOpened(gameSessionId, "LandmarkPopup");
          saveLastPopupState(gameSessionId, "LandmarkPopup"); // ✅ Salva in AsyncStorage
          onNext();
        }
      }
    );
  };

  const handleEndPress = () => {
    if (selection && onExperienceGain) {
      onExperienceGain(50); // Give some experience for finding a landmark
    }
    onClose();
  };

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
        onBackdropPress={onClose}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.modalTitle}>
              {currentLandmarkIndex + 1}/{totalLandmarks}
            </Text>
            <FontAwesome5
              name="flag"
              solid
              size={normalize(20)}
              color="black"
              style={styles.flagIcon}
            />
            <Text style={styles.gameSessionName}>{gameSessionName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={normalize(24)} color="#DC3545" />
            </TouchableOpacity>
          </View>

          {/* Enhanced Landmark Image Section */}
          <View style={styles.imageContainer}>
            <Image source={landmarkImage} style={styles.landmarkImage} />
            <View style={styles.imageOverlay}>
              <Text style={styles.landmarkNameText}>{landmarkName}</Text>
            </View>
          </View>

          {/* Question */}
          <Text style={styles.questionText}>Do you find the landmark?</Text>

          {/* Yes / No Buttons */}
          <View style={styles.selectionContainer}>
            <TouchableOpacity
              style={[
                styles.thumbButton,
                selection === true && styles.selectedButton,
              ]}
              onPress={() => handleSelection(true)}
            >
              <FontAwesome5
                name="thumbs-up"
                size={normalize(24)}
                color="green"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.thumbButton,
                selection === false && styles.selectedButton,
              ]}
              onPress={() => handleSelection(false)}
            >
              <FontAwesome5
                name="thumbs-down"
                size={normalize(24)}
                color="red"
              />
            </TouchableOpacity>
          </View>

          {/* Next Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                selection === null && styles.disabledButton, // Stile disabilitato se non c'è selezione
              ]}
              onPress={handleNextPress}
              disabled={selection === null} // Disabilita il pulsante se `selection` è null
            >
              <Text
                style={[
                  styles.nextButtonText,
                  selection === null && styles.disabledText, // Cambia il colore del testo se disabilitato
                ]}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* End Game Session Popup */}
      <EndGameSessionPopup
        isVisible={isEndGameVisible}
        gameSessionName={gameSessionName}
        //allLandmarksFound={landmarks.every((landmark) => landmark.found)}
        gameSessionId={gameSessionId} // Passa l'ID della sessione
        landmarksFoundStatus={landmarksFoundStatus}
        updateGameSessionCompletion={onUpdateGameSession} // Passa la funzione di aggiornamento
        extraChallengeCompleted={timeLeft > 0}
        uniqueLandmark={uniqueLandmark}
        onEnd={() => {
          setIsEndGameVisible(false);
          onClose();
        }}
        onExperienceGain={onExperienceGain} // Add this line
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
  imageContainer: {
    width: wp(80),
    height: hp(22),
    borderRadius: normalize(15),
    overflow: "hidden",
    marginVertical: hp(2),
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  landmarkImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: hp(7),
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: normalize(12),
  },
  landmarkNameText: {
    color: "#FFF",
    fontSize: normalize(18),
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  questionText: {
    fontSize: normalize(18),
    fontWeight: "bold",
    marginBottom: hp(2),
    marginTop: hp(1),
    textAlign: "justify",
  },
  selectionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: wp(70),
    marginBottom: hp(2),
  },
  thumbButton: {
    padding: normalize(10),
  },
  selectedButton: {
    borderColor: "blue",
    borderWidth: 2,
    borderRadius: normalize(5),
  },
  buttonContainer: {
    position: "absolute",
    bottom: hp(3),
    width: "100%",
    alignItems: "center",
  },
  nextButton: {
    padding: normalize(15),
    borderRadius: normalize(10),
    marginTop: hp(2),
    backgroundColor: "#007BFF",
    width: wp(75),
    height: hp(7),
    alignItems: "center",
    marginBottom: hp(-1)
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  nextButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalize(18),
    top: hp(0.5),
  },
  disabledText: {
    color: "#aaa", // Colore più chiaro per il testo disabilitato
  },
});

export default ConfirmationLandmarkPopup;
