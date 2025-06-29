// import { Request, Response } from 'express';
// import { UserService } from '../services/user.service';

// export class UserController {
//   private userService = new UserService();

//   async getAllUsers(req: Request, res: Response) {
//     try {
//       const users = await this.userService.getAllUsers();
//       res.json(users);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }

//   async getUserById(req: Request, res: Response) {
//     try {
//       const user = await this.userService.getUserById(req.params.id);
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
//       res.json(user);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }

//   async updateUser(req: Request, res: Response) {
//     try {
//       const user = await this.userService.updateUser(req.params.id, req.body);
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
//       res.json(user);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }

//   async deleteUser(req: Request, res: Response) {
//     try {
//       const success = await this.userService.deleteUser(req.params.id);
//       if (!success) {
//         return res.status(404).json({ error: 'User not found' });
//       }
//       res.json({ success: true });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// }