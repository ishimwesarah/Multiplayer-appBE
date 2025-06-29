// import { Request, Response } from 'express';
// import { User } from '../models/user.model';
// import { AppDataSource } from '../config/database';

// export class AdminController {
//   private userRepository = AppDataSource.getRepository(User);

//   async getAllUsers(req: Request, res: Response): Promise<Response> {
//     try {
//       const users = await this.userRepository.find();
//       return res.json(users);
//     } catch (error) {
//       return res.status(500).json({ error: error.message });
//     }
//   }

//   async promoteToCreator(req: Request, res: Response): Promise<Response> {
//     try {
//       const { userId } = req.params;
//       await this.userRepository.update(userId, { role: 'creator' });
//       return res.json({ success: true });
//     } catch (error) {
//       return res.status(500).json({ error: error.message });
//     }
//   }

//   async demoteToPlayer(req: Request, res: Response): Promise<Response> {
//     try {
//       const { userId } = req.params;
//       await this.userRepository.update(userId, { role: 'player' });
//       return res.json({ success: true });
//     } catch (error) {
//       return res.status(500).json({ error: error.message });
//     }
//   }
// }