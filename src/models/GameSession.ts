import { Landmark } from "./Landmark";


export class GameSession {
    constructor(
        public id: string,
        public name: string,
        public latitude: number,
        public longitude: number,
        public extrachallengeTime: number,
        public landmarks: Landmark[],
        public uniqueLandmark: Landmark,
        public completed: boolean = false, // Inizializzata come non completata
        public allLandmarksFound: boolean = false, // Inizializzata come non trovati tutti
        public picture: string,
    ) {}
}