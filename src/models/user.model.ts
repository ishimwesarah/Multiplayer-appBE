// src/models/User.model.ts
import {
  Table,
  Column,
  Model,
  HasMany,
  BeforeCreate,
  
} from "sequelize-typescript";
import { DataType } from "sequelize-typescript"

import bcrypt from "bcryptjs";
import { Quiz } from "./quiz.model";

export enum UserRole {
  ADMIN = "ADMIN",
  CREATOR = "CREATOR",
}

@Table({ timestamps: true })
export class User extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @Column
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column
  password!: string;

  @Column({ type: "VARCHAR", defaultValue: UserRole.CREATOR })
  role!: UserRole;
  @Column({ defaultValue: false })
isVerified!: boolean;

@Column({ 
  allowNull: true, 
  type: DataType.STRING(64)  // or DataType.TEXT if token might be longer
})
emailToken!: string | null;
  @Column({ 
    type: DataType.STRING, 
    allowNull: false,
    defaultValue: '🧠' // A default avatar emoji
  })
  avatar!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1200 // Default ELO rating
  })
  eloRating!: number;


  @HasMany(() => Quiz)
  quizzes!: Quiz[];

  // Hook to hash password before creating user
  @BeforeCreate
  static async hashPassword(instance: User) {
    if (instance.password) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  // Instance method to compare passwords
  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
