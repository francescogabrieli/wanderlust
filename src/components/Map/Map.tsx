import React, { useRef, useEffect } from "react";
import { Image, StyleProp, ViewStyle } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { customMapStyle } from "@/constants/mapStyles";
import { mapStyles } from "./MapStyles";
import { Coordinates } from "@/types/map";
import { assets } from "@/constants/assets";
import { MAP_CONFIG } from "@/constants/map";
import type { Camera } from 'react-native-maps';
import { PROVIDER_DEFAULT } from 'react-native-maps';
import { PROVIDER_GOOGLE } from "react-native-maps";

interface MapProps {
	mapRef: React.RefObject<MapView>;
	location: Coordinates;
	heading: number;
	children?: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	target?: Coordinates; // Add this prop
	onRegionChange?: (region: Region) => void;
}

const Map: React.FC<MapProps> = ({
	mapRef,
	location,
	heading,
	children,
	style,
	onRegionChange,
	target,
}) => {
	useEffect(() => {
		if (mapRef.current) {
			const targetLocation = target || location;
			mapRef.current.animateCamera({
				center: {
					latitude: targetLocation.latitude,
					longitude: targetLocation.longitude,
				},
				pitch: MAP_CONFIG.INITIAL_PITCH,
				heading: heading, // Add 180 degrees to look from behind
				zoom: MAP_CONFIG.INITIAL_ZOOM,
				altitude: MAP_CONFIG.INITIAL_ALTITUDE,
				duration: 500, // Add smooth transition duration
			} as Partial<Camera> & { duration: number });
		}
	}, [location, target, heading]);

	return (
		<MapView
			ref={mapRef}
			style={[mapStyles.map, style]}
			provider={PROVIDER_GOOGLE}
			customMapStyle={customMapStyle}
			showsCompass={false}
			mapPadding={MAP_CONFIG.PADDING}
			showsBuildings={false}
			onRegionChange={onRegionChange}
			initialRegion={{
				latitude: location.latitude,
				longitude: location.longitude,
				latitudeDelta: MAP_CONFIG.DELTA.LATITUDE,
				longitudeDelta: MAP_CONFIG.DELTA.LONGITUDE,
			}}
			scrollEnabled={false}
			zoomEnabled={false}
			pitchEnabled={false}
			rotateEnabled={false}
			moveOnMarkerPress={false}
			followsUserLocation={true}
			userLocationUpdateInterval={10000}
		>
			{/* <Marker
				coordinate={location}
				anchor={{ x: 0.5, y: 0.5 }}
				rotation={heading}
			>
				<Image
					source={assets.images.biker}
					style={{
						width: 40,
						height: 35,
						resizeMode: "contain",
						transform: [{ rotate: `${heading}deg` }],
					}}
				/>
			</Marker> */}

			 {children} 
		</MapView>
	);
};

export default Map;
