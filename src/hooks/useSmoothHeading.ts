import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

const HEADING_UPDATE_INTERVAL = 50;
const HEADING_LERP_FACTOR = 0.4;
const MIN_HEADING_CHANGE = 5;

export const useSmoothHeading = (rawHeading: number) => {
    const [smoothHeading, setSmoothHeading] = useState(rawHeading);
    const lastUpdateTime = useRef(0);
    const lastHeading = useRef(rawHeading);

    useEffect(() => {
        const currentTime = Date.now();
        
        if (currentTime - lastUpdateTime.current < HEADING_UPDATE_INTERVAL) {
            return;
        }

        const updateHeading = () => {
            // Normalize both headings to 0-360 range first
            const normalizedRaw = ((rawHeading % 360) + 360) % 360;
            const normalizedLast = ((lastHeading.current % 360) + 360) % 360;

            // Calculate shortest delta between angles
            let delta = normalizedRaw - normalizedLast;
            
            // Ensure we take shortest path around circle
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;

            // Skip tiny changes
            if (Math.abs(delta) < MIN_HEADING_CHANGE) {
                return;
            }

            // Calculate target ensuring shortest path
            const target = lastHeading.current + delta;

            // Lerp towards target
            const newHeading = THREE.MathUtils.lerp(
                lastHeading.current,
                target,
                HEADING_LERP_FACTOR
            );

            // Final normalization
            const normalizedHeading = ((newHeading % 360) + 360) % 360;
            
            lastHeading.current = normalizedHeading;
            setSmoothHeading(normalizedHeading);
        };

        updateHeading();
        lastUpdateTime.current = currentTime;
    }, [rawHeading]);

    return smoothHeading;
};