import { Server, Socket } from 'socket.io';
import { sequelize } from '../config/database';
import * as gameService from './game.service';
import { Player } from '../models/player.model';
import { GameSession, GameStatus } from '../models/game.model';
import { Quiz, QuizStatus } from '../models/quiz.model';
import { Question } from '../models/question.model';
import { Option } from '../models/option.model';
import { User } from '../models/user.model';

// In-memory object to manage server-side timers for each game
const gameTimers: { [pin: string]: NodeJS.Timeout } = {};

// In-memory object to track players who are ready for the first question
const readyPlayers: { [pin: string]: string[] } = {};

// In-memory object to track game states
const gameStates: { [pin: string]: 'waiting' | 'question' | 'leaderboard' | 'finished' } = {};

// In-memory queue for the matchmaking feature
interface WaitingPlayer {
  socketId: string;
  user: User;
}
const matchmakingQueue: WaitingPlayer[] = [];

export const initSocketService = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Link a user from the DB to this specific socket connection upon login/app start
    socket.on('authenticate', async (userId) => {
      try {
        const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
        if (user) {
          socket.data.user = user;
          console.log(`Socket ${socket.id} authenticated for user: ${user.name}`);
        } else {
          console.error(`Authentication failed: User with ID ${userId} not found`);
        }
      } catch (error) {
        console.error("Authentication error on socket:", error);
      }
    });

    // Event for an already-created player (like the host) to join a socket room
   socket.on('player_join_room', async ({ pin, nickname }) => {
  try {
    // --- LOGGING TO CONFIRM ---
    console.log(`[HOST-JOIN] Host '${nickname}' is joining room for PIN: ${pin}`);
    socket.join(pin);
    socket.data.pin = pin;
    socket.data.nickname = nickname; // Also save the nickname here

    const gameSession = await GameSession.findOne({ where: { pin } });
    if (!gameSession) {
      console.error(`[HOST-JOIN] Game session not found for PIN: ${pin}`);
      return;
    }

    // --- THIS IS THE CRITICAL FIX ---
    // Find the Player record for the host in this game session.
    const hostPlayer = await Player.findOne({
      where: {
        gameSessionId: gameSession.id,
        nickname: nickname
      }
    });

    if (hostPlayer) {
      // Attach the player's ID to the socket connection.
      socket.data.playerId = hostPlayer.id;
      console.log(`[HOST-JOIN] Successfully linked host socket to Player ID: ${hostPlayer.id}`);
    } else {
      console.error(`[HOST-JOIN] CRITICAL: Could not find player record for host '${nickname}' in game ${pin}.`);
      // You might want to emit an error back to the client here.
    }
    // --- END OF THE FIX ---

    // The rest of the function is the same.
    const players = await Player.findAll({
      where: { gameSessionId: gameSession.id },
      order: [['score', 'DESC']]
    });
    io.to(pin).emit('update_player_list', players);
    console.log(`Player list sent to room ${pin}:`, players.map(p => `${p.nickname}: ${p.score}`));

  } catch (error) {
    console.error(`Error in host 'player_join_room' for PIN ${pin}:`, error);
  }
});

    // Event for a new player joining a game, which creates a player record
    socket.on('player_join', async ({ pin, nickname }, callback) => {
      try {
        console.log(`Player ${nickname} attempting to join game with PIN: ${pin}`);
        const { player, gameSession } = await gameService.joinGameSession(pin, nickname);
        
        socket.join(pin);
        socket.data.playerId = player.id;
        socket.data.pin = pin;
        socket.data.nickname = nickname;
        
        const players = await Player.findAll({ 
          where: { gameSessionId: gameSession.id },
          order: [['score', 'DESC']]
        });
        
        io.to(pin).emit('update_player_list', players);
        console.log(`Player ${nickname} joined successfully. Updated player list:`, players.map(p => `${p.nickname}: ${p.score}`));
        
        callback({ success: true, playerId: player.id });
      } catch (error: any) {
        console.error(`Error joining game for ${nickname}:`, error.message);
        callback({ success: false, message: error.message });
      }
    });

    // Event for the host to start the game
    socket.on('start_game', async ({ pin }) => {
      try {
        console.log(`Host attempting to start game with PIN: ${pin}`);
        const game = await GameSession.findOne({ where: { pin, status: GameStatus.LOBBY } });
        
        if (game) {
          game.status = GameStatus.ACTIVE;
          await game.save();
          readyPlayers[pin] = []; // Initialize ready players for this game
          gameStates[pin] = 'waiting'; // Initialize game state
          
          console.log(`--- [Backend] Game ${pin} started. Broadcasting 'game_started'. Waiting for players to be ready. ---`);
          io.to(pin).emit('game_started');
        } else {
          console.error(`Cannot start game: Game ${pin} not found or not in lobby status`);
          io.to(pin).emit('game_error', { message: 'Game cannot be started. It may have already started or finished.' });
        }
      } catch (error) {
        console.error(`Error starting game ${pin}:`, error);
        io.to(pin).emit('game_error', { message: 'Failed to start game due to server error.' });
      }
    });

    // Event for clients to announce they are on the battle screen and ready for questions
    socket.on('player_ready_for_question', async ({ pin }) => {
      try {
        if (!readyPlayers[pin]) {
          console.log(`Ready players not initialized for PIN ${pin}, initializing...`);
          readyPlayers[pin] = [];
        }

        const socketId = socket.id;
        if (!readyPlayers[pin].includes(socketId)) {
          readyPlayers[pin].push(socketId);
        }

        console.log(`--- [Backend] Player ${socketId} (${socket.data.nickname || 'Unknown'}) is ready for PIN ${pin}. Total ready: ${readyPlayers[pin].length} ---`);

        const totalPlayers = await Player.count({
          include: [{
            model: GameSession,
            as: 'gameSession',
            where: { pin }
          }]
        });

        console.log(`Total players in game ${pin}: ${totalPlayers}, Ready players: ${readyPlayers[pin].length}`);

        // If all players have confirmed they are ready, send the first question
        if (readyPlayers[pin].length >= totalPlayers && gameStates[pin] === 'waiting') {
          console.log(`--- [Backend] All players are ready for PIN ${pin}. Sending first question. ---`);
          gameStates[pin] = 'question';
          sendNextQuestion(io, pin);
          delete readyPlayers[pin]; // Clean up ready players tracking
        }
      } catch (error) {
        console.error(`Error handling player ready for PIN ${pin}:`, error);
      }
    });

    // Event for a player submitting an answer
// Event for a player submitting an answer
socket.on('submit_answer', async ({ pin, questionId, optionId }) => {
  try {
    // --- LOG 2: WHAT DID WE RECEIVE? ---
    console.log(`[BACKEND-RECEIVE] Received from client:`, { pin, questionId, optionId });
    
    const player = await Player.findByPk(socket.data.playerId);
    if (!player) {
      console.error('[BACKEND-ERROR] Player not found for ID:', socket.data.playerId);
      return;
    }

    // --- LOG 3: WHAT ARE WE LOOKING FOR? ---
    console.log(`[BACKEND-LOOKUP] Searching for correct option where questionId = ${questionId} and isCorrect = true`);
    const correctOption = await Option.findOne({ 
      where: { 
        questionId: questionId,
        isCorrect: true 
      } 
    });

    // --- LOG 4: WHAT DID WE FIND? ---
    if (!correctOption) {
      console.error(`[BACKEND-ERROR] CRITICAL: No correct option found in DB for questionId: ${questionId}`);
      // Let's find out what options DO exist for this question, to be sure.
      const allOptionsForThisQuestion = await Option.findAll({ where: { questionId: questionId }});
      console.log(`[BACKEND-DEBUG] Options that DO exist for questionId ${questionId}:`, JSON.stringify(allOptionsForThisQuestion, null, 2));
      return; // Stop here if we can't find the answer
    }
    console.log(`[BACKEND-FOUND] The correct option is: ID ${correctOption.id}, Text: "${correctOption.text}"`);

    const isCorrect = (optionId === correctOption.id);
    let score = isCorrect ? 1000 : 0;
    
    // --- LOG 5: WHAT IS THE VERDICT? ---
    console.log(`[BACKEND-VERDICT] Submitted optionId (${optionId}) vs Correct optionId (${correctOption.id}). Correct? ${isCorrect}`);

    if (isCorrect) {
      player.score += score;
      await player.save();
    }
    
    const resultPayload = {
      isCorrect,
      scoreAwarded: score,
      correctOptionId: correctOption.id,
      playerScore: player.score,
    };

    // --- LOG 6: WHAT ARE WE SENDING BACK? ---
    console.log('[BACKEND-SEND] Emitting answer_result:', resultPayload);
    socket.emit('answer_result', resultPayload);
    
    // Update player list for everyone else
    // ... rest of the function
  } catch (error) {
    console.error('[BACKEND-FATAL] Error in submit_answer:', error);
  }
});
    // Matchmaking events
    socket.on('find_match', async () => {
      try {
        if (!socket.data.user) {
          socket.emit('matchmaking_error', { message: 'User not authenticated' });
          return;
        }

        // Check if user is already in queue
        const existingIndex = matchmakingQueue.findIndex(p => p.user.id === socket.data.user.id);
        if (existingIndex > -1) {
          socket.emit('matchmaking_error', { message: 'Already in matchmaking queue' });
          return;
        }

        // Add player to queue
        matchmakingQueue.push({
          socketId: socket.id,
          user: socket.data.user
        });

        console.log(`Player ${socket.data.user.name} joined matchmaking queue. Queue size: ${matchmakingQueue.length}`);

        // If we have 2 or more players, create a match
        if (matchmakingQueue.length >= 2) {
          const player1 = matchmakingQueue.shift()!;
          const player2 = matchmakingQueue.shift()!;

          // Create a quick match game session
          // You'll need to implement this in your game service
          // const matchPin = await gameService.createQuickMatch([player1.user, player2.user]);
          
          // For now, just notify players that match is found
          io.to(player1.socketId).emit('match_found', { 
            opponent: player2.user.name,
            // pin: matchPin 
          });
          io.to(player2.socketId).emit('match_found', { 
            opponent: player1.user.name,
            // pin: matchPin 
          });

          console.log(`Match created between ${player1.user.name} and ${player2.user.name}`);
        } else {
          socket.emit('matchmaking_status', { message: 'Searching for opponent...', queueSize: matchmakingQueue.length });
        }
      } catch (error) {
        console.error('Error in matchmaking:', error);
        socket.emit('matchmaking_error', { message: 'Matchmaking failed' });
      }
    });

    socket.on('cancel_matchmaking', () => {
      try {
        const index = matchmakingQueue.findIndex(p => p.socketId === socket.id);
        if (index > -1) {
          const removed = matchmakingQueue.splice(index, 1)[0];
          console.log(`Player ${removed.user.name} left matchmaking queue. Queue size: ${matchmakingQueue.length}`);
          socket.emit('matchmaking_cancelled');
        }
      } catch (error) {
        console.error('Error cancelling matchmaking:', error);
      }
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      try {
        // Remove from ready players if present
        for (const pin in readyPlayers) {
          const index = readyPlayers[pin].indexOf(socket.id);
          if (index > -1) {
            readyPlayers[pin].splice(index, 1);
            console.log(`Removed disconnected player from ready list for PIN ${pin}`);
          }
        }

        // Remove from matchmaking queue if present
        const matchmakingIndex = matchmakingQueue.findIndex(p => p.socketId === socket.id);
        if (matchmakingIndex > -1) {
          const removed = matchmakingQueue.splice(matchmakingIndex, 1)[0];
          console.log(`Removed ${removed.user.name} from matchmaking queue due to disconnect`);
        }

        // Notify room if player was in a game
        if (socket.data.pin && socket.data.nickname) {
          socket.to(socket.data.pin).emit('player_disconnected', {
            nickname: socket.data.nickname,
            playerId: socket.data.playerId
          });
        }
      } catch (error) {
        console.error('Error handling disconnect cleanup:', error);
      }
    });

    // Handle when player leaves a game room
    socket.on('leave_game', ({ pin }) => {
      try {
        console.log(`Player ${socket.data.nickname || socket.id} leaving game ${pin}`);
        socket.leave(pin);
        
        // Clean up socket data
        delete socket.data.playerId;
        delete socket.data.pin;
        delete socket.data.nickname;
        
        // Notify other players
        socket.to(pin).emit('player_left', {
          socketId: socket.id
        });
      } catch (error) {
        console.error(`Error handling leave game for PIN ${pin}:`, error);
      }
    });
  });
};

/**
 * Manages the game progression by sending questions and handling timers.
 */
const sendNextQuestion = async (io: Server, pin: string) => {
  // Clear any existing timer for this game
  if (gameTimers[pin]) {
    clearTimeout(gameTimers[pin]);
    delete gameTimers[pin];
  }

  try {
    console.log(`--- [Backend] Processing next question for PIN ${pin} ---`);
    
    const game = await GameSession.findOne({ 
      where: { pin }, 
      include: [{ 
        model: Quiz, 
        as: 'quiz',
        include: [{ 
          model: Question, 
          as: 'questions',
          include: [{ model: Option, as: 'options' }]
        }] 
      }]
    });

    if (!game || !game.quiz) {
      console.error(`--- [Backend] ERROR: Game or Quiz not found for PIN ${pin}.`);
      io.to(pin).emit('game_error', { message: 'Game session not found.' });
      return;
    }

    if (!game.quiz.questions || game.quiz.questions.length === 0) {
      console.error(`--- [Backend] ERROR: Quiz "${game.quiz.title}" has no questions!`);
      io.to(pin).emit('game_error', { message: 'This quiz has no questions and cannot be played.' });
      return;
    }

    // Initialize currentQuestionIndex if not set
    if (typeof game.currentQuestionIndex !== 'number') {
      game.currentQuestionIndex = -1;
    }

    // Move to next question
    game.currentQuestionIndex++;
    await game.save();

    const questions = game.quiz.questions.sort((a, b) => a.id - b.id);
    console.log(`--- [Backend] Question ${game.currentQuestionIndex + 1} of ${questions.length} for PIN ${pin} ---`);

    // Check if game is finished
    if (game.currentQuestionIndex >= questions.length) {
      console.log(`--- [Backend] Game ${pin} finished. Sending final results. ---`);
      
      game.status = GameStatus.FINISHED;
      await game.save();

      const finalPlayers = await Player.findAll({ 
        where: { gameSessionId: game.id }, 
        order: [['score', 'DESC']] 
      });
      
      io.to(pin).emit('game_over', { players: finalPlayers });
      console.log(`Final results sent for PIN ${pin}:`, finalPlayers.map(p => `${p.nickname}: ${p.score}`));

      // Clean up timers
      if (gameTimers[pin]) {
        clearTimeout(gameTimers[pin]);
        delete gameTimers[pin];
      }
      
      return;
    }

    const currentQuestion = questions[game.currentQuestionIndex];
    const questionForPlayers = {
      id: currentQuestion.id,
      text: currentQuestion.text,
      options: currentQuestion.options.map(o => ({ id: o.id, text: o.text })),
      questionNumber: game.currentQuestionIndex + 1,
      totalQuestions: questions.length
    };

    console.log(`--- [Backend] Emitting 'new_question' #${questionForPlayers.questionNumber} to room ${pin}. ---`);
    io.to(pin).emit('new_question', questionForPlayers);

    const QUESTION_DURATION = 15; // seconds
    console.log(`--- [Backend] Starting timer for question #${questionForPlayers.questionNumber}, duration: ${QUESTION_DURATION}s ---`);
    io.to(pin).emit('question_timer', { duration: QUESTION_DURATION });

    // Set timer to show leaderboard after the full duration
    gameTimers[pin] = setTimeout(async () => {
      try {
        console.log(`--- [Backend] Timer fired for question #${questionForPlayers.questionNumber}, PIN: ${pin}. Showing leaderboard. ---`);

        const players = await Player.findAll({ 
          where: { gameSessionId: game.id }, 
          order: [['score', 'DESC']] 
        });
        
        io.to(pin).emit('show_leaderboard', players);
        console.log(`Leaderboard sent for PIN ${pin}:`, players.map(p => `${p.nickname}: ${p.score}`));

        // Wait 10 seconds before next question
        gameTimers[pin] = setTimeout(() => {
          sendNextQuestion(io, pin);
        }, 10000);
        
      } catch (error) {
        console.error("Error in leaderboard timeout:", error);
        io.to(pin).emit('game_error', { message: 'Error processing game progression.' });
      }
    }, QUESTION_DURATION * 1000);

  } catch (error) {
    console.error(`--- [Backend] CRITICAL ERROR in sendNextQuestion for PIN ${pin}:`, error);
    io.to(pin).emit('game_error', { message: 'A server error occurred. The game cannot continue.' });
    
    // Clean up on error
    if (gameTimers[pin]) {
      clearTimeout(gameTimers[pin]);
      delete gameTimers[pin];
    }
  }
};