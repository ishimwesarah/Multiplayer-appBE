// src/models/GameSession.model.ts
import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  HasMany,
  DataType,
} from "sequelize-typescript";
import { Quiz } from "./quiz.model";
import { Player } from "./player.model";

export enum GameStatus {
  LOBBY = "LOBBY",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

@Table({ timestamps: true })
export class GameSession extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ unique: true })
  pin!: string; // The 6-digit game PIN

  @ForeignKey(() => Quiz)
  @Column
  quizId!: number;

  @BelongsTo(() => Quiz, {
  onDelete: 'CASCADE' // <-- ADD THIS
})
  quiz!: Quiz;

  @Column({
    type: DataType.ENUM(...Object.values(GameStatus)),
    defaultValue: GameStatus.LOBBY,
  })
  status!: GameStatus;

  @Column({ defaultValue: -1 })
  currentQuestionIndex!: number;

  @HasMany(() => Player)
  players!: Player[];
}
