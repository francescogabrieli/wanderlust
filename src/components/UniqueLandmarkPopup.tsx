import React, { useState, useEffect } from "react";
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import Modal from "react-native-modal";
import { FontAwesome5 } from "@expo/vector-icons";
import ConfirmationUniqueLandmarkPopup from "./ConfirmationUniqueLandmarkPopup";
import { Landmark } from "@/models/Landmark";
import { normalize, wp, hp } from "../utils/dimensions";
import { Dimensions } from "react-native";
import BullseyeArrowIcon from "@assets/images/bullseye-arrow.png";

const { height: deviceHeight, width: deviceWidth } = Dimensions.get("screen");

type UniqueLandmarkPopupProps = {
  isVisible: boolean;
  uniqueLandmark: Landmark | null;
  gameSessionName: string;
  onClose: () => void;
  userLatitude: number; // Posizione corrente dell'utente
  userLongitude: number; // Posizione corrente dell'utente
};

const UniqueLandmarkPopup: React.FC<UniqueLandmarkPopupProps> = ({
  isVisible,
  uniqueLandmark,
  gameSessionName,
  onClose,
  userLatitude,
  userLongitude,
}) => {
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [isExtraHintVisible, setIsExtraHintVisible] = useState(false);
  const [isErrorPopupVisible, setErrorPopupVisible] = useState(false); // Stato per il popup di errore
  const [isExitConfirmationVisible, setExitConfirmationVisible] =
    useState(false);

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

  useEffect(() => {
    if (uniqueLandmark && userLatitude !== 0 && userLongitude !== 0) {
      console.log("User coordinates:", {
        latitude: userLatitude,
        longitude: userLongitude,
      });

      console.log("Unique landmark coordinates:", {
        latitude: uniqueLandmark.latitude,
        longitude: uniqueLandmark.longitude,
      });

      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        uniqueLandmark.latitude,
        uniqueLandmark.longitude
      );

      console.log("Distance:", distance);

      setIsWithinRange(distance <= 10); // Verifica se è entro 10 metri
    }
  }, [userLatitude, userLongitude, uniqueLandmark]);

  const handleCompleteUniqueLandmark = (landmarkName: string) => {
    console.log(`Unique landmark "${landmarkName}" completed!`);
    // Clear all states before closing
    setConfirmationVisible(false);
    setIsExtraHintVisible(false);
    setErrorPopupVisible(false);
    setExitConfirmationVisible(false);
    onClose();
  };

  const handleExtraHint = () => {
    setIsExtraHintVisible(true); // Mostra il popup Extra Hint
  };

  const handleNext = () => {
    setConfirmationVisible(true);
  };

  const handleNextPress = () => {
    if (!isWithinRange) {
      setErrorPopupVisible(true);
    } else {
      setConfirmationVisible(true);
    }
  };

  const handleCloseErrorPopup = () => {
    setErrorPopupVisible(false);
  };

  const handleClose = () => {
    setExitConfirmationVisible(true); // Mostra il popup di conferma uscita
  };

  const confirmExit = () => {
    // Clear all states before closing
    setExitConfirmationVisible(false);
    setConfirmationVisible(false);
    setIsExtraHintVisible(false);
    setErrorPopupVisible(false);
    onClose();
  };

  useEffect(() => {
    if (!isVisible) {
      // Clear all states when popup is hidden
      setConfirmationVisible(false);
      setIsExtraHintVisible(false);
      setErrorPopupVisible(false);
      setExitConfirmationVisible(false);
    }
  }, [isVisible]);

  if (!uniqueLandmark) {
    return null; // Non renderizzare il popup se il landmark non è presente
  }

  return (
    <>
      <Modal
        isVisible={isVisible}
        hasBackdrop={false}
        backdropColor="black"
        backdropOpacity={0}
        statusBarTranslucent={true}
        deviceHeight={deviceHeight} // Usa l'altezza dello schermo
        deviceWidth={deviceWidth} // Usa la larghezza dello schermo
        coverScreen={true}
        onBackdropPress={handleClose} // Chiudi cliccando sullo sfondo
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Unique Landmark</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={normalize(24)} color="#DC3545" />
            </TouchableOpacity>
          </View>

          {/* Remove the subtitle since we moved "Unique Landmark" to header */}

          {/* Feature buttons section */}
          <View style={styles.featureButtonsContainer}>
            <View style={styles.featureButtonWrapper}>
              <TouchableOpacity
                style={[
                  styles.featureButton,
                  styles.challengeButton,
                  styles.disabledFeatureButton,
                ]}
                disabled={true}
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
              </TouchableOpacity>
              <Text style={[styles.buttonLabel, styles.disabledButtonLabel]}>
                Challenge
              </Text>
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

          {/* Moved Question Mark above hint container */}
          <View style={styles.questionContainer}>
            <FontAwesome5 name="question" size={normalize(80)} color="black" />
          </View>

          {/* Hint Section with Updated Dimensions */}
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
                {uniqueLandmark?.hint || "No hint available"}
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
              onPress={handleNextPress} // Usa la nuova funzione
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        isVisible={isErrorPopupVisible}
        onBackdropPress={handleCloseErrorPopup}
        backdropOpacity={0.5}
        deviceHeight={deviceHeight} // Usa l'altezza dello schermo
        deviceWidth={deviceWidth} // Usa la larghezza dello schermo
      >
        <View style={styles.centeredPopup}>
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

      {/* Extra Hint Modal */}
      <Modal
        isVisible={isExtraHintVisible}
        onBackdropPress={() => setIsExtraHintVisible(false)}
        backdropOpacity={0.5}
        statusBarTranslucent={true}
        deviceHeight={deviceHeight} // Usa l'altezza dello schermo
        deviceWidth={deviceWidth} // Usa la larghezza dello schermo
      >
        <View style={styles.centeredPopup}>
          <Text style={styles.extraTitle}>Extra Hint</Text>
          <Text style={styles.extraText}>
            {uniqueLandmark?.extraHint ||
              "No extra hint available for this landmark!"}
          </Text>
          <TouchableOpacity
            style={styles.okButton}
            onPress={() => setIsExtraHintVisible(false)}
          >
            <Text style={styles.okButtonText}>Ok</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Popup di conferma uscita */}
      <Modal
        isVisible={isExitConfirmationVisible}
        backdropOpacity={0.5}
        deviceHeight={deviceHeight} // Usa l'altezza dello schermo
        deviceWidth={deviceWidth} // Usa la larghezza dello schermo
        onBackdropPress={() => setExitConfirmationVisible(false)}
      >
        <View style={styles.extraPopup}>
          <Text style={styles.extraTitle}>Are you sure?</Text>
          <Text style={styles.extraText}>
            If you leave now, you will lose the chance to discover the unique
            landmark.
          </Text>
          <View style={styles.buttonContainer1}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setExitConfirmationVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Go Back!</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmExit}
            >
              <Text style={styles.confirmButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation Popup - Add conditional rendering */}
      {isConfirmationVisible && (
        <ConfirmationUniqueLandmarkPopup
          isVisible={isConfirmationVisible}
          landmarkName={uniqueLandmark.name}
          landmarkImage={uniqueLandmark.picture}
          gameSessionName={gameSessionName}
          gameSessionId={"your_game_session_id"} // Passa l'ID della sessione
          onClose={() => {
            setConfirmationVisible(false);
            onClose();
          }}
          onCompleteUniqueLandmark={handleCompleteUniqueLandmark}
          onUpdateGameSession={(gameSessionId, allLandmarksFound) => {}}
        />
      )}
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
    justifyContent: "center", // Center the title
    width: "100%",
    marginBottom: hp(2),
    position: "relative", // For absolute positioning of close button
  },
  title: {
    fontSize: normalize(20),
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    padding: normalize(5),
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
  disabledFeatureButton: {
    backgroundColor: "#999",
    opacity: 0.5,
  },
  disabledButtonLabel: {
    color: "#999",
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
  questionContainer: {
    alignItems: "center",
    marginVertical: hp(4.66), // Match LandmarkPopup's spacing
  },
  compositeIcon: {
    zIndex: 1,
    position: "relative",
    width: normalize(36),
    height: normalize(36),
    justifyContent: "center",
    alignItems: "center",
    left: wp(-13.7), // Sposta leggermente a sinistra
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
    top: "35%",
    left: "56%",
    transform: [{ translateX: -normalize(6) }, { translateY: -normalize(6) }],
  },
  hintHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: -hp(2),
    marginLeft: wp(12),
  },
  hintTitle: {
    zIndex: 1,
    fontSize: normalize(22),
    fontWeight: "bold",
    color: "black",
    marginLeft: wp(-15.5),
    top: hp(-0.6),
  },
  hintContainer: {
    width: "100%",
    flex: 1,
    marginTop: hp(4.9),
    marginBottom: hp(8),
    paddingRight: wp(0),
  },
  hintText: {
    fontSize: normalize(18),
    textAlign: "justify",
    color: "black",
    lineHeight: normalize(20),
    marginTop: hp(1.8),
    letterSpacing: -1,
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
  buttonContainer: {
    position: "absolute",
    bottom: hp(4),
    width: "100%",
    alignItems: "center",
  },
  nextButton: {
    width: wp(75),
    padding: hp(2),
    borderRadius: normalize(10),
    marginBottom: hp(-2.2),
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
  centeredPopup: {
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
  okButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalize(16),
  },
  extraTitle: {
    fontSize: normalize(20),
    fontWeight: "700",
    marginBottom: normalize(15),
    textAlign: "center",
    color: "#222222",
  },
  extraText: {
    fontSize: normalize(18),
    textAlign: "justify", // Allinea il testo giustificato
    lineHeight: normalize(24), // Migliora la leggibilità aumentando l'interlinea
    marginBottom: normalize(25), // Spazio inferiore più ampio
    color: "#555", // Colore del testo più scuro per contrasto
    width: "100%",
  },
  okButton: {
    backgroundColor: "#007BFF",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: normalize(10),
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
  buttonContainer1: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: hp(2), // Aggiunge spazio sopra il contenitore
  },
  cancelButton: {
    flex: 1,
    paddingVertical: hp(2), // Adatta l'altezza dinamicamente
    marginHorizontal: wp(2), // Margine più proporzionato
    backgroundColor: "#007BFF",
    borderRadius: normalize(10),
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalize(16), // Dimensione del testo dinamica
  },
  confirmButton: {
    flex: 1,
    paddingVertical: hp(2), // Adatta l'altezza dinamicamente
    marginHorizontal: wp(2), // Margine più proporzionato
    backgroundColor: "#DC3545",
    borderRadius: normalize(10),
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalize(16), // Dimensione del testo dinamica
  },
});

export default UniqueLandmarkPopup;
