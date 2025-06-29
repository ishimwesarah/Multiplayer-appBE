// import { Request, Response, NextFunction } from 'express';
// import { UserRole } from '../models/user.model';

// export const requireRole = (role: UserRole) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }

//     if (req.user.role !== role && req.user.role !== UserRole.ADMIN) {
//       return res.status(403).json({ error: 'Insufficient permissions' });
//     }

//     next();
//   };
// };