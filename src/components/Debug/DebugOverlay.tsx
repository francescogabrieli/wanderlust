import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Coordinates } from "@/types/map";
import { ModelDebug } from "@/types/debug";

interface DebugOverlayProps {
	location: Coordinates;
	heading: number;
	speed: number | null;
	accuracy: number | null;
	modelDebug: ModelDebug;
}

const formatPosition = (pos: { x: number; z: number }) => ({
	x: Number(pos.x.toFixed(4)),
	z: Number(pos.z.toFixed(4)),
});

const DebugOverlay: React.FC<DebugOverlayProps> = ({
	location,
	heading,
	speed,
	accuracy,
	modelDebug,
}) => {
	return (
		<View style={styles.debugContainer}>
			<Text style={styles.debugText}>Lat: {location.latitude.toFixed(6)}</Text>
			<Text style={styles.debugText}>Lng: {location.longitude.toFixed(6)}</Text>
			<Text style={styles.debugText}>Heading: {heading.toFixed(2)}°</Text>
			<Text style={styles.debugText}>
				Speed: {speed ? `${(speed * 3.6).toFixed(2)} km/h` : "N/A"}
			</Text>
			<Text style={styles.debugText}>
				Accuracy: {accuracy ? `${accuracy.toFixed(2)}m` : "N/A"}
			</Text>
			{modelDebug && (
				<>
					<Text style={styles.debugText}>
						Model Status: {modelDebug.loading ? "Loading..." : "Ready"}
					</Text>
					{modelDebug.loading && (
						<Text style={styles.debugText}>
							Loading Progress: {modelDebug.progress}%
						</Text>
					)}
					{modelDebug.position && (
						<Text style={styles.debugText}>
							Model Position:{" "}
							{JSON.stringify(formatPosition(modelDebug.position))}
						</Text>
					)}
					{modelDebug.scale && (
						<Text style={styles.debugText}>
							Model Scale: {modelDebug.scale}
						</Text>
					)}
					{modelDebug.error && (
						<Text style={[styles.debugText, styles.errorText]}>
							{modelDebug.error}
						</Text>
					)}
				</>
			)}
		</View>
	);
};

export const styles = StyleSheet.create({
	debugContainer: {
		position: "absolute",
		top: 50,
		right: 10,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		padding: 10,
		borderRadius: 5,
		zIndex: 1000,
	},
	debugToggleButton: {
		position: "absolute",
		top: 10,
		right: 10,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		padding: 8,
		borderRadius: 5,
		zIndex: 999,
	},
	debugText: {
		color: "white",
		fontFamily: "monospace",
		fontSize: 12,
	},
	errorText: {
		color: "red",
	},
});

export default DebugOverlay;
