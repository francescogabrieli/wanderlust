import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import Modal from "react-native-modal";
import { FontAwesome5 } from "@expo/vector-icons";
import { GameSession } from "@/models/GameSession";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalize, wp, hp } from "../utils/dimensions";
import { Dimensions } from "react-native";

const { height: deviceHeight, width: deviceWidth } = Dimensions.get("screen");

type GameSessionPopupProps = {
  isVisible: boolean;
  gameSessions: GameSession[];
  onClose: () => void;
  onRemove: (gameSession: GameSession) => void;
  onGameSessionPress: (gameSession: GameSession) => void;
};

const GameSessionPopup: React.FC<GameSessionPopupProps> = ({
  isVisible,
  gameSessions,
  onClose,
  onRemove,
  onGameSessionPress,
}) => {
  const [selectedGameSession, setSelectedGameSession] =
    useState<GameSession | null>(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);

  const showConfirmPopup = (gameSession: GameSession) => {
    setSelectedGameSession(gameSession);
    setIsConfirmVisible(true);
  };

  const handleConfirmRemove = async () => {
    if (selectedGameSession) {
      onRemove(selectedGameSession); // Rimuove la sessione e resetta il timer
    }
    setIsConfirmVisible(false);
    setSelectedGameSession(null);
  };

  const handleCancelRemove = () => {
    setIsConfirmVisible(false);
    setSelectedGameSession(null);
  };

  const toggleInfoModal = () => {
    setInfoModalVisible(!isInfoModalVisible);
  };

  return (
    <Modal
      isVisible={isVisible}
      hasBackdrop={true}
      backdropColor="black"
      backdropOpacity={0.5}
      statusBarTranslucent={true}
      deviceHeight={deviceHeight} // Usa l'altezza dello schermo
      deviceWidth={deviceWidth} // Usa la larghezza dello schermo
      coverScreen={true}
      onBackdropPress={onClose}
    >
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleInfoModal} style={styles.infoButton}>
            <FontAwesome5
              name="info-circle"
              size={normalize(22)}
              color="#007BFF"
            />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.modalTitle}>Current Game Sessions</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome5 name="times" size={normalize(24)} color="#DC3545" />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <FlatList
            data={gameSessions}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.gameSessionRow}>
                <TouchableOpacity
                  style={styles.gameSessionNameButton}
                  onPress={() => onGameSessionPress(item)}
                >
                  <Text style={styles.gameSessionText}>{item.name}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => showConfirmPopup(item)}
                >
                  <FontAwesome5
                    name="trash"
                    size={normalize(20)}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyCard}>
                  {/*
                  <FontAwesome5
                    name="gamepad"
                    size={normalize(40)}
                    color="#007BFF"
                  />
                  */}
                  <Text style={styles.emptyTitle}>
                    No Active Games Session!
                  </Text>
                  <Text style={[styles.emptySubtitle, styles.dontPanicText]}>
                    Don't panic!
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    You can add a game session anytime! Just find them on the
                    map and when you are ready, come back here to start
                    exploring the wander around you!
                  </Text>
                </View>
              </View>
            )}
          />
        </View>

        <Modal
          isVisible={isConfirmVisible}
          onBackdropPress={handleCancelRemove}
        >
          <View style={styles.confirmModal}>
            <Text style={styles.confirmText}>
              Are you sure you want to delete this session?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.confirmButtonNo}
                onPress={handleCancelRemove}
              >
                <Text style={styles.confirmButtonText}>Go Back!</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmRemove}
              >
                <Text style={styles.confirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Informativo */}
        <Modal
          isVisible={isInfoModalVisible}
          onBackdropPress={toggleInfoModal}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          style={styles.modal}
          useNativeDriver={true}
          statusBarTranslucent={true}
          coverScreen={true}
        >
          <View style={styles.modalContent1}>
            <View style={styles.modalHeader}>
              <FontAwesome5
                name="gamepad"
                size={normalize(40)}
                color="#007BFF"
              />
              <Text style={styles.modalTitle}>About Game Sessions</Text>
              <Text style={styles.modalSubtitle}>
                Learn how to manage your game sessions effectively.
              </Text>
            </View>

            <View style={styles.modalDivider} />

            <View style={styles.modalFeatures}>
              <View style={styles.modalItemContainer}>
                <View style={styles.iconContainer}>
                  <FontAwesome5
                    name="gamepad"
                    size={normalize(20)}
                    color="#007BFF"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.featureTitle}>Manage Sessions</Text>
                  <Text style={styles.modalText}>
                    You can start, track, and remove game sessions. Once a
                    session is completed, it cannot be restarted.
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
      </View>
    </Modal>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(5),
  },
  emptyCard: {
    width: wp(85),
    backgroundColor: "#FFF",
    borderRadius: normalize(15),
    padding: normalize(20),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    //elevation: 6,
  },
  emptyTitle: {
    fontSize: normalize(18),
    fontWeight: "bold",
    color: "#FF6F00",
    marginTop: hp(1.5),
    textAlign: "justify",
  },
  dontPanicText: {
    fontWeight: "bold", // Grassetto
    fontSize: normalize(18), // Stessa dimensione del testo generale
    color: "#7f8c8d", // Stesso colore del testo generale
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: normalize(16),
    color: "#7f8c8d",
    textAlign: "justify",
    marginTop: hp(1),
    lineHeight: normalize(22),
    width: wp(55),
  },
  emptyText: {
    fontSize: normalize(18),
    fontWeight: "bold",
    color: "#888",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: hp(2),
    position: "relative",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: wp(2),
  },
  modalTitle: {
    fontSize: normalize(20),
    fontWeight: "bold",
    textAlign: "center",
  },
  infoButton: {
    padding: wp(1),
  },
  closeButton: {
    padding: normalize(5),
  },
  listContainer: {
    flex: 1,
    width: "100%",
    maxHeight: hp(50),
    marginTop: hp(2.5), // AUMENTATO per abbassare la lista
    marginBottom: hp(2),
  },
  gameSessionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  gameSessionNameButton: {
    flex: 1,
    paddingVertical: hp(1.5), // RIDOTTO per diminuire l'altezza
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: normalize(10),
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2),
  },
  gameSessionText: {
    fontSize: normalize(18),
    fontWeight: "bold",
    color: "#000",
  },
  deleteButton: {
    width: normalize(50),
    height: normalize(50),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DC3545",
    borderRadius: normalize(10),
  },
  confirmModal: {
    width: wp(85),
    backgroundColor: "white",
    borderRadius: normalize(20),
    padding: normalize(20),
    alignItems: "center",
    borderWidth: 1,
    alignSelf: "center", // Centra orizzontalmente
    justifyContent: "center", // Centra verticalmente il contenuto
    position: "absolute", // Assicura che non si allarghi all'intero schermo
  },
  confirmText: {
    fontSize: normalize(18),
    marginBottom: hp(2),
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
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
  },
  confirmButtonNo: {
    flex: 1,
    paddingVertical: hp(2),
    marginHorizontal: wp(2),
    backgroundColor: "#007BFF",
    borderRadius: normalize(10),
    alignItems: "center",
  },
  modal: {
    margin: 0, // Elimina qualsiasi margine esterno
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.2)", // Sfondo scuro traslucido
  },

  modalContent1: {
    width: "100%",
    height: hp(45), // Altezza responsiva del contenuto
    backgroundColor: "white",
    borderTopLeftRadius: normalize(20), // Angoli arrotondati solo in alto
    borderTopRightRadius: normalize(20),
    padding: normalize(20), // Padding interno
    justifyContent: "space-between",
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
  gotItButton: {
    backgroundColor: "#007BFF",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(35),
    borderRadius: normalize(20),
    alignSelf: "center",
    width: "100%",
  },

  gotItButtonText: {
    color: "white",
    fontSize: normalize(16),
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default GameSessionPopup;
