import React, {
	Suspense,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { StyleSheet } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber/native";
import * as THREE from "three";
import { useGLTF, PerspectiveCamera } from "@react-three/drei/native";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { Coordinates } from "@/types/map";
import { assets } from "@/constants/assets";
import MapView, { Camera, Region } from "react-native-maps";
import { ModelDebug } from "@/types/debug";
import { MAP_CONFIG } from "@/constants/map";

interface Player3DOverlayProps {
	heading: number;
	location: Coordinates;
	mapRef: React.RefObject<MapView>;
	region: Region | null;
	onDebugUpdate: (debug: ModelDebug) => void;
	modelVisible?: boolean;
}

interface ModelProps {
	heading: number;
	region: Region | null;
	onDebugUpdate: (debug: ModelDebug) => void;
	modelVisible?: boolean;
}

type ObjectMap = {
	nodes: { [key: string]: THREE.Mesh };
	materials: { [key: string]: THREE.Material };
};

interface AnimateCameraOptions extends Partial<Camera> {
	duration?: number;
}

type GLTFResult = GLTF & ObjectMap;

function Model({ heading, region, onDebugUpdate, modelVisible }: ModelProps) {
	const group = useRef<THREE.Group>(null!);
	const originRef = useRef<Coordinates | null>(null);
	const isLoading = useRef(true);
	const lastHeading = useRef(heading);
	const lastTilt = useRef(0);
	const lastVelocity = useRef(0);
	const targetTilt = useRef(0);

	const gltf = useGLTF(assets.models.cyclist) as unknown as GLTFResult;

	useEffect(() => {
		if (gltf.scene && isLoading.current) {
			onDebugUpdate({ loading: true, progress: 0 });

			isLoading.current = false;
			onDebugUpdate({ loading: false, progress: 100 });
		}
	}, [gltf.scene]);

	useEffect(() => {
		if (!originRef.current && region) {
			originRef.current = {
				latitude: region.latitude,
				longitude: region.longitude,
			};
			console.debug("[Model] Map center set as origin:", originRef.current);
		}
	}, [region]);

	const updateModelTransform = useCallback(() => {
		if (!group.current) return;

		 // Much more aggressive smoothing for heading rotation
		const targetRotation = (heading * Math.PI) / 180;
		const currentRotation = THREE.MathUtils.lerp(
			lastHeading.current,
			targetRotation,
			0.005 // Super smooth rotation (from 0.02 to 0.005)
		);

		// Calculate turn velocity with enhanced smoothing
		const turnVelocity = (currentRotation - lastHeading.current); // Removed multiplier
		const smoothedVelocity = THREE.MathUtils.lerp(
			lastVelocity.current,
			turnVelocity,
			0.01 // Extremely smooth velocity changes (from 0.03 to 0.01)
		);

		// Update stored values
		lastHeading.current = currentRotation;
		lastVelocity.current = smoothedVelocity;

		// Calculate tilt with very gentle sensitivity
		const maxTilt = Math.PI / 12; // Even less extreme tilting (from PI/8 to PI/12)
		targetTilt.current = -smoothedVelocity * 0.75; // Reduced tilt multiplier
		targetTilt.current = THREE.MathUtils.clamp(
			targetTilt.current,
			-maxTilt,
			maxTilt
		);

		// Super smooth tilt transitions
		const currentTilt = THREE.MathUtils.lerp(
			lastTilt.current,
			targetTilt.current,
			0.008 // Ultra-smooth tilting (from 0.02 to 0.008)
		);
		lastTilt.current = currentTilt;

		// Apply rotations
		group.current.rotation.y = currentRotation;
		group.current.rotation.z = currentTilt;

		onDebugUpdate({
			loading: false,
			progress: 100,
			position: { x: 0, z: 0 },
			scale: 0.016,
			tilt: THREE.MathUtils.radToDeg(currentTilt),
		});
	}, [heading]);

	useFrame(updateModelTransform);

	if (!gltf.scene) {
		onDebugUpdate({
			loading: false,
			progress: 0,
			error: "No scene found in GLTF model",
		});
		return null;
	}

	return (
		<group ref={group}>
			<primitive 
				object={gltf.scene} 
				position={[0, modelVisible ? 0 : 100, 0]} // Hide model by moving it up when not visible
			/>
		</group>
	);
}

export const Player3D: React.FC<Player3DOverlayProps> = ({
	heading,
	location,
	mapRef,
	region,
	onDebugUpdate,
	modelVisible = true, // Default to visible
}) => {
	const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
	const lastHeading = useRef(heading);

	const CAMERA_PITCH = 35;
	const CAMERA_DISTANCE = 25;
	const CAMERA_HEIGHT = 3;

	// Calculate camera position to be behind the model
	// Increase smoothing factor for camera movement
	const currentHeading = THREE.MathUtils.lerp(
		lastHeading.current, 
		heading, 
		0.01 // Much smoother camera follow (from 0.05 to 0.01)
	);
	lastHeading.current = currentHeading;

	// Offset camera 180 degrees to be behind the model
	const bearingRad = -((-currentHeading + 90) * Math.PI) / 180;
	const elevationRad = ((90 - CAMERA_PITCH) * Math.PI) / 180;
	const radius = CAMERA_DISTANCE;

	const cameraX = radius * Math.sin(elevationRad) * Math.sin(bearingRad);
	const cameraY = radius * Math.cos(elevationRad);
	const cameraZ = radius * Math.sin(elevationRad) * Math.cos(bearingRad);

	useEffect(() => {
		if (cameraRef.current) {
			cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0));
		}
	}, [cameraX, cameraY, cameraZ]);

	return (
		<Canvas
			style={styles.canvas}
			gl={{
				antialias: true,
				alpha: true,
				preserveDrawingBuffer: false,
			}}
		>
			<Suspense fallback={null}>
				<PerspectiveCamera
					ref={cameraRef}
					makeDefault
					fov={60}
					near={0.1}
					far={100}
					up={[0, 1, 0]}
					position={[cameraX, cameraY, cameraZ]}
				/>
				<ambientLight intensity={0.8} />
				<directionalLight position={[0, CAMERA_HEIGHT, 0]} intensity={4} />
				<Model
					heading={heading}
					region={region}
					onDebugUpdate={onDebugUpdate}
					modelVisible={modelVisible}
				/>
			</Suspense>
		</Canvas>
	);
};

const styles = StyleSheet.create({
	canvas: {
		position: "absolute",
		width: "100%",
		height: "100%",
		zIndex: 1000,
		pointerEvents: "none",
	},
});

console.debug("[Preload] Starting model preload");
useGLTF.preload(assets.models.cyclist);
console.debug("[Preload] Model preload complete");