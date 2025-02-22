import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Modal from "react-native-modal";
import { FontAwesome5 } from "@expo/vector-icons";
import { normalize, wp, hp } from "../utils/dimensions";
import { Dimensions } from "react-native";

const { height: deviceHeight, width: deviceWidth } = Dimensions.get("screen");

type SelectGameSessionPopupProps = {
  isVisible: boolean; // Stato per visibilità del popup
  onClose: () => void; // Funzione per chiudere il popup
  onAdd: () => void; // Funzione per aggiungere la sessione
  gameSessionName: string; // Nome della sessione mostrata
  landmarksCount: number; // Numero di landmarks
  gameSessionPicture: any; // URL o path dell'immagine della sessione
};

const SelectGameSessionPopup: React.FC<SelectGameSessionPopupProps> = ({
  isVisible,
  onClose,
  onAdd,
  gameSessionName,
  landmarksCount,
  gameSessionPicture,
}) => {
  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.5}
      statusBarTranslucent={true}
      deviceHeight={deviceHeight} // Usa l'altezza dello schermo
      deviceWidth={deviceWidth} // Usa la larghezza dello schermo
      coverScreen={true}
      onBackdropPress={onClose}
    >
      <View style={styles.container}>
        {/* Header con la "X" per chiudere */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{gameSessionName}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome5 name="times" size={normalize(22)} color="#DC3545" />
          </TouchableOpacity>
        </View>

        {/* Immagine della sessione */}
        <View style={styles.imageContainer}>
          <Image
            source={gameSessionPicture}
            style={styles.image}
            resizeMode="center"
          />
        </View>

        {/* Messaggio principale */}
        <Text style={styles.message}>
          There are {landmarksCount} landmarks to discover!
        </Text>

        <Text style={styles.subMessage}>
          Do you want to add this game in the list of your current games?
        </Text>

        {/* Pulsanti Add e Cancel */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={onAdd}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
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
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
    position: "relative",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: wp(10), // Make space for the close button
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
  imageContainer: {
    width: wp(80),
    height: hp(22),
    borderRadius: normalize(15),
    overflow: "hidden",
    marginBottom: hp(2),
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  message: {
    marginTop: hp(2),
    fontSize: normalize(19),
    fontWeight: "600",
    textAlign: "center",
    marginBottom: hp(1),
  },
  subMessage: {
    marginTop: hp(0.5),
    fontSize: normalize(17),
    color: "#666",
    textAlign: "center",
    marginBottom: hp(3),
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  addButtonContainer: {
    position: "absolute",
    bottom: hp(3),
    left: wp(5),
    right: wp(5),
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(-1),
  },
  addButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    marginHorizontal: wp(1.5),
    backgroundColor: "#007BFF",
    borderRadius: normalize(10),
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    marginHorizontal: wp(1.5),
    backgroundColor: "#DC3545",
    borderRadius: normalize(10),
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: normalize(18),
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "white",
    fontSize: normalize(18),
    fontWeight: "bold",
  },
});

export default SelectGameSessionPopup;
