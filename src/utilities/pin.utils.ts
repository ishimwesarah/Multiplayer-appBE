// src/utils/pin.utils.ts
import { GameSession } from '../models/game.model';

// Generates a unique 6-digit numeric PIN
export const generateUniquePin = async (): Promise<string> => {
  let pin;
  let isUnique = false;
  while (!isUnique) {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
    const existingGame = await GameSession.findOne({ where: { pin, status: 'LOBBY' } });
    if (!existingGame) {
      isUnique = true;
    }
  }
  return pin!;
};