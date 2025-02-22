import { GameSession } from "@/models/GameSession";
import { Landmark } from "@/models/Landmark";

import tosaerba from "@assets/images/tosaerba-1.png";
import amedeo from "@assets/images/amedeo.png";
import angelo from "@assets/images/angelo.png";
import micio from "@assets/images/Micio.png";
import pescatore from "@assets/images/pescatore.png";
import fountainImage from "@assets/images/fountain.png";
import loverBenchImage from "@assets/images/lovers_bench.png";
import bridgeImage from "@assets/images/bridge.png";
import clockTowerImage from "@assets/images/clock_tower.png";
import borgoMedievaleImage from "@assets/images/borgomedievale.png";
import frecciarossaImage from "@assets/images/frecciarossapolito.png";
import parcoRuffiniImage from "@assets/images/parcoruffini.png";
import parcoDelValentinoImage from "@assets/images/parcodelvalentino.png";
import lift from "@assets/images/lift.png";
import tic_tac_toe from "@assets/images/tic_tac_toe.png";
import watering_trough from "@assets/images/watering_trough.png";
import auleNImage from "@assets/images/auleN.png";
import { Coordinates } from "@/types/map";

// Funzione per calcolare l'offset in metri
const getOffsetCoordinates = (
  latitude: number,
  longitude: number,
  metersLat: number,
  metersLon: number
) => {
  const latOffset = metersLat / 111320; // 1° latitudine ≈ 111.32 km
  const lonOffset =
    metersLon / (111320 * Math.cos(latitude * (Math.PI / 180))); // 1° longitudine dipende dalla latitudine
  return { latitude: latitude + latOffset, longitude: longitude + lonOffset };
};

// Hook per generare GameSession e Landmark dinamici
export const generateDynamicGameSessions = (location: Coordinates) => {
  if (!location) {
    return { landmarks: [], gameSessions: [] };
  }

  const { latitude: userLatitude, longitude: userLongitude } = location;

  // **Coordinate delle GameSession**
  const gameSessionCoordinates = [
    getOffsetCoordinates(userLatitude, userLongitude, 10, 10), // GameSession 1
    getOffsetCoordinates(userLatitude, userLongitude, 5, 5), // GameSession 2
    getOffsetCoordinates(userLatitude, userLongitude, -7, 8), // GameSession 3
  ];

  // **Landmark associati alle GameSession**
  const allLandmarks = [
    // Landmark associati a GameSession 1
    new Landmark(
      "1",
      "Watering Trough",
      45.0650791, 7.6570358,
      watering_trough,
      "I held water for animals to share. Now I stand with empty stare. Arms raised high, rusted and old.",
      "It was used by animals to drink. It usually made of metal. Look for something long and hollow that holds water."    ),

    new Landmark(
      "2",
      "Lift",
      45.0648373, 7.6567562,
      lift,
      "It goes up, it goes down, Without legs, it moves around. With buttons to press and doors that slide.",
      "It travels between levels but never moves sideways. People step inside to reach higher or lower places effortlessly."
    ),
   

    // Landmark associati a GameSession 2
    new Landmark(
      "3",
      "Micio nel laghetto",
      45.0499534, 7.6834854,
      micio,
      "Metal paws on a rocky bed, By the stream where fish are fed.",
      "Look near the flowing water, where a curious cat stands still."
    ),
    new Landmark(
      "4",
      "La custode del silenzio",
      45.0497218, 7.6843334,
      tosaerba,
      "In a field where time stands still, A ghostly gardener tends to her will. With a hat and a push of care,She trims the earth with tools of air.",
      "She’s not alive, yet she mows the ground.Her frame is light, yet firmly bound."
    ),

    // Landmark unici
    new Landmark(
      "100",
      "Tic Tac Toe",
      45.0650990, 7.6568977,
      tic_tac_toe,
      "It lies on the ground, both wide and round, With lines that cross, a grid is found. It may remind you of a classic game, Where X and O seek winning fame.",
      "It looks like a giant version of a game where players try to line up three symbols in a row. Look at the grid pattern on the ground."
    ),
    new Landmark(
      "200",
      "Monumento ad Amedeo di Savoia",
      45.050144528493085, 7.682334397285017,
      amedeo,
      "On a steed he rises, a hero of might, Leading the charge, a noble knight. With his sword raised high, through history’s tide.",
      "He was a prince and a king, a duke in name. His monument stands in a city’s embrace"
    ),
  ];

  // **Creazione delle GameSession**
  const gameSessions = [
    new GameSession(
      "1",
      "N - Session 1",
      gameSessionCoordinates[0].latitude,
      gameSessionCoordinates[0].longitude,
      30,
      [allLandmarks[0], allLandmarks[1]], // Landmark associati
      allLandmarks[4], // Landmark unico
      false,
      false,
      auleNImage
    ),
    new GameSession(
      "2",
      "N - Session 2",
      gameSessionCoordinates[1].latitude,
      gameSessionCoordinates[1].longitude,
      60,
      [allLandmarks[2], allLandmarks[3]], // Landmark associati
      allLandmarks[5], // Landmark unico
      false,
      false,
      auleNImage
    ),
    new GameSession(
      "3",
      "N - Session 3",
      gameSessionCoordinates[2].latitude,
      gameSessionCoordinates[2].longitude,
      60,
      [allLandmarks[0], allLandmarks[1]], // Landmark associati
      allLandmarks[4], // Landmark unico
      false,
      false,
      auleNImage
    ),
  ];

  return { landmarks: allLandmarks, gameSessions };
};
