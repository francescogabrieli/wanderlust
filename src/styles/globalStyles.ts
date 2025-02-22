import { StyleSheet, Platform, StatusBar } from "react-native";

export const globalStyles = StyleSheet.create({
	safeArea: {
		flex: 1,
		paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
		backgroundColor: "#fff",
	},
	container: {
		flex: 1,
	},
	overlay: {
		position: "absolute",
		bottom: 20,
		left: 10,
		right: 10,
		alignItems: "center",
	},
	infoBar: {
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		borderRadius: 10,
		padding: 10,
		width: "90%",
	},
	userName: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	userLevel: {
		color: "#fff",
		fontSize: 16,
	},
	button: {
		marginTop: 20,
		backgroundColor: "#007BFF",
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 20,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},

	
} as const);
