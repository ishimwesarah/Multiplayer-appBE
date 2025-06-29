// src/models/Player.model.ts
import { Table, Column, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { GameSession } from './game.model';

@Table({ timestamps: true })
export class Player extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @Column
  nickname!: string;

  @Column({ defaultValue: 0 })
  score!: number;

  @ForeignKey(() => GameSession)
  @Column
  gameSessionId!: number;

  @BelongsTo(() => GameSession)
  gameSession!: GameSession;
}