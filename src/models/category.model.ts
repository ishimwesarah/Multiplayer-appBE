// src/models/Category.model.ts
import { Table, Column, Model, HasMany, Unique } from 'sequelize-typescript';
import { Quiz } from './quiz.model';

@Table({ timestamps: true })
export class Category extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ unique: true })
  name!: string;

  @HasMany(() => Quiz)
  quizzes!: Quiz[];
}