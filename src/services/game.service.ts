import { GameSession } from '../models/game.model';
import { Player } from '../models/player.model';
import { generateUniquePin } from '../utilities/pin.utils';
import { sequelize } from '../config/database';

// --- MODIFIED FUNCTION ---
// It now requires host details to create the first player.
export const createGameSession = async (quizId: number, hostNickname: string, hostUserId: number) => {
  const t = await sequelize.transaction();
  try {
    const pin = await generateUniquePin();
    
    // 1. Create the game session
    const gameSession = await GameSession.create({ quizId, pin }, { transaction: t });

    // 2. Immediately create the host as the first player in the session
    await Player.create({
      nickname: hostNickname,
      gameSessionId: gameSession.id,
      // You could link the player to a user ID if you add the column to the Player model
      // userId: hostUserId 
    }, { transaction: t });

    await t.commit();
    return gameSession;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const joinGameSession = async (pin: string, nickname: string) => {
  const gameSession = await GameSession.findOne({ where: { pin, status: 'LOBBY' } });
  if (!gameSession) {
    throw new Error('Game not found or has already started');
  }

  const existingPlayer = await Player.findOne({ where: { nickname, gameSessionId: gameSession.id } });
  if (existingPlayer) {
      throw new Error('This nickname is already taken for this game.');
  }

  const player = await Player.create({ nickname, gameSessionId: gameSession.id });
  return { player, gameSession };
};