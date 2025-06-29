// import { User } from '../models/user.model';


// export class UserService {
//   private userRepository = AppDataSource.getRepository(User);

//   async getAllUsers() {
//     return this.userRepository.find();
//   }

//   async getUserById(id: string) {
//     return this.userRepository.findOne({ where: { id } });
//   }

//   async updateUser(id: string, updates: Partial<User>) {
//     await this.userRepository.update(id, updates);
//     return this.userRepository.findOne({ where: { id } });
//   }

//   async deleteUser(id: string) {
//     const result = await this.userRepository.delete(id);
//     return result.affected > 0;
//   }
// }


// export const findAllUsers = () => {
//   return User.findAll({
//     attributes: { exclude: ['password'] }, // Never send back passwords
//     order: [['createdAt', 'DESC']],
//   });
// };

// /**
//  * Get a single user by their ID.
//  */
// export const findUserById = (userId: number) => {
//   return User.findByPk(userId, {
//     attributes: { exclude: ['password'] },
//   });
// };

// /**
//  * Update a user's details.
//  * @param userId The ID of the user to update.
//  * @param data The data to update (e.g., name, email, role).
//  */
// export const updateUserById = async (userId: number, data: { name?: string; email?: string; role?: UserRole }) => {
//   const user = await findUserById(userId);
//   if (!user) {
//     throw new Error('User not found.');
//   }

//   // Update only the provided fields
//   if (data.name) user.name = data.name;
//   if (data.email) user.email = data.email;
//   if (data.role) user.role = data.role;

//   await user.save();
//   return user;
// };

// /**
//  * Delete a user by their ID.
//  */
// export const deleteUserById = async (userId: number) => {
//   const user = await findUserById(userId);
//   if (!user) {
//     throw new Error('User not found.');
//   }
//   await user.destroy();
// };