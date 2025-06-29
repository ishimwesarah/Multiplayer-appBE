// src/models/Question.model.ts
import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  HasMany,
} from "sequelize-typescript";
import { Quiz } from "./quiz.model";
import { Option } from "./option.model";

@Table({ timestamps: true })
export class Question extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @Column
  text!: string;

  @ForeignKey(() => Quiz)
  @Column
  quizId!: number;

  @BelongsTo(() => Quiz, {
  onDelete: 'CASCADE' 
})
  quiz!: Quiz;

  @HasMany(() => Option)
  options!: Option[];
}
