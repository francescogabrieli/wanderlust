import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome5 } from "@expo/vector-icons";
import { Landmark } from "@/models/Landmark";
import { generateDynamicGameSessions } from "@/constants/data";
import { normalize, wp, hp } from "../utils/dimensions";

import { Dimensions } from "react-native";

const { height: deviceHeight, width: deviceWidth } = Dimensions.get("screen");

type AddLandmarkPopupProps = {
  isVisible: boolean;
  onClose: () => void;
  onAdd: (landmark: Landmark) => void;
  currentLatitude: number | null;
  currentLongitude: number | null;
  onLandmarkAdded?: () => void;
  onExperienceGain?: (experience: number) => void;
};

const AddLandmarkPopup: React.FC<AddLandmarkPopupProps> = ({
  isVisible,
  onClose,
  onAdd,
  currentLatitude,
  currentLongitude,
  onLandmarkAdded,
  onExperienceGain,
}) => {
  const [landmarkName, setLandmarkName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isCloseConfirmVisible, setIsCloseConfirmVisible] = useState(false);
  const [isImagePickerVisible, setImagePickerVisible] = useState(false);
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [isPositionRefreshed, setIsPositionRefreshed] = useState(false);
  const initialLatitude = useRef<number | null>(null);
  const initialLongitude = useRef<number | null>(null);

  const resetFields = () => {
    setLandmarkName("");
    setPhotoUri(null);
    setLatitude(null);
    setLongitude(null);
    setNameConfirmed(false);
  };

  useEffect(() => {
    if (isVisible) {
      //Set coordinates only when popup is open without update
      if (
        initialLatitude.current === null &&
        initialLongitude.current === null
      ) {
        initialLatitude.current = currentLatitude;
        initialLongitude.current = currentLongitude;
      }
      setLatitude(initialLatitude.current);
      setLongitude(initialLongitude.current);
    } else {
      // Resetta le coordinate quando il popup si chiude
      resetFields();
      initialLatitude.current = null;
      initialLongitude.current = null;
    }
  }, [isVisible]);

  const handleSelectImage = () => {
    setImagePickerVisible(true);
  };

  const handleTakePhoto = async () => {
    setImagePickerVisible(false);
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      Alert.alert(
        "Permission Denied",
        "Camera access is required to take a photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleChooseFromLibrary = async () => {
    setImagePickerVisible(false);
    const galleryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!galleryPermission.granted) {
      Alert.alert(
        "Permission Denied",
        "Gallery access is required to select a photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setPhotoUri(null);
  };

  const handleClose = () => {
    // Controlla se ci sono altri campi compilati o se la posizione è stata refreshata almeno una volta
    const isAnyFieldFilled = landmarkName || photoUri;
    const shouldShowWarning = isAnyFieldFilled || isPositionRefreshed;

    if (shouldShowWarning) {
      setIsCloseConfirmVisible(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setIsCloseConfirmVisible(false);
    setPhotoUri(null);
    setLandmarkName("");
    setIsPositionRefreshed(false);
    onClose();
  };

  const handleUseCurrentPosition = () => {
    setLatitude(currentLatitude);
    setLongitude(currentLongitude);
    setIsPositionRefreshed(true);
  };

  const handleNameInput = (text: string) => {
    setLandmarkName(text);
    if (text.trim().length >= 4) {
      setNameConfirmed(true);
    } else {
      setNameConfirmed(false);
    }
  };

  const handleNameConfirm = () => {
    if (landmarkName.trim()) {
      setNameConfirmed(true);
    }
  };

  const handleAddLandmark = async () => {
    if (landmarkName.trim() && latitude && longitude && photoUri) {
      const newLandmark = new Landmark(
        Date.now().toString(),
        landmarkName,
        latitude,
        longitude,
        photoUri,
        "Default hint",
        "Default extra hint",
        false
      );

      const { landmarks } = generateDynamicGameSessions({
        latitude: currentLatitude ?? 0,
        longitude: currentLongitude ?? 0,
      });

      const updatedLandmarks = [...landmarks, newLandmark];

      console.log("Aggiunto:", newLandmark);

      resetFields();
      setPhotoUri(null);
      setLandmarkName("");
      setIsPositionRefreshed(false);
      onClose();

      setTimeout(() => {
        if (onLandmarkAdded) {
          onLandmarkAdded();
        }
      }, 500);
    } else {
      Alert.alert(
        "Error",
        "Please fill all the fields before adding a landmark."
      );
    }
  };

  const handleShowConfirm = () => {
    setIsConfirmVisible(true);
  };

  const handleCancelConfirm = () => {
    setIsConfirmVisible(false);
  };

  const handleConfirmAdd = () => {
    handleAddLandmark();
    setIsConfirmVisible(false);
  };
  const handleCancelClose = () => {
    setIsCloseConfirmVisible(false);
  };
  const toggleInfoModal = () => {
    setInfoModalVisible(!isInfoModalVisible);
  };

  return (
    <Modal
      isVisible={isVisible}
      hasBackdrop={true}
      backdropOpacity={0.5}
      onBackdropPress={handleClose}
      deviceHeight={deviceHeight} // Usa l'altezza dello schermo
      deviceWidth={deviceWidth} // Usa la larghezza dello schermo
      statusBarTranslucent={true}
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.modalTitle}>Add Landmark</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <FontAwesome5 name="times" size={normalize(24)} color="#dc3545" />
          </TouchableOpacity>
        </View>

        {/* Modal Informativo */}
        <Modal
          isVisible={isInfoModalVisible}
          onBackdropPress={toggleInfoModal}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          style={styles.modal}
          backdropOpacity={0.5}
          useNativeDriver={true}
          statusBarTranslucent={true}
          coverScreen={true}
        >
          <View style={styles.infoModalContent}>
            <View style={styles.modalHeader}>
              <FontAwesome5
                name="map-marked-alt"
                size={normalize(40)}
                color="#007BFF"
              />
              <Text style={styles.modalTitle}>About Location Field</Text>
              <Text style={styles.modalSubtitle}>
                Learn how to use the location feature to fetch and refresh
                coordinates.
              </Text>
            </View>

            <View style={[styles.modalDivider, { borderBottomWidth: 1.5 }]} />

            <View style={styles.modalFeatures}>
              <View style={styles.modalItemContainer}>
                <View style={styles.iconContainer}>
                  <FontAwesome5
                    name="map-marker-alt"
                    size={normalize(20)}
                    color="#007BFF"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.featureTitle}>Use Location</Text>
                  <Text style={styles.modalText}>
                    To better locate the landmark you can refresh your position
                    using the button below.
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.gotItButton}
              onPress={toggleInfoModal}
            >
              <Text style={styles.gotItButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Placeholder immagine */}
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            {photoUri && (
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
              >
                <FontAwesome5 name="times" style={styles.removeIcon} />
              </TouchableOpacity>
            )}
            <Image
              source={
                photoUri
                  ? { uri: photoUri }
                  : require("@assets/images/camera-placeholder.png")
              }
              style={photoUri ? styles.uploadedImage : styles.placeholderImage}
            />
          </View>
          {!photoUri && (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handleSelectImage}
            >
              <FontAwesome5 name="plus" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Nome del Landmark */}
        <Text style={styles.label}>Name</Text>
        <View style={styles.nameInputContainer}>
          <TextInput
            placeholder="Enter landmark name"
            value={landmarkName}
            onChangeText={handleNameInput}
            onSubmitEditing={handleNameConfirm}
            onBlur={handleNameConfirm}
            style={styles.textInput}
            placeholderTextColor="#888"
          />
          {nameConfirmed && (
            <FontAwesome5
              name="check-circle"
              size={20}
              color="green"
              style={styles.confirmIcon}
            />
          )}
        </View>

        {/* Modal personalizzato per selezionare immagine */}
        <Modal
          isVisible={isImagePickerVisible}
          onBackdropPress={() => setImagePickerVisible(false)}
          backdropOpacity={0.5}
          statusBarTranslucent={true}
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <View style={styles.customModal}>
            <Text style={styles.subModalTitle}>Choose an action</Text>

            <TouchableOpacity
              style={styles.takePhotoButton}
              onPress={handleTakePhoto}
            >
              <FontAwesome5
                name="camera"
                size={20}
                color="white"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.libraryButton}
              onPress={handleChooseFromLibrary}
            >
              <FontAwesome5
                name="images"
                size={20}
                color="white"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.buttonText}>Choose from Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setImagePickerVisible(false)}
            >
              <FontAwesome5
                name="times"
                size={20}
                color="white"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Posizione corrente */}
        <View style={styles.positionSection}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Use Current Position</Text>
            <TouchableOpacity
              onPress={toggleInfoModal}
              style={styles.inlineInfoButton}
            >
              <FontAwesome5 name="info-circle" size={normalize(20)} color="#007BFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.positionContainer}>
            <TouchableOpacity
              style={styles.positionButton}
              onPress={handleUseCurrentPosition}
            >
              <FontAwesome5 name="map-marker-alt" size={24} color="white" />
            </TouchableOpacity>
            <View
              style={[
                styles.positionDisplay,
                latitude && longitude ? styles.positionHighlight : null,
              ]}
            >
              <Text
                style={[
                  styles.positionText,
                  { color: latitude && longitude ? "#555" : "#000" },
                ]}
              >
                {latitude && longitude
                  ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                  : "No position selected"}
              </Text>
              {/* Pulsante "X" per rimuovere le coordinate */}
              {latitude && longitude && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    setLatitude(null);
                    setLongitude(null);
                  }}
                >
                  <FontAwesome5 name="times" style={styles.removeIcon} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Pulsante Add */}
        <TouchableOpacity
          style={[
            styles.addButton,
            nameConfirmed && latitude && longitude && photoUri
              ? styles.enabledButton
              : styles.disabledButton,
          ]}
          onPress={handleShowConfirm}
          disabled={!(nameConfirmed && latitude && longitude && photoUri)}
        >
          <FontAwesome5
            name="check"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>

        {/* Modal di conferma */}
        <Modal
          isVisible={isConfirmVisible}
          onBackdropPress={handleCancelConfirm}
        >
          <View style={styles.confirmModal}>
            <Text style={styles.confirmText}>
              Are you sure you want to add this landmark?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmAdd}
              >
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButtonNo}
                onPress={handleCancelConfirm}
              >
                <Text style={styles.confirmButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal di conferma chiusura */}
        <Modal
          isVisible={isCloseConfirmVisible}
          onBackdropPress={handleCancelClose}
        >
          <View style={styles.confirmModal}>
            <Text style={styles.confirmText}>
              Are you sure? If you close, you will lose changes.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmClose}
              >
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButtonNo}
                onPress={handleCancelClose}
              >
                <Text style={styles.confirmButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    width: wp(90),
    maxHeight: hp(60),
    backgroundColor: "white",
    paddingHorizontal: wp(5),
    paddingTop: wp(2),
    paddingBottom: hp(8), // Increased padding for button space
    borderRadius: wp(5),
    elevation: 5,
    borderWidth: 1,
    justifyContent: "flex-start",
    alignSelf: "center",
    position: "relative", // Added for absolute positioning
  },
  header: {
    position: "relative",
    width: "100%",
    height: hp(4), // Reduced header height
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2), // Added margin bottom for spacing
    marginTop: hp(0.8), // Spazio superiore più ampio
  },
  closeButton: {
    position: "absolute",
    right: wp(0),
    top: "50%",
    transform: [{ translateY: -hp(1.2) }],
  },
  modalTitle: {
    fontSize: normalize(20),
    fontWeight: "bold",
    textAlign: "center",
  },
  subModalTitle: {
    fontSize: normalize(18),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp(2.5),
  },
  imageContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 0, // Removed top margin
    marginBottom: hp(1.2),
  },
  imageWrapper: {
    width: wp(80),
    aspectRatio: 16 / 9,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: wp(2.5),
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    position: "relative",
  },
  placeholderImage: {
    width: "50%",
    height: "50%",
    resizeMode: "contain",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  addImageButton: {
    backgroundColor: "#007BFF",
    borderRadius: wp(6.25),
    width: wp(12.5),
    height: wp(12.5),
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -hp(3),
    alignSelf: "center",
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
    backgroundColor: "transparent",
    padding: 0,
    color: "#ccc",
  },
  removeButton: {
    position: "absolute",
    right: wp(2), // Fixed distance from right
    alignSelf: "center", // Center vertically
    padding: wp(1), // Add some touch area
    backgroundColor: "transparent",
  },
  removeIcon: {
    fontSize: 20,
    color: "#888",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: normalize(14),
    fontWeight: "bold",
    marginTop: hp(1.2),
    marginBottom: hp(0.6),
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: wp(2.5),
    padding: wp(2.5),
    height: hp(6),
  },
  nameInputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.8),
  },
  confirmIcon: {
    marginLeft: 10,
    alignSelf: "center",
  },
  positionSection: {
    marginTop: hp(-0.6),
  },
  positionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(6), // Increased to make space for button
  },
  positionButton: {
    backgroundColor: "#007BFF",
    borderRadius: wp(6.25),
    width: wp(10),
    height: wp(10),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2.5),
  },
  positionDisplay: {
    flex: 1,
    borderWidth: 1,
    borderRadius: wp(2.5),
    padding: wp(2.5),
    height: hp(6),
    backgroundColor: "#d3d3d3",
    borderColor: "#ccc",
    justifyContent: "center",
    flexDirection: "row", // Added to align text and X button
    alignItems: "center", // Center vertically
    position: "relative", // For proper X button positioning
  },
  positionHighlight: {
    backgroundColor: "#d4edda",
    borderColor: "#28a745",
  },
  positionText: {
    color: "#555",
    flex: 1, // Take remaining space
  },
  addButton: {
    position: "absolute",
    bottom: hp(2), // Fixed distance from bottom
    left: wp(5),
    right: wp(5),
    height: hp(6), // Fixed height
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp(2.5),
    backgroundColor: "#007BFF",
    paddingHorizontal: wp(4),
  },
  enabledButton: {
    backgroundColor: "#007BFF",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  confirmModal: {
    width: wp(85),
    backgroundColor: "white",
    borderRadius: wp(5),
    padding: wp(5),
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: "flex-start",
    borderWidth: 1,
  },
  confirmText: {
    fontSize: normalize(16),
    marginBottom: hp(2.5),
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmButton: {
    flex: 1,
    padding: hp(1.2),
    marginHorizontal: wp(2.5),
    backgroundColor: "#007BFF",
    borderRadius: wp(2.5),
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  confirmButtonNo: {
    flex: 1,
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: "#DC3545",
    borderRadius: 10,
    alignItems: "center",
  },
  customModal: {
    width: wp(85),
    backgroundColor: "white",
    borderRadius: wp(5),
    padding: wp(5),
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
  },
  takePhotoButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  libraryButton: {
    backgroundColor: "#28A745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#DC3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  inlineInfoButton: {
    marginLeft: 6,
    marginBottom: -6,
  },
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  infoModalContent: {
    backgroundColor: "white",
    padding: wp(6),
    paddingTop: hp(3),
    paddingBottom: hp(4),
    borderTopLeftRadius: normalize(30),
    borderTopRightRadius: normalize(30),
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: normalize(-4),
    },
    shadowOpacity: 0.25,
    shadowRadius: normalize(4),
    elevation: 5,
  },
  gotItButton: {
    backgroundColor: "#007BFF",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(7.5),
    borderRadius: normalize(25),
    width: "100%",
    marginTop: hp(3),
  },
  gotItButtonText: {
    color: "white",
    fontSize: normalize(16),
    fontWeight: "bold",
    textAlign: "center",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: hp(2.5),
  },
  modalSubtitle: {
    fontSize: normalize(16),
    color: "#7f8c8d",
    marginTop: hp(0.6),
  },
  modalDivider: {
    height: hp(0.1),
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1.5,
    width: "100%",
    marginVertical: hp(1.9),
  },
  modalFeatures: {
    width: "100%",
    marginTop: hp(1.2),
    top: hp(0.8),
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
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0),
  },
  infoModal: {
    margin: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AddLandmarkPopup;
