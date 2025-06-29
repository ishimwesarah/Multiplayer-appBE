// src/config/db.config.ts
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { User } from '../models/user.model';
import { Quiz } from '../models/quiz.model';
import { Question } from '../models/question.model';
import { Option } from '../models/option.model';
import { GameSession } from '../models/game.model';
import { Player } from '../models/player.model';
import { Category } from '../models/category.model';

dotenv.config();


const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: DB_HOST!,
  port: Number(DB_PORT!),
  username: DB_USER!,
  password: DB_PASSWORD!,
  database: DB_NAME!,
  logging: false,
  models: [User, Quiz, Question, Option, GameSession, Player, Category],
});

const seedDefaultCategories = async () => {
  const defaultCategories = [
    'Technology',
    'Science',
    'History',
    'Geography',
    'Movies',
    'Music',
    'Art'
  ];

  try {
    for (const categoryName of defaultCategories) {
      await Category.findOrCreate({
        where: { name: categoryName },
      });
    }
    
  } catch (error) {
    console.error('Error seeding default categories:', error);
  }
};


export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('PostgreSQL Database connected successfully.');

    await seedDefaultCategories();
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};