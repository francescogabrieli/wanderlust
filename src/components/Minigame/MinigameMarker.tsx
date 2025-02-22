import React from "react";
import { Marker } from "react-native-maps";
import { Image } from "react-native";
import { Coordinates } from "@/types/map";

type MinigameMarkerProps = {
  coordinate: Coordinates;
  gameId: string; // Assicurati che gameId sia dichiarato come string
  onPress: (gameId: string) => void; // Callback per gestire il click
  isDisabled: boolean; // Stato che indica se il marker è disabilitato
  isCompleted: boolean; // Nuova prop per indicare se la GameSession è completata
};

const MinigameMarker: React.FC<MinigameMarkerProps> = ({
  coordinate,
  gameId,
  onPress,
  isDisabled,
  isCompleted, // Nuova prop
}) => {
  const handlePress = () => {
    if (!isDisabled && !isCompleted) {
      onPress(gameId);
    }
  };

	return (
		<Marker coordinate={coordinate} onPress={handlePress}>
			{/* Cambia l'immagine in base allo stato di completamento */}
			<Image
				source={
					isCompleted
						? require("assets/images/markercoppa.png") // Immagine per sessione completata
						: require("assets/images/marker.png") // Immagine per sessione non completata
				}
				style={{
					width: 100,
					height: 100,
					resizeMode: "center",
					overflow: "visible",
					opacity: isDisabled ? 0.5 : 1, // Marker disabilitato più trasparente
				}}
			/>
		</Marker>
	);
};

export default MinigameMarker;
