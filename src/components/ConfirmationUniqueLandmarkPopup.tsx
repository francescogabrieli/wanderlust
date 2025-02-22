import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Modal from "react-native-modal";
import { FontAwesome5 } from "@expo/vector-icons";
import { normalize, wp, hp } from "../utils/dimensions";
import { Dimensions } from "react-native";

const { height: deviceHeight, width: deviceWidth } = Dimensions.get("screen");

type ConfirmationUniqueLandmarkPopupProps = {
  isVisible: boolean;
  landmarkName: string;
  landmarkImage: any;
  gameSessionName: string;
  onClose: () => void;
  onCompleteUniqueLandmark: (landmarkName: string) => void; // Funzione per segnalare il completamento
  onUpdateGameSession: (
    gameSessionId: string,
    allLandmarksFound: boolean
  ) => void; // Funzione per aggiornare lo stato della sessione
  gameSessionId: string; // ID della GameSession
};

const ConfirmationUniqueLandmarkPopup: React.FC<
  ConfirmationUniqueLandmarkPopupProps
> = ({
  isVisible,
  landmarkName,
  landmarkImage,
  gameSessionName,
  onClose,
  onCompleteUniqueLandmark,
  onUpdateGameSession,
  gameSessionId,
}) => {
  const [selection, setSelection] = useState<boolean | null>(null);
  const [isExitConfirmationVisible, setExitConfirmationVisible] =
    useState(false);

  useEffect(() => {
    if (!isVisible) {
      // Reset state when popup is hidden
      setSelection(null);
      setExitConfirmationVisible(false);
    }
  }, [isVisible]);

  const handleSelection = (choice: boolean) => {
    setSelection(choice);
  };

  const handleEndPress = () => {
    if (selection === true) {
      onCompleteUniqueLandmark(landmarkName);
      onUpdateGameSession(gameSessionId, true);
      setSelection(null); // Reset selection
      onClose();
    } else if (selection === false) {
      onCompleteUniqueLandmark(landmarkName);
      onUpdateGameSession(gameSessionId, false);
      setSelection(null); // Reset selection
      onClose();
    } else {
      setExitConfirmationVisible(true); // Mostra il popup di conferma uscita
    }
  };

  const handleClose = () => {
    setExitConfirmationVisible(true); // Mostra il popup di conferma uscita solo per la "X"
  };

  const confirmExit = () => {
    setExitConfirmationVisible(false);
    setSelection(null); // Reset selection
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
        onBackdropPress={handleClose}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.modalTitle}>{gameSessionName}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
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
          <Text style={styles.questionText}>
            Do you find the unique landmark?
          </Text>

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
                styles.endButton,
                selection === null && styles.disabledButton,
              ]}
              onPress={handleEndPress}
              disabled={selection === null}
            >
              <Text
                style={[
                  styles.endButtonText,
                  selection === null && styles.disabledText,
                ]}
              >
                End
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Popup di conferma uscita */}
      <Modal
        isVisible={isExitConfirmationVisible}
        backdropOpacity={0.5}
        onBackdropPress={() => setExitConfirmationVisible(false)}
      >
        <View style={styles.extraPopup}>
          <Text style={styles.extraTitle}>Are you sure?</Text>
          <Text style={styles.extraText}>
            If you leave now, you will lose the chance to confirm the unique
            landmark.
          </Text>
          <View style={styles.buttonContainer1}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setExitConfirmationVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
    marginBottom: hp(2),
  },
  modalTitle: {
    fontSize: normalize(20),
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    right: 0,
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
    textShadowColor: "rgba(0, 0, 0, 0.75)", // Changed from rgba(196, 196, 196, 0.75) to match ConfirmationLandmarkPopup
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  questionText: {
    fontSize: normalize(18),
    fontWeight: "bold",
    marginBottom: hp(2),
    marginTop: hp(1),
    textAlign: "center",
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
  endButton: {
    padding: normalize(15),
    borderRadius: normalize(10),
    marginTop: hp(2),
    backgroundColor: "#DC3545",
    width: wp(75),
    height: hp(7),
    alignItems: "center",
    top: hp(1.1),
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  endButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalize(18),
  },
  disabledText: {
    color: "#aaa",
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
    fontWeight: "bold",
    marginBottom: normalize(10),
    textAlign: "center",
  },
  extraText: {
    fontSize: normalize(18),
    textAlign: "justify",
    lineHeight: 20,
    marginBottom: 20,
    color: "#333",
  },
  buttonContainer1: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: hp(2), // Aggiunge spazio sopra il contenitore
  },
  cancelButton: {
    flex: 1,
    paddingVertical: hp(2), // Altezza dinamica
    paddingHorizontal: wp(4), // Larghezza del padding dinamica
    marginHorizontal: wp(2), // Margine proporzionato
    backgroundColor: "#007BFF",
    borderRadius: normalize(10), // Angoli arrotondati dinamici
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalize(16), // Dimensione del testo adattiva
  },
  confirmButton: {
    flex: 1,
    paddingVertical: hp(2), // Altezza dinamica
    paddingHorizontal: wp(4), // Larghezza del padding dinamica
    marginHorizontal: wp(2), // Margine proporzionato
    backgroundColor: "#DC3545",
    borderRadius: normalize(10), // Angoli arrotondati dinamici
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: normalize(16), // Dimensione del testo adattiva
  },
});

export default ConfirmationUniqueLandmarkPopup;
