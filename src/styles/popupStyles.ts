import { StyleSheet, Platform, StatusBar } from "react-native";

export const popupStyles = StyleSheet.create({
    baseModalContent: {
      width: "100%", // Adattabile alla larghezza dello schermo
      height: "80%", // Altezza standard
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      justifyContent: "flex-start",
      borderWidth: 2,
      borderColor: "#DDD",
    },
  });
  