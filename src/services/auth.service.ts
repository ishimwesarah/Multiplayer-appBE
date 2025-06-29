// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { JWT_SECRET, JWT_EXPIRES_IN } from '../utilities/constants';
// import { User } from '../models/user.model';
// import { AppDataSource } from '../config/database';

// export class AuthService {
//   private userRepository = AppDataSource.getRepository(User);

//   async register(email: string, password: string, name: string, role: string) {
//     const existingUser = await this.userRepository.findOne({ where: { email } });
//     if (existingUser) {
//       throw new Error('Email already in use');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = this.userRepository.create({
//       email,
//       password: hashedPassword,
//       name,
//       role,
//     });

//     await this.userRepository.save(user);
//     return user;
//   }

//   async login(email: string, password: string) {
//     const user = await this.userRepository.findOne({ where: { email } });
//     if (!user) {
//       throw new Error('Invalid credentials');
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       throw new Error('Invalid credentials');
//     }

//     const token = jwt.sign(
//       { id: user.id, email: user.email, role: user.role },
//       JWT_SECRET,
//       { expiresIn: JWT_EXPIRES_IN }
//     );

//     return { user, token };
//   }

//   async getUserById(id: string) {
//     return this.userRepository.findOne({ where: { id } });
//   }
// }