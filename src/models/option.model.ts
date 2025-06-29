// src/models/Option.model.ts
import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import { Question } from "./question.model";

@Table({ timestamps: true })
export class Option extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @Column
  text!: string;

  @Column
  isCorrect!: boolean;

  @ForeignKey(() => Question)
  @Column
  questionId!: number;

  @BelongsTo(() => Question, {
  onDelete: 'CASCADE' 
})
  question!: Question;
}
