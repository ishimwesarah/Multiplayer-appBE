// src/controllers/game.controller.ts
import { Response } from 'express';
import * as gameService from '../services/game.service';
import { AuthRequest } from '../middlewares/auth.middleware'; // Import AuthRequest

// --- MODIFIED FUNCTION ---
export const createGame = async (req: AuthRequest, res: Response) => {
  const { quizId } = req.params;
  
  // Get host details from the authenticated user
  const hostUserId = req.user!.id;
  const hostNickname = req.user!.name;

  try {
    // Pass the host's details to the service
    const gameSession = await gameService.createGameSession(Number(quizId), hostNickname, hostUserId);
    
    // The PIN is what the creator shares with players
    res.status(201).json({ pin: gameSession.pin });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create game', error: (error as Error).message });
  }
};
// export const joinGame = async (req: Request, res: Response) => {
//   const { pin, name } = req.body;

//   try {
//     const { player, gameSession } = await gameService.joinGameSession(pin, name);
//     res.status(200).json({ success: true, player, gameSession });
//   } catch (error: any) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// export const getGameResults = async (req: Request, res: Response) => {
//   const { pin } = req.params;

//   try {
//     const players = await Player.findAll({
//       include: ['gameSession'],
//       where: { '$gameSession.pin$': pin },
//       order: [['score', 'DESC']],
//     });

//     res.status(200).json({ players, top3: players.slice(0, 3) });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };